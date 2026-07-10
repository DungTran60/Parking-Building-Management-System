package com.parking.service;

import com.parking.dto.BuildingRequestDto;
import com.parking.dto.BuildingResponseDto;
import java.util.List;

public interface BuildingService {
    BuildingResponseDto getBuilding();
    BuildingResponseDto updateBuilding(BuildingRequestDto dto);
}
