package com.parking.controller;

import com.parking.dto.FloorResponseDto;
import com.parking.service.FloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    public ResponseEntity<List<FloorResponseDto>> getFloorsByBuildingId(@RequestParam Long buildingId) {
        List<FloorResponseDto> floors = floorService.getFloorsByBuildingId(buildingId);
        return ResponseEntity.ok(floors);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FloorResponseDto> getFloorById(@PathVariable Long id) {
        FloorResponseDto floor = floorService.getFloorById(id);
        return ResponseEntity.ok(floor);
    }
}
