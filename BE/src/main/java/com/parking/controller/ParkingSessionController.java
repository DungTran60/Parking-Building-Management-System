package com.parking.controller;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.LostTicketCheckoutRequestDto;
import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.ParkingSessionResponseDto;
import com.parking.dto.SessionExceptionRequestDto;
import com.parking.dto.SessionNoteRequestDto;
import com.parking.dto.SessionStatusUpdateRequestDto;
import com.parking.service.ParkingSessionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * REST controller cho Parking Session Management.
 *
 * Endpoints:
 *   GET    /api/sessions                           - Lấy danh sách sessions (filter, sort, page)
 *   GET    /api/sessions/{id}                      - Lấy chi tiết một session
 *   POST   /api/sessions/checkin                   – Check-in xe vào bãi
 *   POST   /api/sessions/checkout?query=           – Check-out xe (bằng ticketCode hoặc plateNumber)
 *   GET    /api/sessions/lost-ticket-preview?plateNumber= – Xem trước phí mất vé
 *   POST   /api/sessions/lost-ticket-checkout      – Checkout xe mất vé
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Validated
public class ParkingSessionController {

    private final ParkingSessionService parkingSessionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Page<ParkingSessionResponseDto>> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long vehicleTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Pageable pageable) {
        return ResponseEntity.ok(parkingSessionService.findAll(status, query, vehicleTypeId, from, to, pageable));
    }
    
    /**
     * Check-in xe vào bãi.
     * Quyền: STAFF, MANAGER, ADMIN
     */
    @PostMapping("/checkin")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> checkIn(
            @Valid @RequestBody CheckInRequestDto request) {
        return ResponseEntity.ok(parkingSessionService.checkIn(request));
    }

    /**
     * Check-out xe ra khỏi bãi (bằng ticketCode hoặc plateNumber).
     * Quyền: STAFF, MANAGER, ADMIN
     *
     * Ví dụ: /api/sessions/checkout?query=QR-260630-231500-ABCD
     *        /api/sessions/checkout?query=51G-88888
     */
    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> checkOut(@RequestParam String query) {
        return ResponseEntity.ok(parkingSessionService.checkOut(query));
    }

    /**
     * Lượt gửi của Driver hiện tại (scope theo user đăng nhập).
     * Dùng cho trang "Theo dõi lượt gửi xe" của Driver.
     * Quyền: DRIVER
     *
     * Ví dụ: GET /api/sessions/my?status=ACTIVE
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<ParkingSessionResponseDto>> getMySessions(
            @RequestParam(required = false) String status,
            Principal principal) {
        return ResponseEntity.ok(parkingSessionService.getMySessions(status, principal));
    }

    /**
     * Tìm session ACTIVE theo biển số — driver tra cứu xe walk-in (check-in tại quầy).
     * Quyền: DRIVER (isAuthenticated để cả STAFF có thể dùng nếu cần)
     *
     * Ví dụ: GET /api/sessions/by-plate?plateNumber=51G-12345
     */
    @GetMapping("/by-plate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ParkingSessionResponseDto>> findByPlate(
            @RequestParam @NotBlank(message = "Plate number is required") String plateNumber) {
        return ResponseEntity.ok(parkingSessionService.findActiveSessionsByPlate(plateNumber));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSessionService.findById(id));
    }

    /**
     * Preview phí mất vé cho xe đang gửi (chưa checkout).
     * Trả về: phí giờ, phụ phí mất vé, tổng phí.
     * Quyền: STAFF, MANAGER, ADMIN
     *
     * Ví dụ: GET /api/sessions/lost-ticket-preview?plateNumber=51G-88888
     */
    @GetMapping("/lost-ticket-preview")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<LostTicketFeeResponseDto> previewLostTicketFee(
            @RequestParam @NotBlank(message = "Plate number is required") String plateNumber) {
        return ResponseEntity.ok(parkingSessionService.previewLostTicketFee(plateNumber));
    }

    /**
     * Checkout xe mất vé (không có ticketCode).
     * Tính phí = phí giờ + phụ phí mất vé.
     * Quyền: STAFF, MANAGER, ADMIN
     *
     * Body: { "plateNumber": "51G-88888", "paymentMethod": "CASH" }
     */
    @PostMapping("/lost-ticket-checkout")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> lostTicketCheckout(
            @Valid @RequestBody LostTicketCheckoutRequestDto request) {
        return ResponseEntity.ok(parkingSessionService.lostTicketCheckout(request));
    }

    /**
     * Ghi nhận một sự cố / ngoại lệ cho một lượt gửi xe.
     * Quyền: STAFF, MANAGER, ADMIN
     */
    @PostMapping("/{id}/exceptions")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> handleException(
            @PathVariable Long id,
            @Valid @RequestBody SessionExceptionRequestDto request) {
        return ResponseEntity.ok(parkingSessionService.handleException(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody SessionStatusUpdateRequestDto request) {
        return ResponseEntity.ok(parkingSessionService.updateStatus(id, request));
    }

    @PostMapping("/{id}/reopen")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> reopenSession(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSessionService.reopenSession(id));
    }

    @PostMapping("/{id}/mark-unpaid")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> markAsUnpaid(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSessionService.markAsUnpaid(id));
    }

    @PostMapping("/{id}/waive-fee")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> waiveFee(@PathVariable Long id) {
        return ResponseEntity.ok(parkingSessionService.waiveFee(id));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ParkingSessionResponseDto> addNote(
            @PathVariable Long id,
            @Valid @RequestBody SessionNoteRequestDto request) {
        return ResponseEntity.ok(parkingSessionService.addNote(id, request));
    }
}
