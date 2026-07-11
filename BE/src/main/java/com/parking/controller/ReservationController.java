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

    @PostMapping
    @PreAuthorize("hasAuthority('reservations:selfManage')")
    public ResponseEntity<ReservationResponseDto> createReservation(
            @Valid @RequestBody ReservationRequestDto dto) {
        ReservationResponseDto created = reservationService.createReservation(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('reservations:selfManage')")
    public ResponseEntity<List<ReservationResponseDto>> getReservations(
            @RequestParam(required = false) ReservationStatus status) {
        List<ReservationResponseDto> list = (status != null)
                ? reservationService.getReservationsByStatus(status)
                : reservationService.getAllReservations();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('reservations:selfManage')")
    public ResponseEntity<List<ReservationResponseDto>> getMyReservations() {
        return ResponseEntity.ok(reservationService.getMyReservations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('reservations:selfManage')")
    public ResponseEntity<ReservationResponseDto> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('reservations:manage')")
    public ResponseEntity<ReservationResponseDto> confirmReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.confirmReservation(id));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('reservations:selfManage')")
    public ResponseEntity<ReservationResponseDto> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }
}
