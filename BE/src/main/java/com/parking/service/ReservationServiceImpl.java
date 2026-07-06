package com.parking.service;

import com.parking.dto.ReservationRequestDto;
import com.parking.dto.ReservationResponseDto;
import com.parking.entity.*;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository  parkingSlotRepository;
    private final VehicleTypeRepository  vehicleTypeRepository;

    /* ─────────────────────────────────────────────────────
       Tạo đặt chỗ mới
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ReservationResponseDto createReservation(ReservationRequestDto dto) {

        // 1. Validate thời gian
        if (!dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // 2. Tìm loại xe
        VehicleType vehicleType = resolveVehicleType(dto.getVehicleTypeId());

        // 3. Tìm slot
        ParkingSlot slot = parkingSlotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parking slot not found with ID: " + dto.getSlotId()));

        // 4. Kiểm tra slot có AVAILABLE hoặc RESERVED không (không cho đặt slot OCCUPIED/MAINTENANCE/BLOCKED)
        if (slot.getStatus() == SlotStatus.OCCUPIED
                || slot.getStatus() == SlotStatus.MAINTENANCE
                || slot.getStatus() == SlotStatus.BLOCKED) {
            throw new IllegalArgumentException(
                    "Slot " + slot.getCode() + " is not available for reservation (status: " + slot.getStatus() + ")");
        }

        // 5. Kiểm tra xung đột thời gian với các đặt chỗ hiện có
        boolean hasConflict = reservationRepository.existsOverlappingReservation(
                dto.getSlotId(), dto.getStartAt(), dto.getEndAt());
        if (hasConflict) {
            throw new IllegalArgumentException(
                    "Slot " + slot.getCode() + " is already reserved in the requested time range");
        }

        // 6. Tạo và lưu reservation
        Reservation reservation = Reservation.builder()
                .plateNumber(dto.getPlateNumber())
                .vehicleType(vehicleType)
                .slot(slot)
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .status(ReservationStatus.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    /* ─────────────────────────────────────────────────────
       Lấy theo ID
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public ReservationResponseDto getReservationById(Long id) {
        Reservation r = findOrThrow(id);
        return mapToResponse(r);
    }

    /* ─────────────────────────────────────────────────────
       Lấy tất cả
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Lọc theo trạng thái
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getReservationsByStatus(ReservationStatus status) {
        return reservationRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Xác nhận đặt chỗ: PENDING → CONFIRMED
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ReservationResponseDto confirmReservation(Long id) {
        Reservation r = findOrThrow(id);

        if (r.getStatus() != ReservationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING reservations can be confirmed. Current status: " + r.getStatus());
        }

        r.setStatus(ReservationStatus.CONFIRMED);
        return mapToResponse(reservationRepository.save(r));
    }

    /* ─────────────────────────────────────────────────────
       Hủy đặt chỗ: PENDING / CONFIRMED → CANCELLED
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ReservationResponseDto cancelReservation(Long id) {
        Reservation r = findOrThrow(id);

        if (r.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Reservation is already cancelled");
        }

        r.setStatus(ReservationStatus.CANCELLED);
        return mapToResponse(reservationRepository.save(r));
    }

    /* ─────────────────────────────────────────────────────
       Helper methods
    ───────────────────────────────────────────────────── */
    private Reservation findOrThrow(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found with ID: " + id));
    }

    private ReservationResponseDto mapToResponse(Reservation r) {
        return ReservationResponseDto.builder()
                .id(r.getId())
                .plateNumber(r.getPlateNumber())
                .vehicleTypeId(String.valueOf(r.getVehicleType().getId()))
                .vehicleTypeName(r.getVehicleType().getName())
                .slotId(r.getSlot().getId())
                .slotCode(r.getSlot().getCode())
                .startAt(r.getStartAt())
                .endAt(r.getEndAt())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
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
