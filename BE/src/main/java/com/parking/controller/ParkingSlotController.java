package com.parking.controller;

import com.parking.dto.ParkingSlotRequestDto;
import com.parking.dto.ParkingSlotResponseDto;
import com.parking.service.ParkingSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.parking.dto.SlotStatusUpdateRequestDto;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class ParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    @GetMapping
    @PreAuthorize("hasAuthority('slots:view')")
    public ResponseEntity<List<ParkingSlotResponseDto>> getAllSlots() {
        return ResponseEntity.ok(parkingSlotService.getAllSlots());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAuthority('slots:view')")
    public ResponseEntity<List<ParkingSlotResponseDto>> getAvailableSlots(
            @RequestParam(required = false) String vehicleTypeId
    ) {
        return ResponseEntity.ok(parkingSlotService.getAvailableSlots(vehicleTypeId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('slots:manage')")
    public ResponseEntity<ParkingSlotResponseDto> createSlot(@Valid @RequestBody ParkingSlotRequestDto request) {
        return ResponseEntity.ok(parkingSlotService.createSlot(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('slots:manage')")
    public ResponseEntity<ParkingSlotResponseDto> updateSlot(
            @PathVariable Long id,
            @Valid @RequestBody ParkingSlotRequestDto request
    ) {
        return ResponseEntity.ok(parkingSlotService.updateSlot(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('slots:manage')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        parkingSlotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('slots:updateStatus')")
    public ResponseEntity<ParkingSlotResponseDto> updateSlotStatus(
            @PathVariable Long id,
            @Valid @RequestBody SlotStatusUpdateRequestDto request
    ) {
        return ResponseEntity.ok(parkingSlotService.updateSlotStatus(id, request));
    }
}
