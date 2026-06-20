package com.parking.controller;

import com.parking.dto.ParkingSlotResponseDto;
import com.parking.dto.SlotStatusUpdateRequestDto;
import com.parking.service.ParkingSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class ParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    @GetMapping
    public ResponseEntity<List<ParkingSlotResponseDto>> getAllSlots() {
        return ResponseEntity.ok(parkingSlotService.getAllSlots());
    }

    @GetMapping("/available")
    public ResponseEntity<List<ParkingSlotResponseDto>> getAvailableSlots(
            @RequestParam(required = false) String vehicleTypeId
    ) {
        return ResponseEntity.ok(parkingSlotService.getAvailableSlots(vehicleTypeId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParkingSlotResponseDto> updateSlotStatus(
            @PathVariable Long id,
            @RequestBody SlotStatusUpdateRequestDto request
    ) {
        return ResponseEntity.ok(parkingSlotService.updateSlotStatus(id, request));
    }
}
