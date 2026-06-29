package com.parking.controller;

import com.parking.dto.ParkingSlotRequestDto;
import com.parking.dto.ParkingSlotResponseDto;
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

    @PostMapping
    public ResponseEntity<ParkingSlotResponseDto> createSlot(@RequestBody ParkingSlotRequestDto request) {
        return ResponseEntity.ok(parkingSlotService.createSlot(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParkingSlotResponseDto> updateSlot(
            @PathVariable Long id,
            @RequestBody ParkingSlotRequestDto request
    ) {
        return ResponseEntity.ok(parkingSlotService.updateSlot(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        parkingSlotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }
}
