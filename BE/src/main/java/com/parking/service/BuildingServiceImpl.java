package com.parking.service;

import com.parking.dto.BuildingRequestDto;
import com.parking.dto.BuildingResponseDto;
import com.parking.entity.Building;
import com.parking.exception.ResourceNotFoundException;
import com.parking.exception.ConflictException;
import com.parking.repository.BuildingRepository;
import com.parking.repository.FloorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuildingServiceImpl implements BuildingService {

    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;

    @Override
    @Transactional
    public BuildingResponseDto createBuilding(BuildingRequestDto dto) {
        if (buildingRepository.findByBuildingName(dto.getBuildingName()).isPresent()) {
            throw new IllegalArgumentException("Building name already exists: " + dto.getBuildingName());
        }

        Building building = Building.builder()
                .buildingName(dto.getBuildingName())
                .address(dto.getAddress())
                .build();

        Building savedBuilding = buildingRepository.save(building);
        return mapToResponseDto(savedBuilding);
    }

    @Override
    @Transactional(readOnly = true)
    public BuildingResponseDto getBuildingById(Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with ID: " + id));
        return mapToResponseDto(building);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponseDto> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BuildingResponseDto updateBuilding(Long id, BuildingRequestDto dto) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with ID: " + id));

        // If the name is changed, verify it doesn't collide with other buildings
        if (!building.getBuildingName().equals(dto.getBuildingName())) {
            if (buildingRepository.findByBuildingName(dto.getBuildingName()).isPresent()) {
                throw new IllegalArgumentException("Building name already exists: " + dto.getBuildingName());
            }
            building.setBuildingName(dto.getBuildingName());
        }

        building.setAddress(dto.getAddress());

        Building updatedBuilding = buildingRepository.save(building);
        return mapToResponseDto(updatedBuilding);
    }

    @Override
    @Transactional
    public void deleteBuilding(Long id) {
        if (!buildingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Building not found with ID: " + id);
        }
        if (floorRepository.existsByBuildingId(id)) {
            throw new ConflictException("Cannot delete building because it still contains floors");
        }
        buildingRepository.deleteById(id);
    }

    private BuildingResponseDto mapToResponseDto(Building building) {
        return BuildingResponseDto.builder()
                .id(building.getId())
                .buildingName(building.getBuildingName())
                .address(building.getAddress())
                .totalFloors((int) floorRepository.countByBuildingId(building.getId()))
                .createdAt(building.getCreatedAt())
                .build();
    }
}
