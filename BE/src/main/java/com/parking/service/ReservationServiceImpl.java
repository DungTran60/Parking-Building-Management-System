package com.parking.service;

import com.parking.dto.ReservationRequestDto;
import com.parking.dto.ReservationResponseDto;
import com.parking.entity.*;
import com.parking.exception.BadRequestException;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
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
    private final AuthenticationService  authenticationService;

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

        // 6. Tạo và lưu reservation (gắn tài khoản Driver đang đăng nhập nếu có)
        Reservation reservation = Reservation.builder()
                .plateNumber(dto.getPlateNumber())
                .vehicleType(vehicleType)
                .slot(slot)
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .status(ReservationStatus.PENDING)
                .user(authenticationService.getCurrentUser())
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
        // Chống IDOR: chỉ chủ sở hữu hoặc ADMIN/MANAGER được xem chi tiết.
        User currentUser = requireCurrentUser();
        if (!canViewAll(currentUser) && !isOwner(r, currentUser)) {
            throw new AccessDeniedException("Bạn không có quyền xem đặt chỗ này.");
        }
        return mapToResponse(r);
    }

    /* ─────────────────────────────────────────────────────
       Lấy tất cả
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getAllReservations() {
        User currentUser = requireCurrentUser();
        // Chống IDOR: chỉ ADMIN/MANAGER xem toàn bộ; Driver/Staff chỉ thấy đặt chỗ của chính mình.
        List<Reservation> reservations = canViewAll(currentUser)
                ? reservationRepository.findAll()
                : reservationRepository.findByUserIdOrderByStartAtDesc(currentUser.getId());
        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Lọc theo trạng thái
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getReservationsByStatus(ReservationStatus status) {
        User currentUser = requireCurrentUser();
        // Chống IDOR: người dùng thường chỉ lọc trên đặt chỗ của chính mình.
        return reservationRepository.findByStatus(status)
                .stream()
                .filter(r -> canViewAll(currentUser) || isOwner(r, currentUser))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getMyReservations() {
        User currentUser = authenticationService.getCurrentUser();
        if (currentUser == null) {
            throw new BadRequestException("Không xác định được người dùng hiện tại.");
        }
        return reservationRepository.findByUserIdOrderByStartAtDesc(currentUser.getId())
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

        // Giữ chỗ thực sự: đánh dấu slot RESERVED để xe vãng lai không thể chiếm.
        ParkingSlot slot = r.getSlot();
        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new ConflictException(
                    "Slot " + slot.getCode() + " đang có xe, không thể xác nhận đặt chỗ.");
        }
        if (slot.getStatus() == SlotStatus.AVAILABLE) {
            slot.setStatus(SlotStatus.RESERVED);
            parkingSlotRepository.save(slot);
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

        // Chống IDOR: chỉ chủ sở hữu hoặc ADMIN/MANAGER được hủy đặt chỗ.
        User currentUser = requireCurrentUser();
        if (!canViewAll(currentUser) && !isOwner(r, currentUser)) {
            throw new AccessDeniedException("Bạn không có quyền hủy đặt chỗ này.");
        }

        if (r.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Reservation is already cancelled");
        }

        ReservationStatus previous = r.getStatus();
        r.setStatus(ReservationStatus.CANCELLED);
        Reservation saved = reservationRepository.save(r);

        // Trả slot về AVAILABLE nếu đặt chỗ này đang giữ slot (RESERVED) và chưa check-in,
        // và không còn đặt chỗ CONFIRMED nào khác giữ slot đó.
        ParkingSlot slot = r.getSlot();
        if (previous == ReservationStatus.CONFIRMED
                && slot.getStatus() == SlotStatus.RESERVED
                && !reservationRepository.existsBySlotIdAndStatus(slot.getId(), ReservationStatus.CONFIRMED)) {
            slot.setStatus(SlotStatus.AVAILABLE);
            parkingSlotRepository.save(slot);
        }

        return mapToResponse(saved);
    }

    /* ─────────────────────────────────────────────────────
       Helper methods
    ───────────────────────────────────────────────────── */
    private Reservation findOrThrow(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found with ID: " + id));
    }

    /** Lấy người dùng hiện tại, ném lỗi nếu không xác định được (chặn truy cập ẩn danh). */
    private User requireCurrentUser() {
        User currentUser = authenticationService.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("Không xác định được người dùng hiện tại.");
        }
        return currentUser;
    }

    /** ADMIN/MANAGER được xem/thao tác trên mọi đặt chỗ. */
    private boolean canViewAll(User user) {
        if (user.getRole() == null || user.getRole().getName() == null) {
            return false;
        }
        String roleName = user.getRole().getName();
        return "ADMIN".equalsIgnoreCase(roleName) || "MANAGER".equalsIgnoreCase(roleName);
    }

    /** Kiểm tra người dùng có phải chủ sở hữu của đặt chỗ không. */
    private boolean isOwner(Reservation reservation, User user) {
        return reservation.getUser() != null
                && reservation.getUser().getId() != null
                && reservation.getUser().getId().equals(user.getId());
    }

    private ReservationResponseDto mapToResponse(Reservation r) {
        return ReservationResponseDto.builder()
                .id(r.getId())
                .plateNumber(r.getPlateNumber())
                .vehicleTypeId(r.getVehicleType().getId())
                .vehicleTypeName(r.getVehicleType().getName())
                .slotId(r.getSlot().getId())
                .slotCode(r.getSlot().getCode())
                .startAt(r.getStartAt())
                .endAt(r.getEndAt())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .ownerUsername(r.getUser() != null ? r.getUser().getUsername() : null)
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
