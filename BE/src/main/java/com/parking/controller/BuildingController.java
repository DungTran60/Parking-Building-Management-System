package com.parking.controller;

import com.parking.dto.BuildingRequestDto;
import com.parking.dto.BuildingResponseDto;
import com.parking.service.BuildingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BuildingResponseDto> createBuilding(@Valid @RequestBody BuildingRequestDto dto) {
        BuildingResponseDto created = buildingService.createBuilding(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BuildingResponseDto> getBuildingById(@PathVariable Long id) {
        BuildingResponseDto building = buildingService.getBuildingById(id);
        return ResponseEntity.ok(building);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BuildingResponseDto>> getAllBuildings() {
        List<BuildingResponseDto> buildings = buildingService.getAllBuildings();
        return ResponseEntity.ok(buildings);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BuildingResponseDto> updateBuilding(
            @PathVariable Long id,
            @Valid @RequestBody BuildingRequestDto dto
    ) {
        BuildingResponseDto updated = buildingService.updateBuilding(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Long id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build();
    }
}
