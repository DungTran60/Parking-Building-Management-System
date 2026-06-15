package com.parking.service;

import com.parking.dto.BuildingRequestDto;
import com.parking.dto.BuildingResponseDto;
import java.util.List;

public interface BuildingService {
    BuildingResponseDto createBuilding(BuildingRequestDto dto);
    BuildingResponseDto getBuildingById(Long id);
    List<BuildingResponseDto> getAllBuildings();
    BuildingResponseDto updateBuilding(Long id, BuildingRequestDto dto);
    void deleteBuilding(Long id);
}
