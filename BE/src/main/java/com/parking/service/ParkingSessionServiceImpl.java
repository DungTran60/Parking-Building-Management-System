package com.parking.service;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.LostTicketCheckoutRequestDto;
import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.ParkingSessionResponseDto;
import com.parking.dto.SessionExceptionRequestDto;
import com.parking.dto.SessionNoteRequestDto;
import com.parking.dto.SessionStatusUpdateRequestDto;
import com.parking.entity.*;
import com.parking.exception.BadRequestException;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;
import com.parking.specification.ParkingSessionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.Principal;
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
    private final PricingRepository             pricingRepository;
    private final ReservationRepository         reservationRepository;
    private final ParkingSessionSpecification   parkingSessionSpecification;
    private final UserRepository                userRepository;
    private final ParkingSessionExceptionRepository parkingSessionExceptionRepository;
    private final AuthenticationService authenticationService;


    /* ─────────────────────────────────────────────────────
       Check-in
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ParkingSessionResponseDto checkIn(CheckInRequestDto request) {
        // 1. Chuẩn hóa và xác thực đầu vào
        String plateNumber = request.getPlateNumber().trim().toUpperCase();
        validateActiveSession(plateNumber);
        VehicleType vehicleType = validateVehicleType(request.getVehicleTypeId());

        // 2. Xử lý nghiệp vụ Đặt chỗ (Reservation) nếu có
        Reservation reservation = handleReservation(request, plateNumber, vehicleType);

        // 3. Xác định và khóa Slot đỗ xe
        ParkingSlot selectedSlot = lockAndGetParkingSlot(request, vehicleType, reservation);

        // 4. Tạo và lưu Session mới
        ParkingSession session = createParkingSession(request, plateNumber, vehicleType, selectedSlot, reservation);

        // 5. Cập nhật trạng thái Slot và Reservation
        updateEntitiesOnCheckIn(selectedSlot, reservation);

        return convertToDto(session);
    }
    private void validateActiveSession(String plateNumber) {
        if (parkingSessionRepository.existsByPlateNumberAndStatus(plateNumber, "ACTIVE")) {
            throw new ConflictException("Biển số xe " + plateNumber + " đã có một lượt gửi xe đang hoạt động.");
        }
    }
    
    private VehicleType validateVehicleType(String vehicleTypeId) {
        VehicleType vehicleType = resolveVehicleType(vehicleTypeId);
        if (vehicleType.getStatus() != VehicleTypeStatus.ACTIVE) {
            throw new BadRequestException("Loại xe " + vehicleType.getName() + " không hợp lệ hoặc không được áp dụng.");
        }
        return vehicleType;
    }

    private Reservation handleReservation(CheckInRequestDto request, String plateNumber, VehicleType vehicleType) {
        if (request.getReservationId() == null) {
            return null;
        }

        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đặt chỗ với ID: " + request.getReservationId()));

        if (!reservation.getPlateNumber().equalsIgnoreCase(plateNumber)) {
            throw new ConflictException("Biển số xe không khớp với thông tin đặt chỗ.");
        }
        if (reservation.getVehicleType() != vehicleType) {
            throw new ConflictException("Loại xe không khớp với thông tin đặt chỗ.");
        }
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new ConflictException("Trạng thái đặt chỗ không hợp lệ: " + reservation.getStatus());
        }
        if (reservation.getEndAt().isBefore(LocalDateTime.now())) {
            throw new ConflictException("Đặt chỗ đã hết hạn.");
        }

        return reservation;
    }

    private ParkingSlot lockAndGetParkingSlot(CheckInRequestDto request, VehicleType vehicleType, Reservation reservation) {
        if (reservation != null) {
            return getSlotFromReservation(reservation);
        }
        if (request.getSlotId() != null) {
            return findAndLockSlotById(request.getSlotId());
        }
        return findAndLockAvailableSlot(vehicleType);
    }

    private ParkingSlot getSlotFromReservation(Reservation reservation) {
        ParkingSlot slot = parkingSlotRepository.findByIdWithLock(reservation.getSlot().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot đặt chỗ không tồn tại."));
        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new ConflictException("Slot đặt chỗ đã có xe khác chiếm.");
        }
        return slot;
    }

    private ParkingSlot findAndLockSlotById(Long slotId) {
        ParkingSlot slot = parkingSlotRepository.findByIdWithLock(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy slot với ID: " + slotId));
        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new ConflictException("Slot đã được chọn không còn khả dụng.");
        }
        return slot;
    }

    private ParkingSlot findAndLockAvailableSlot(VehicleType vehicleType) {
        return parkingSlotRepository.findFirstByStatusAndVehicleTypeIdOrderByFloorIdAscCodeAsc(SlotStatus.AVAILABLE, vehicleType.getId())
                .orElseThrow(() -> new ConflictException("Không còn slot trống phù hợp cho loại xe này."));
    }

    private ParkingSession createParkingSession(CheckInRequestDto request, String plateNumber, VehicleType vehicleType, ParkingSlot slot, Reservation reservation) {
        String ticketCode = generateTicketCode();
        ParkingSession session = ParkingSession.builder()
                .ticketCode(ticketCode)
                .plateNumber(plateNumber)
                .vehicleType(vehicleType)
                .slot(slot)
                .entryGate(request.getEntryGate())
                .checkInAt(LocalDateTime.now())
                .status("ACTIVE")
                .reservation(reservation)
                .driver(reservation != null ? reservation.getDriver() : null)
                .fee(0.0)
                .build();
        return parkingSessionRepository.save(session);
    }

    /** Resolve User hiện tại từ Principal */
    private User getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getName()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingSessionResponseDto> getMySessions(String status, Principal principal) {
        User driver = getCurrentUser(principal);
        List<ParkingSession> sessions = (status != null && !status.isBlank())
                ? parkingSessionRepository.findByDriverIdAndStatus(driver.getId(), status)
                : parkingSessionRepository.findByDriverId(driver.getId());
        return sessions.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingSessionResponseDto> findActiveSessionsByPlate(String plateNumber) {
        if (plateNumber == null || plateNumber.isBlank()) {
            throw new IllegalArgumentException("Biển số xe không được để trống.");
        }
        List<ParkingSession> sessions = parkingSessionRepository
                .findActiveByPlateNumber(plateNumber.trim());
        if (sessions.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy lượt gửi xe đang hoạt động với biển số: "
                    + plateNumber.trim().toUpperCase());
        }
        return sessions.stream().map(this::convertToDto).toList();
    }

    private void updateEntitiesOnCheckIn(ParkingSlot slot, Reservation reservation) {
        slot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(slot);

        if (reservation != null) {
            reservation.setStatus(ReservationStatus.CHECKED_IN);
            reservationRepository.save(reservation);
        }
    }
    
    private String generateTicketCode() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd-HHmmss"));
        String randomPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "QR-" + dateStr + "-" + randomPart;
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
       Tìm kiếm và Lấy chi tiết Session
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public Page<ParkingSessionResponseDto> findAll(
            String status, String query, Long vehicleTypeId, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Specification<ParkingSession> spec = parkingSessionSpecification.filterBy(status, query, vehicleTypeId, from, to);
        return parkingSessionRepository.findAll(spec, pageable).map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingSessionResponseDto findById(Long id) {
        return parkingSessionRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy session với ID: " + id));
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
    
    @Override
    @Transactional
    public ParkingSessionResponseDto handleException(Long id, SessionExceptionRequestDto request) {
        ParkingSession session = parkingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        User currentUser = authenticationService.getCurrentUser();

        ParkingSessionException exception = ParkingSessionException.builder()
                .session(session)
                .type(request.getType())
                .reason(request.getReason())
                .extraFee(request.getExtraFee())
                .createdBy(currentUser)
                .build();

        parkingSessionExceptionRepository.save(exception);
        
        // Cập nhật phí nếu có
        if (request.getExtraFee() != null && request.getExtraFee().compareTo(BigDecimal.ZERO) > 0) {
            double currentFee = session.getFee() != null ? session.getFee() : 0.0;
            session.setFee(currentFee + request.getExtraFee().doubleValue());
            parkingSessionRepository.save(session);
        }

        return convertToDto(session);
    }

    @Override
    @Transactional
    public ParkingSessionResponseDto updateStatus(Long id, SessionStatusUpdateRequestDto request) {
        ParkingSession session = parkingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        // Basic validation, can be expanded with a state machine pattern
        String newStatus = request.getNewStatus().toUpperCase();
        if (!List.of("ACTIVE", "COMPLETED", "UNPAID", "LOST_TICKET", "EXPIRED").contains(newStatus)) {
            throw new BadRequestException("Invalid status: " + newStatus);
        }

        session.setStatus(newStatus);
        parkingSessionRepository.save(session);
        return convertToDto(session);
    }

    @Override
    @Transactional
    public ParkingSessionResponseDto reopenSession(Long id) {
        ParkingSession session = parkingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        if ("ACTIVE".equals(session.getStatus())) {
            throw new ConflictException("Session is already active.");
        }

        // Check if the slot is still available before reopening
        ParkingSlot slot = session.getSlot();
        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new ConflictException("Slot " + slot.getCode() + " is now occupied by another vehicle.");
        }

        session.setStatus("ACTIVE");
        session.setCheckOutAt(null);
        session.setFee(0.0);
        parkingSessionRepository.save(session);

        // Re-occupy the slot
        slot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(slot);

        return convertToDto(session);
    }

    @Override
    @Transactional
    public ParkingSessionResponseDto markAsUnpaid(Long id) {
        ParkingSession session = parkingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        if (!List.of("COMPLETED", "LOST_TICKET").contains(session.getStatus())) {
            throw new BadRequestException("Only COMPLETED or LOST_TICKET sessions can be marked as unpaid.");
        }

        session.setStatus("UNPAID");
        parkingSessionRepository.save(session);
        return convertToDto(session);
    }

    @Override
    @Transactional
    public ParkingSessionResponseDto waiveFee(Long id) {
        ParkingSession session = parkingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        session.setFee(0.0);
        parkingSessionRepository.save(session);

        addSystemNote(session, "Fee has been waived.");

        return convertToDto(session);
    }

    @Override
    @Transactional
    public ParkingSessionResponseDto addNote(Long id, SessionNoteRequestDto request) {
        ParkingSession session = parkingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
        
        User currentUser = authenticationService.getCurrentUser();
        String newNote = String.format("[%s] by %s: %s",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                currentUser.getUsername(),
                request.getNote());

        String existingNotes = session.getNotes() == null ? "" : session.getNotes() + "\n";
        session.setNotes(existingNotes + newNote);

        parkingSessionRepository.save(session);
        return convertToDto(session);
    }

    /* ─────────────────────────────────────────────────────
       Helpers
    ───────────────────────────────────────────────────── */
    
    private void addSystemNote(ParkingSession session, String note) {
        String newNote = String.format("[%s] by SYSTEM: %s",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                note);

        String existingNotes = session.getNotes() == null ? "" : session.getNotes() + "\n";
        session.setNotes(existingNotes + newNote);
        parkingSessionRepository.save(session);
    }

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
        ParkingSlot slot = session.getSlot();
        Floor floor = slot.getFloor();
        Reservation reservation = session.getReservation();

        return ParkingSessionResponseDto.builder()
                .id(String.valueOf(session.getId()))
                .ticketCode(session.getTicketCode())
                .plateNumber(session.getPlateNumber())
                .vehicleTypeId(String.valueOf(session.getVehicleType().getId()))
                .vehicleTypeName(session.getVehicleType().getName())
                .slotId(String.valueOf(slot.getId()))
                .slotCode(slot.getCode())
                .floorId(floor.getId())
                .floorName(floor.getName())
                .reservationId(reservation != null ? reservation.getId() : null)
                .entryGate(session.getEntryGate())
                .checkInAt(session.getCheckInAt())
                .checkOutAt(session.getCheckOutAt())
                .fee(session.getFee())
                .status(session.getStatus())
                .notes(session.getNotes())
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