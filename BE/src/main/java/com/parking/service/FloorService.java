package com.parking.service;

import com.parking.dto.FloorRequestDto;
import com.parking.dto.FloorResponseDto;
import com.parking.dto.FloorStatsDto;

import java.util.List;

public interface FloorService {
    List<FloorResponseDto> getFloorsByBuildingId(Long buildingId);
    FloorResponseDto getFloorById(Long id);
    FloorResponseDto createFloor(FloorRequestDto request);
    FloorResponseDto updateFloor(Long id, FloorRequestDto request);
    void deleteFloor(Long id);
    FloorStatsDto getFloorStats(Long id);
}
