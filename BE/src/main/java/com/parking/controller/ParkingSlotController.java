package com.parking.controller;

import com.parking.dto.ParkingSlotRequestDto;
import com.parking.dto.ParkingSlotResponseDto;
import com.parking.service.ParkingSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for managing parking slot operations.
 * Provides endpoints for retrieving, creating, updating, and deleting parking slots.
 */
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class ParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    /**
     * Retrieves all parking slots.
     *
     * @return A ResponseEntity containing a list of all ParkingSlotResponseDto.
     */
    @GetMapping
    public ResponseEntity<List<ParkingSlotResponseDto>> getAllSlots() {
        return ResponseEntity.ok(parkingSlotService.getAllSlots());
    }

    /**
     * Retrieves available parking slots, optionally filtered by vehicle type.
     *
     * @param vehicleTypeId (Optional) The ID of the vehicle type to filter by.
     * @return A ResponseEntity containing a list of available ParkingSlotResponseDto.
     */
    @GetMapping("/available")
    public ResponseEntity<List<ParkingSlotResponseDto>> getAvailableSlots(
            @RequestParam(required = false) String vehicleTypeId
    ) {
        return ResponseEntity.ok(parkingSlotService.getAvailableSlots(vehicleTypeId));
    }

    /**
     * Creates a new parking slot.
     *
     * @param request The ParkingSlotRequestDto containing details for the new slot.
     * @return A ResponseEntity containing the created ParkingSlotResponseDto.
     */
    @PostMapping
    public ResponseEntity<ParkingSlotResponseDto> createSlot(@RequestBody ParkingSlotRequestDto request) {
        return ResponseEntity.ok(parkingSlotService.createSlot(request));
    }

    /**
     * Updates an existing parking slot.
     *
     * @param id The ID of the parking slot to update.
     * @param request The ParkingSlotRequestDto containing updated details.
     * @return A ResponseEntity containing the updated ParkingSlotResponseDto.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ParkingSlotResponseDto> updateSlot(
            @PathVariable Long id,
            @RequestBody ParkingSlotRequestDto request
    ) {
        return ResponseEntity.ok(parkingSlotService.updateSlot(id, request));
    }

    /**
     * Deletes a parking slot by its ID.
     *
     * @param id The ID of the parking slot to delete.
     * @return A ResponseEntity with no content if deletion is successful.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        parkingSlotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }
}
