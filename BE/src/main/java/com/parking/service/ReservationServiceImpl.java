package com.parking.service;

import com.parking.dto.ReservationRequestDto;
import com.parking.dto.ReservationResponseDto;
import com.parking.entity.*;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository  parkingSlotRepository;
    private final VehicleTypeRepository  vehicleTypeRepository;
    private final UserRepository         userRepository;

    /** Resolve Driver hiện tại từ Principal */
    private com.parking.entity.User getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getName()));
    }

    /* ─────────────────────────────────────────────────────
       Tạo đặt chỗ mới
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public ReservationResponseDto createReservation(ReservationRequestDto dto, Principal principal) {
        com.parking.entity.User driver = getCurrentUser(principal);

        // 1. Validate thời gian
        if (!dto.getStartAt().isAfter(LocalDateTime.now().minusMinutes(1))) {
            throw new IllegalArgumentException("Thời gian bắt đầu phải ở trong tương lai.");
        }
        if (!dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu.");
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
                .driver(driver)
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                // Auto-confirm: Driver đặt chỗ → tự động CONFIRMED (workflow §4.4)
                .status(ReservationStatus.CONFIRMED)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // 7. Giữ chỗ: slot → RESERVED (workflow §5.2 bước 5)
        slot.setStatus(SlotStatus.RESERVED);
        parkingSlotRepository.save(slot);

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
       Danh sách đặt chỗ của Driver hiện tại (scope theo user)
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getMyReservations(ReservationStatus status, Principal principal) {
        com.parking.entity.User driver = getCurrentUser(principal);
        List<Reservation> reservations = (status != null)
                ? reservationRepository.findByDriverIdAndStatus(driver.getId(), status)
                : reservationRepository.findByDriverId(driver.getId());
        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
        Lấy tất cả đặt chỗ (cho Staff/Manager)
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getAllReservations(ReservationStatus status) {
        List<Reservation> reservations = (status != null)
                ? reservationRepository.findByStatus(status)
                : reservationRepository.findAll();
        return reservations.stream()
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
    public ReservationResponseDto cancelReservation(Long id, Principal principal) {
        Reservation r = findOrThrow(id);
        com.parking.entity.User driver = getCurrentUser(principal);

        // Chỉ chính Driver sở hữu đặt chỗ mới được hủy
        if (r.getDriver() == null || !r.getDriver().getId().equals(driver.getId())) {
            throw new AccessDeniedException("Bạn không có quyền hủy đặt chỗ này.");
        }

        // Chỉ hủy được khi chưa check-in (PENDING hoặc CONFIRMED) — workflow §4.4
        if (r.getStatus() != ReservationStatus.PENDING && r.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalArgumentException(
                    "Chỉ có thể hủy đặt chỗ ở trạng thái PENDING hoặc CONFIRMED. Hiện tại: " + r.getStatus());
        }

        r.setStatus(ReservationStatus.CANCELLED);

        // Giải phóng slot RESERVED → AVAILABLE (workflow §5.2 bước 5b)
        releaseSlotIfReserved(r.getSlot());

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

    // Chỉ giải phóng slot khi đang RESERVED — không đụng slot OCCUPIED/MAINTENANCE/BLOCKED.
    private void releaseSlotIfReserved(ParkingSlot slot) {
        if (slot != null && slot.getStatus() == SlotStatus.RESERVED) {
            slot.setStatus(SlotStatus.AVAILABLE);
            parkingSlotRepository.save(slot);
        }
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
