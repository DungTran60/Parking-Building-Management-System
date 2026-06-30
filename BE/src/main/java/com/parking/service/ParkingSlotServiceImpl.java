package com.parking.service;

import com.parking.dto.ParkingSlotRequestDto;
import com.parking.dto.ParkingSlotResponseDto;
import com.parking.dto.SlotStatusUpdateRequestDto;
import com.parking.entity.Floor;
import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSession;
import com.parking.entity.Reservation;
import com.parking.entity.ReservationStatus;
import com.parking.entity.SlotStatus;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParkingSlotServiceImpl implements ParkingSlotService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final FloorRepository floorRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ReservationRepository reservationRepository;
    private final ParkingSessionRepository parkingSessionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ParkingSlotResponseDto> getAllSlots() {
        return parkingSlotRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingSlotResponseDto> getAvailableSlots(String vehicleTypeId) {
        List<ParkingSlot> slots;
        if (vehicleTypeId != null && !vehicleTypeId.trim().isEmpty()) {
            slots = parkingSlotRepository.findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, vehicleTypeId);
        } else {
            slots = parkingSlotRepository.findByStatus(SlotStatus.AVAILABLE);
        }
        return slots.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto updateSlotStatus(Long id, SlotStatusUpdateRequestDto request) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
        slot.setStatus(request.getStatus());
        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto createSlot(ParkingSlotRequestDto request) {
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + request.getFloorId()));
        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "VehicleType not found with id: " + request.getVehicleTypeId()));

        ParkingSlot slot = ParkingSlot.builder()
                .code(request.getCode())
                .floor(floor)
                .vehicleType(vehicleType)
                .status(request.getStatus() != null ? request.getStatus() : SlotStatus.AVAILABLE)
                .build();
        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto updateSlot(Long id, ParkingSlotRequestDto request) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        if (request.getCode() != null) {
            slot.setCode(request.getCode());
        }
        if (request.getFloorId() != null) {
            Floor floor = floorRepository.findById(request.getFloorId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Floor not found with id: " + request.getFloorId()));
            slot.setFloor(floor);
        }
        if (request.getVehicleTypeId() != null) {
            VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "VehicleType not found with id: " + request.getVehicleTypeId()));
            slot.setVehicleType(vehicleType);
        }
        if (request.getStatus() != null) {
            slot.setStatus(request.getStatus());
        }

        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public void deleteSlot(Long id) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
        parkingSlotRepository.delete(slot);
    }

    /**
     * Tự động cập nhật trạng thái slot (Auto Slot Update).
     * Chạy định kỳ mỗi 60 giây.
     * 
     * Các nhiệm vụ:
     * 1. Hủy các reservation CONFIRMED đã hết hạn và giải phóng slot về AVAILABLE
     * 2. Hủy các reservation PENDING đã hết hạn
     * 3. Giải phóng slot RESERVED không còn reservation CONFIRMED nào
     * 4. Giải phóng slot OCCUPIED không còn parking session ACTIVE nào
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoUpdateSlots() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Auto Slot Update started at {}", now);

        // 1. Xử lý các reservation CONFIRMED đã hết hạn
        List<Reservation> expiredConfirmed = reservationRepository.findExpiredConfirmedReservations(now);
        for (Reservation reservation : expiredConfirmed) {
            log.info("Auto-cancelling expired CONFIRMED reservation ID={} for slot {}",
                    reservation.getId(), reservation.getSlot().getCode());
            reservation.setStatus(ReservationStatus.CANCELLED);
            reservationRepository.save(reservation);

            // Giải phóng slot nếu không còn reservation CONFIRMED nào khác cho slot này
            ParkingSlot slot = reservation.getSlot();
            List<Reservation> activeReservations = reservationRepository.findBySlotId(slot.getId())
                    .stream()
                    .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED && r.getEndAt().isAfter(now))
                    .toList();
            if (activeReservations.isEmpty() && slot.getStatus() == SlotStatus.RESERVED) {
                log.info("Releasing slot {} to AVAILABLE (no more active confirmed reservations)", slot.getCode());
                slot.setStatus(SlotStatus.AVAILABLE);
                parkingSlotRepository.save(slot);
            }
        }

        // 2. Xử lý các reservation PENDING đã hết hạn
        List<Reservation> expiredPending = reservationRepository.findExpiredPendingReservations(now);
        for (Reservation reservation : expiredPending) {
            log.info("Auto-cancelling expired PENDING reservation ID={} for slot {}",
                    reservation.getId(), reservation.getSlot().getCode());
            reservation.setStatus(ReservationStatus.CANCELLED);
            reservationRepository.save(reservation);
        }

        // 3. Giải phóng slot RESERVED không còn reservation CONFIRMED nào
        List<ParkingSlot> reservedSlots = parkingSlotRepository.findByStatus(SlotStatus.RESERVED);
        for (ParkingSlot slot : reservedSlots) {
            List<Reservation> activeReservations = reservationRepository.findBySlotId(slot.getId())
                    .stream()
                    .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED && r.getEndAt().isAfter(now))
                    .toList();
            if (activeReservations.isEmpty()) {
                log.info("Auto-releasing reserved slot {} to AVAILABLE (no active confirmed reservations)",
                        slot.getCode());
                slot.setStatus(SlotStatus.AVAILABLE);
                parkingSlotRepository.save(slot);
            }
        }

        // 4. Giải phóng slot OCCUPIED không còn parking session ACTIVE nào
        List<ParkingSlot> occupiedSlots = parkingSlotRepository.findByStatus(SlotStatus.OCCUPIED);
        for (ParkingSlot slot : occupiedSlots) {
            List<ParkingSession> activeSessions = parkingSessionRepository.findBySlotAndStatus(slot, "ACTIVE");
            if (activeSessions.isEmpty()) {
                log.info("Auto-releasing occupied slot {} to AVAILABLE (no active parking sessions)", slot.getCode());
                slot.setStatus(SlotStatus.AVAILABLE);
                parkingSlotRepository.save(slot);
            }
        }

        log.info("Auto Slot Update completed");
    }

    private ParkingSlotResponseDto convertToDto(ParkingSlot slot) {
        return ParkingSlotResponseDto.builder()
                .id(String.valueOf(slot.getId()))
                .code(slot.getCode())
                .floorId(String.valueOf(slot.getFloor().getId()))
                .vehicleTypeId(slot.getVehicleType().getId())
                .status(slot.getStatus())
                .updatedAt(slot.getUpdatedAt())
                .build();
    }
}
