package com.parking.controller;

import com.parking.dto.VehicleTypeRequestDto;
import com.parking.dto.VehicleTypeResponseDto;
import com.parking.entity.VehicleTypeStatus;
import com.parking.service.VehicleTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Vehicle Type Management.
 *
 * GET    /api/vehicle-types         - list all (authenticated)
 * GET    /api/vehicle-types/{id}    - get by id (authenticated)
 * POST   /api/vehicle-types         - create (admin only)
 * PUT    /api/vehicle-types/{id}    - update (admin only)
 * DELETE /api/vehicle-types/{id}    - delete (admin only)
 */
@RestController
@RequestMapping("/api/vehicle-types")
@RequiredArgsConstructor
public class VehicleTypeController {

    private final VehicleTypeService vehicleTypeService;

    /**
     * GET /api/vehicle-types
     * Optional filter: ?status=ACTIVE or ?status=INACTIVE
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<VehicleTypeResponseDto>> getAllVehicleTypes(
            @RequestParam(required = false) VehicleTypeStatus status) {
        return ResponseEntity.ok(vehicleTypeService.getAllVehicleTypes(status));
    }

    /**
     * GET /api/vehicle-types/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VehicleTypeResponseDto> getVehicleTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleTypeService.getVehicleType(id));
    }

    /**
     * POST /api/vehicle-types
     * Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleTypeResponseDto> createVehicleType(
            @Valid @RequestBody VehicleTypeRequestDto dto) {
        VehicleTypeResponseDto created = vehicleTypeService.createVehicleType(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * PUT /api/vehicle-types/{id}
     * Admin only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleTypeResponseDto> updateVehicleType(
            @PathVariable Long id,
            @Valid @RequestBody VehicleTypeRequestDto dto) {
        return ResponseEntity.ok(vehicleTypeService.updateVehicleType(id, dto));
    }

    /**
     * DELETE /api/vehicle-types/{id}
     * Admin only - returns 409 if vehicle type is in use
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicleType(@PathVariable Long id) {
        vehicleTypeService.deleteVehicleType(id);
        return ResponseEntity.noContent().build();
    }
}
