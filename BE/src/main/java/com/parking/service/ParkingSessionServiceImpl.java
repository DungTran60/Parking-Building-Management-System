package com.parking.service;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.LostTicketCheckoutRequestDto;
import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.ParkingSessionResponseDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Pricing;
import com.parking.entity.PricingTimeUnit;
import com.parking.entity.SlotStatus;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PricingRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingSessionServiceImpl implements ParkingSessionService {

    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository    parkingSlotRepository;
    private final VehicleTypeRepository    vehicleTypeRepository;
    private final FeeCalculationService    feeCalculationService;
    private final PricingRepository        pricingRepository;

    /* ─────────────────────────────────────────────────────
       Check-in
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ParkingSessionResponseDto checkIn(CheckInRequestDto request) {
        // 1. Tìm loại xe
        VehicleType vehicleType = resolveVehicleType(request.getVehicleTypeId());

        // 2. Tìm slot trống phù hợp
        List<ParkingSlot> availableSlots = parkingSlotRepository
                .findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, vehicleType.getId());
        if (availableSlots.isEmpty()) {
            throw new IllegalStateException(
                    "Không còn slot đỗ xe trống phù hợp cho loại xe: " + vehicleType.getName());
        }
        ParkingSlot selectedSlot = availableSlots.get(0);

        // 3. Cập nhật slot thành OCCUPIED
        selectedSlot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(selectedSlot);

        // 4. Tạo mã QR vé gửi xe
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd-HHmmss"));
        String ticketCode = "QR-" + dateStr + "-"
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // 5. Tạo session mới
        ParkingSession session = ParkingSession.builder()
                .ticketCode(ticketCode)
                .plateNumber(request.getPlateNumber())
                .vehicleType(vehicleType)
                .slot(selectedSlot)
                .entryGate(request.getEntryGate())
                .checkInAt(LocalDateTime.now())
                .fee(0.0)
                .status("ACTIVE")
                .build();

        return convertToDto(parkingSessionRepository.save(session));
    }

    /* ─────────────────────────────────────────────────────
       Check-out thông thường
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ParkingSessionResponseDto checkOut(String query) {
        // Tìm session ACTIVE theo ticketCode hoặc plateNumber (không phân biệt hoa/thường)
        Optional<ParkingSession> sessionOpt =
                parkingSessionRepository.findByTicketCodeAndStatus(query, "ACTIVE");
        if (sessionOpt.isEmpty()) {
            sessionOpt = parkingSessionRepository
                    .findFirstActiveByPlateNumberIgnoreCase(query, "ACTIVE");
        }

        ParkingSession session = sessionOpt.orElseThrow(() ->
                new ResourceNotFoundException(
                        "Không tìm thấy lượt gửi xe đang hoạt động phù hợp với mã vé hoặc biển số: " + query));

        // Tính phí giờ
        LocalDateTime checkOutTime = LocalDateTime.now();
        BigDecimal fee = feeCalculationService.calculateFee(
                String.valueOf(session.getVehicleType().getId()),
                session.getCheckInAt(),
                checkOutTime);

        session.setCheckOutAt(checkOutTime);
        session.setFee(fee.doubleValue());
        session.setStatus("COMPLETED");
        ParkingSession saved = parkingSessionRepository.save(session);

        // Giải phóng slot
        ParkingSlot slot = session.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);

        return convertToDto(saved);
    }

    /* ─────────────────────────────────────────────────────
       Lấy session đang ACTIVE
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public ParkingSessionResponseDto getActiveSession() {
        return parkingSessionRepository.findAll().stream()
                .filter(s -> "ACTIVE".equals(s.getStatus()))
                .map(this::convertToDto)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lượt gửi xe nào đang hoạt động!"));
    }

    /* ─────────────────────────────────────────────────────
       Preview phí mất vé (chưa checkout, chỉ xem trước)
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public LostTicketFeeResponseDto previewLostTicketFee(String plateNumber) {
        if (plateNumber == null || plateNumber.isBlank()) {
            throw new IllegalArgumentException("Biển số xe không được để trống");
        }
        ParkingSession session = findActiveSessionByPlate(plateNumber);

        LocalDateTime now = LocalDateTime.now();
        VehicleType vehicleType = session.getVehicleType();

        // Phí giờ tính đến hiện tại
        BigDecimal parkingFee = feeCalculationService.calculateFee(
                String.valueOf(vehicleType.getId()),
                session.getCheckInAt(),
                now);

        // Phụ phí mất vé từ bảng giá
        BigDecimal lostTicketFee = resolveLostTicketFee(vehicleType);

        return LostTicketFeeResponseDto.builder()
                .vehicleType(vehicleType.getName())
                .plateNumber(session.getPlateNumber())
                .sessionId(session.getId())
                .checkInAt(session.getCheckInAt())
                .parkingFee(parkingFee)
                .lostTicketFee(lostTicketFee)
                .total(parkingFee.add(lostTicketFee))
                .build();
    }

    /* ─────────────────────────────────────────────────────
       Checkout xe mất vé
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ParkingSessionResponseDto lostTicketCheckout(LostTicketCheckoutRequestDto request) {
        // plateNumber đã được validate @NotBlank ở DTO, nhưng double-check để an toàn
        if (request.getPlateNumber() == null || request.getPlateNumber().isBlank()) {
            throw new IllegalArgumentException("Biển số xe không được để trống");
        }

        ParkingSession session = findActiveSessionByPlate(request.getPlateNumber());

        // Kiểm tra session đã ở trạng thái không thể checkout
        if (!"ACTIVE".equals(session.getStatus())) {
            throw new IllegalStateException(
                    "Lượt gửi xe này không ở trạng thái ACTIVE (trạng thái hiện tại: " + session.getStatus() + ")");
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        VehicleType vehicleType = session.getVehicleType();

        // Phí giờ + phụ phí mất vé
        BigDecimal parkingFee = feeCalculationService.calculateFee(
                String.valueOf(vehicleType.getId()),
                session.getCheckInAt(),
                checkOutTime);
        BigDecimal lostTicketFee = resolveLostTicketFee(vehicleType);
        BigDecimal totalFee = parkingFee.add(lostTicketFee);

        // Cập nhật session với status đặc biệt để phân biệt checkout thông thường
        session.setCheckOutAt(checkOutTime);
        session.setFee(totalFee.doubleValue());
        session.setStatus("LOST_TICKET");
        ParkingSession saved = parkingSessionRepository.save(session);

        // Giải phóng slot
        ParkingSlot slot = session.getSlot();
        if (slot == null) {
            throw new IllegalStateException(
                    "Không tìm thấy thông tin slot cho lượt gửi xe ID: " + session.getId());
        }
        slot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);

        return convertToDto(saved);
    }

    /* ─────────────────────────────────────────────────────
       Helpers
    ───────────────────────────────────────────────────── */

    /**
     * Tìm session ACTIVE theo biển số xe (không phân biệt hoa/thường).
     */
    private ParkingSession findActiveSessionByPlate(String plateNumber) {
        return parkingSessionRepository
                .findFirstActiveByPlateNumberIgnoreCase(plateNumber.trim(), "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lượt gửi xe đang hoạt động (ACTIVE) với biển số: " + plateNumber));
    }

    /**
     * Lấy phụ phí mất vé từ bảng Pricing (HOURLY, active=true).
     * Trả về BigDecimal.ZERO nếu không có cấu hình.
     */
    private BigDecimal resolveLostTicketFee(VehicleType vehicleType) {
        Optional<Pricing> pricingOpt = pricingRepository
                .findByVehicleTypeIdAndTimeUnit(vehicleType.getId(), PricingTimeUnit.HOURLY);
        if (pricingOpt.isPresent() && Boolean.TRUE.equals(pricingOpt.get().getActive())) {
            BigDecimal fee = pricingOpt.get().getLostTicketFee();
            return (fee != null) ? fee : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    private ParkingSessionResponseDto convertToDto(ParkingSession session) {
        return ParkingSessionResponseDto.builder()
                .id(String.valueOf(session.getId()))
                .ticketCode(session.getTicketCode())
                .plateNumber(session.getPlateNumber())
                .vehicleTypeId(String.valueOf(session.getVehicleType().getId()))
                .slotId(String.valueOf(session.getSlot().getId()))
                .entryGate(session.getEntryGate())
                .checkInAt(session.getCheckInAt())
                .checkOutAt(session.getCheckOutAt())
                .fee(session.getFee())
                .status(session.getStatus())
                .build();
    }

    /**
     * Resolve VehicleType từ string reference (numeric ID hoặc code string).
     */
    private VehicleType resolveVehicleType(String vehicleTypeRef) {
        try {
            Long numericId = Long.parseLong(vehicleTypeRef.trim());
            return vehicleTypeRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle type not found with ID: " + numericId));
        } catch (NumberFormatException e) {
            return vehicleTypeRepository.findByCode(vehicleTypeRef.trim().toUpperCase())
                    .or(() -> vehicleTypeRepository.findByCode(vehicleTypeRef.trim()))
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle type not found: " + vehicleTypeRef));
        }
    }
}
