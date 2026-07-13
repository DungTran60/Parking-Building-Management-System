package com.parking.controller;

import com.parking.dto.ReservationRequestDto;
import com.parking.dto.ReservationResponseDto;
import com.parking.entity.ReservationStatus;
import com.parking.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST controller cho Reservation Module.
 *
 * Endpoints:
 *   POST   /api/reservations               – Tạo đặt chỗ mới
 *   GET    /api/reservations               – Lấy danh sách tất cả (có thể lọc theo status)
 *   GET    /api/reservations/{id}          – Lấy thông tin một đặt chỗ
 *   PATCH  /api/reservations/{id}/confirm  – Xác nhận đặt chỗ (PENDING → CONFIRMED)
 *   PATCH  /api/reservations/{id}/cancel   – Hủy đặt chỗ
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Tạo một đặt chỗ mới.
     * Mọi người dùng đã đăng nhập đều có thể tạo.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponseDto> createReservation(
            @Valid @RequestBody ReservationRequestDto dto,
            Principal principal) {
        ReservationResponseDto created = reservationService.createReservation(dto, principal);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Lấy danh sách đặt chỗ của user hiện tại, tùy chọn lọc theo trạng thái.
     * Ví dụ: GET /api/reservations?status=PENDING
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReservationResponseDto>> getReservations(
            @RequestParam(required = false) ReservationStatus status,
            Principal principal) {
        return ResponseEntity.ok(reservationService.getMyReservations(status, principal));
    }

    /**
     * Lấy thông tin một đặt chỗ theo ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponseDto> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    /**
     * Xác nhận đặt chỗ: PENDING → CONFIRMED.
     * Chỉ ADMIN hoặc MANAGER mới có quyền xác nhận.
     */
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ReservationResponseDto> confirmReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.confirmReservation(id));
    }

    /**
     * GET /api/reservations/all
     * Lấy tất cả đặt chỗ (cho Staff/Manager xem).
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<ReservationResponseDto>> getAllReservations(
            @RequestParam(required = false) ReservationStatus status) {
        return ResponseEntity.ok(reservationService.getAllReservations(status));
    }

    /**
     * Hủy đặt chỗ: PENDING / CONFIRMED → CANCELLED.
     * Chỉ chính Driver sở hữu đặt chỗ mới được hủy.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponseDto> cancelReservation(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(reservationService.cancelReservation(id, principal));
    }
}
