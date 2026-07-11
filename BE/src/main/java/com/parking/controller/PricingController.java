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

    @PostMapping
    @PreAuthorize("hasAuthority('pricing:manage')")
    public ResponseEntity<PricingResponseDto> createPricing(
            @Valid @RequestBody PricingRequestDto dto) {
        PricingResponseDto created = pricingService.createPricing(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('parkingInfo:view')")
    public ResponseEntity<PricingResponseDto> getPricingById(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.getPricingById(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('parkingInfo:view')")
    public ResponseEntity<List<PricingResponseDto>> getAllPricings(
            @RequestParam(required = false) Boolean active) {
        List<PricingResponseDto> result = Boolean.TRUE.equals(active)
                ? pricingService.getActivePricings()
                : pricingService.getAllPricings();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vehicle-type/{vehicleTypeId}")
    @PreAuthorize("hasAuthority('parkingInfo:view')")
    public ResponseEntity<List<PricingResponseDto>> getPricingsByVehicleType(
            @PathVariable String vehicleTypeId,
            @RequestParam(required = false) Boolean active) {
        List<PricingResponseDto> result = Boolean.TRUE.equals(active)
                ? pricingService.getActivePricingsByVehicleType(vehicleTypeId)
                : pricingService.getPricingsByVehicleType(vehicleTypeId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('pricing:manage')")
    public ResponseEntity<PricingResponseDto> updatePricing(
            @PathVariable Long id,
            @Valid @RequestBody PricingRequestDto dto) {
        return ResponseEntity.ok(pricingService.updatePricing(id, dto));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('pricing:manage')")
    public ResponseEntity<PricingResponseDto> togglePricingStatus(@PathVariable Long id) {
        return ResponseEntity.ok(pricingService.togglePricingStatus(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('pricing:manage')")
    public ResponseEntity<Void> deletePricing(@PathVariable Long id) {
        pricingService.deletePricing(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/calculate")
    @PreAuthorize("hasAuthority('parkingInfo:view')")
    public ResponseEntity<OvernightFeeResponseDto> calculateOvernightFee(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkOut,
            @RequestParam String vehicleType) {
        OvernightFeeResponseDto response = pricingService.calculateOvernightFee(checkIn, checkOut, vehicleType);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lost-ticket")
    @PreAuthorize("hasAuthority('parkingInfo:view')")
    public ResponseEntity<LostTicketFeeResponseDto> calculateLostTicketFee(
            @RequestParam String vehicleType) {
        LostTicketFeeResponseDto response = pricingService.calculateLostTicketFee(vehicleType);
        return ResponseEntity.ok(response);
    }
}
