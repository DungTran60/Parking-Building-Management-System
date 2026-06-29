package com.parking.service;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.ParkingSessionResponseDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingSessionServiceImpl implements ParkingSessionService {

    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional
    public ParkingSessionResponseDto checkIn(CheckInRequestDto request) {
        // 1. Tìm loại xe
        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + request.getVehicleTypeId()));

        // 2. Tìm slot trống phù hợp
        List<ParkingSlot> availableSlots = parkingSlotRepository.findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, request.getVehicleTypeId());
        if (availableSlots.isEmpty()) {
            throw new RuntimeException("Không còn slot đỗ xe trống phù hợp cho loại xe này!");
        }
        ParkingSlot selectedSlot = availableSlots.get(0);

        // 3. Cập nhật slot thành OCCUPIED
        selectedSlot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(selectedSlot);

        // 4. Tạo mã QR vé gửi xe
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd-HHmmss"));
        String ticketCode = "QR-" + dateStr + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

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

        ParkingSession saved = parkingSessionRepository.save(session);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public ParkingSessionResponseDto checkOut(String query) {
        // 1. Tìm session đang hoạt động
        Optional<ParkingSession> sessionOpt = parkingSessionRepository.findByTicketCodeAndStatus(query, "ACTIVE");
        if (sessionOpt.isEmpty()) {
            sessionOpt = parkingSessionRepository.findByPlateNumberAndStatus(query, "ACTIVE");
        }

        ParkingSession session = sessionOpt.orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy lượt gửi xe đang hoạt động phù hợp với mã vé hoặc biển số này!"));

        // 2. Tính số giờ gửi và phí gửi xe
        LocalDateTime checkOutTime = LocalDateTime.now();
        long seconds = Duration.between(session.getCheckInAt(), checkOutTime).getSeconds();
        // Làm tròn lên số giờ gửi, tối thiểu 1 giờ
        double hours = Math.max(1.0, Math.ceil(seconds / 3600.0));
        double hourlyRate = session.getVehicleType().getHourlyRate() != null ? session.getVehicleType().getHourlyRate() : 5000.0;
        double fee = hours * hourlyRate;

        // 3. Cập nhật thông tin checkout của session
        session.setCheckOutAt(checkOutTime);
        session.setFee(fee);
        session.setStatus("COMPLETED");
        ParkingSession saved = parkingSessionRepository.save(session);

        // 4. Giải phóng slot trở lại AVAILABLE
        ParkingSlot slot = session.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);

        return convertToDto(saved);
    }

    private ParkingSessionResponseDto convertToDto(ParkingSession session) {
        return ParkingSessionResponseDto.builder()
                .id(String.valueOf(session.getId()))
                .ticketCode(session.getTicketCode())
                .plateNumber(session.getPlateNumber())
                .vehicleTypeId(session.getVehicleType().getId())
                .slotId(String.valueOf(session.getSlot().getId()))
                .entryGate(session.getEntryGate())
                .checkInAt(session.getCheckInAt())
                .checkOutAt(session.getCheckOutAt())
                .fee(session.getFee())
                .status(session.getStatus())
                .build();
    }
}
