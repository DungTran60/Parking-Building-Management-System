package com.parking.service;

import com.parking.dto.FloorResponseDto;

import java.util.List;

public interface FloorService {
    List<FloorResponseDto> getFloorsByBuildingId(Long buildingId);
}