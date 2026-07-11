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
 * POST   /api/vehicle-types         - create (admin or manager)
 * PUT    /api/vehicle-types/{id}    - update (admin or manager)
 * DELETE /api/vehicle-types/{id}    - delete (admin or manager)
 */
@RestController
@RequestMapping("/api/vehicle-types")
@RequiredArgsConstructor
public class VehicleTypeController {

    private final VehicleTypeService vehicleTypeService;

    @GetMapping
    @PreAuthorize("hasAuthority('parkingInfo:view')")
    public ResponseEntity<List<VehicleTypeResponseDto>> getAllVehicleTypes(
            @RequestParam(required = false) VehicleTypeStatus status) {
        return ResponseEntity.ok(vehicleTypeService.getAllVehicleTypes(status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('parkingInfo:view')")
    public ResponseEntity<VehicleTypeResponseDto> getVehicleTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleTypeService.getVehicleType(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('vehicleTypes:manage')")
    public ResponseEntity<VehicleTypeResponseDto> createVehicleType(
            @Valid @RequestBody VehicleTypeRequestDto dto) {
        VehicleTypeResponseDto created = vehicleTypeService.createVehicleType(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('vehicleTypes:manage')")
    public ResponseEntity<VehicleTypeResponseDto> updateVehicleType(
            @PathVariable Long id,
            @Valid @RequestBody VehicleTypeRequestDto dto) {
        return ResponseEntity.ok(vehicleTypeService.updateVehicleType(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('vehicleTypes:manage')")
    public ResponseEntity<Void> deleteVehicleType(@PathVariable Long id) {
        vehicleTypeService.deleteVehicleType(id);
        return ResponseEntity.noContent().build();
    }
}
