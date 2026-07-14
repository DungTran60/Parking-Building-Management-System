package com.parking.controller;

import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.OvernightFeeResponseDto;
import com.parking.dto.PricingRequestDto;
import com.parking.dto.PricingResponseDto;
import com.parking.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    /**
     * POST /api/pricing
     * Tạo bảng giá mới. Chỉ ADMIN / MANAGER mới được phép.
     */
    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PricingResponseDto> createPricing(
            @Valid @RequestBody PricingRequestDto dto) {
        PricingResponseDto created = pricingService.createPricing(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * GET /api/pricing/{id}
     * Lấy thông tin bảng giá theo ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PricingResponseDto> getPricingById(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.getPricingById(id));
    }

    /**
     * GET /api/pricing
     * Lấy tất cả bảng giá. Query param ?active=true để lọc bảng giá đang áp dụng.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PricingResponseDto>> getAllPricings(
            @RequestParam(required = false) Boolean active) {
        List<PricingResponseDto> result = Boolean.TRUE.equals(active)
                ? pricingService.getActivePricings()
                : pricingService.getAllPricings();
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/pricing/vehicle-type/{vehicleTypeId}
     * Lấy bảng giá theo loại phương tiện. Query param ?active=true để lọc.
     */
    @GetMapping("/vehicle-type/{vehicleTypeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PricingResponseDto>> getPricingsByVehicleType(
            @PathVariable String vehicleTypeId,
            @RequestParam(required = false) Boolean active) {
        List<PricingResponseDto> result = Boolean.TRUE.equals(active)
                ? pricingService.getActivePricingsByVehicleType(vehicleTypeId)
                : pricingService.getPricingsByVehicleType(vehicleTypeId);
        return ResponseEntity.ok(result);
    }

    /**
     * PUT /api/pricing/{id}
     * Cập nhật toàn bộ thông tin bảng giá. Chỉ ADMIN / MANAGER mới được phép.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PricingResponseDto> updatePricing(
            @PathVariable Long id,
            @Valid @RequestBody PricingRequestDto dto) {
        return ResponseEntity.ok(pricingService.updatePricing(id, dto));
    }

    /**
     * PATCH /api/pricing/{id}/toggle
     * Bật/tắt trạng thái áp dụng bảng giá. Chỉ ADMIN / MANAGER mới được phép.
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PricingResponseDto> togglePricingStatus(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.togglePricingStatus(id));
    }

    /**
     * DELETE /api/pricing/{id}
     * Xóa bảng giá. Chỉ ADMIN mới được phép.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deletePricing(@PathVariable Long id) {
        pricingService.deletePricing(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/pricing/calculate
     * Tính phí gửi xe qua đêm.
     */
    @GetMapping("/calculate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OvernightFeeResponseDto> calculateOvernightFee(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkOut,
            @RequestParam String vehicleType) {
        OvernightFeeResponseDto response = pricingService.calculateOvernightFee(checkIn, checkOut, vehicleType);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/pricing/lost-ticket
     * Tính phí gửi xe khi mất vé.
     */
    @GetMapping("/lost-ticket")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LostTicketFeeResponseDto> calculateLostTicketFee(
            @RequestParam String vehicleType) {
        LostTicketFeeResponseDto response = pricingService.calculateLostTicketFee(vehicleType);
        return ResponseEntity.ok(response);
    }
}
