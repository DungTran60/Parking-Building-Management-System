package com.parking.controller;

import com.parking.dto.FloorRequestDto;
import com.parking.dto.FloorResponseDto;
import com.parking.dto.FloorStatsDto;
import com.parking.service.FloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/floors")
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FloorResponseDto>> getFloorsByBuildingId(@RequestParam(required = false) Long buildingId) {
        List<FloorResponseDto> floors;
        if (buildingId != null) {
            floors = floorService.getFloorsByBuildingId(buildingId);
        } else {
            floors = floorService.getAllFloors();
        }
        return ResponseEntity.ok(floors);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FloorResponseDto> getFloorById(@PathVariable Long id) {
        FloorResponseDto floor = floorService.getFloorById(id);
        return ResponseEntity.ok(floor);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public ResponseEntity<FloorResponseDto> createFloor(@RequestBody FloorRequestDto request) {
        FloorResponseDto createdFloor = floorService.createFloor(request);
        return new ResponseEntity<>(createdFloor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public ResponseEntity<FloorResponseDto> updateFloor(@PathVariable Long id, @RequestBody FloorRequestDto request) {
        FloorResponseDto updatedFloor = floorService.updateFloor(id, request);
        return ResponseEntity.ok(updatedFloor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deleteFloor(@PathVariable Long id) {
        floorService.deleteFloor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FloorStatsDto> getFloorStats(@PathVariable Long id) {
        FloorStatsDto stats = floorService.getFloorStats(id);
        return ResponseEntity.ok(stats);
    }
}
