package com.parking.controller;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.LostTicketCheckoutRequestDto;
import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.ParkingSessionResponseDto;
import com.parking.service.ParkingSessionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller cho Parking Session Management.
 *
 * Endpoints:
 *   POST   /api/sessions/checkin                   – check-in xe vào bãi
 *   POST   /api/sessions/checkout?query=           – check-out xe (bằng ticketCode hoặc plateNumber)
 *   GET    /api/sessions/active                    – lấy danh sách session đang ACTIVE
 *   GET    /api/sessions/lost-ticket-preview?plateNumber= – xem trước phí mất vé (chưa checkout)
 *   POST   /api/sessions/lost-ticket-checkout      – checkout xe mất vé (tính phí giờ + phụ phí)
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Validated
public class ParkingSessionController {

    private final ParkingSessionService parkingSessionService;

    /**
     * Check-in xe vào bãi.
     * Quyền: STAFF, MANAGER, ADMIN
     */
    @PostMapping("/checkin")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ParkingSessionResponseDto> checkOut(@RequestParam String query) {
        return ResponseEntity.ok(parkingSessionService.checkOut(query));
    }

    /**
     * Lấy danh sách session đang ACTIVE.
     * Quyền: authenticated users
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ParkingSessionResponseDto> getActiveSession() {
        return ResponseEntity.ok(parkingSessionService.getActiveSession());
    }

    /**
     * Preview phí mất vé cho xe đang gửi (chưa checkout).
     * Trả về: phí giờ, phụ phí mất vé, tổng phí.
     * Quyền: STAFF, MANAGER, ADMIN
     *
     * Ví dụ: GET /api/sessions/lost-ticket-preview?plateNumber=51G-88888
     */
    @GetMapping("/lost-ticket-preview")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ParkingSessionResponseDto> lostTicketCheckout(
            @Valid @RequestBody LostTicketCheckoutRequestDto request) {
        return ResponseEntity.ok(parkingSessionService.lostTicketCheckout(request));
    }
}
