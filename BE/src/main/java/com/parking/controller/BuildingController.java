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
@RequestMapping("/api/building")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BuildingResponseDto> getBuilding() {
        BuildingResponseDto building = buildingService.getBuilding();
        return ResponseEntity.ok(building);
    }

    @PutMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<BuildingResponseDto> updateBuilding(
            @Valid @RequestBody BuildingRequestDto dto
    ) {
        BuildingResponseDto updated = buildingService.updateBuilding(dto);
        return ResponseEntity.ok(updated);
    }
}
