package com.parking.service;

import com.parking.dto.FloorResponseDto;
import com.parking.entity.Floor;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FloorServiceImpl implements FloorService {

    private final FloorRepository floorRepository;

    @Override
    public List<FloorResponseDto> getFloorsByBuildingId(Long buildingId) {
        List<Floor> floors = floorRepository.findByBuildingId(buildingId);
        return floors.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public FloorResponseDto getFloorById(Long id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + id));
        return convertToDto(floor);
    }

    private FloorResponseDto convertToDto(Floor floor) {
        return FloorResponseDto.builder()
                .id(floor.getId())
                .buildingId(floor.getBuilding().getId())
                .name(floor.getName())
                .zone(floor.getZone())
                .slotCount(floor.getSlotCount())
                .supportedVehicleTypeIds(floor.getSupportedVehicleTypes().stream()
                        .map(vehicleType -> vehicleType.getId().toString())
                        .collect(Collectors.toList()))
                .build();
    }
}
