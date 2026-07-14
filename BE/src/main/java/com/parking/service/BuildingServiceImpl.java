package com.parking.service;

import com.parking.dto.BuildingRequestDto;
import com.parking.dto.BuildingResponseDto;
import com.parking.entity.Building;
import com.parking.exception.ResourceNotFoundException;
import com.parking.exception.ResourceConflictException;
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

    private static final Long SINGLETON_ID = 1L;

    @Override
    @Transactional(readOnly = true)
    public BuildingResponseDto getBuilding() {
        Building building = buildingRepository.findById(SINGLETON_ID)
                .orElseGet(() -> {
                    Building defaultBuilding = Building.builder()
                            .buildingName("Main Building")
                            .address("Default Address")
                            .build();
                    return buildingRepository.save(defaultBuilding);
                });
        return mapToResponseDto(building);
    }

    @Override
    @Transactional
    public BuildingResponseDto updateBuilding(BuildingRequestDto dto) {
        Building building = buildingRepository.findById(SINGLETON_ID)
                .orElse(Building.builder().buildingName(dto.getBuildingName()).address(dto.getAddress()).build());
        
        building.setBuildingName(dto.getBuildingName());
        building.setAddress(dto.getAddress());
        building.setHotline(dto.getHotline());
        building.setEmail(dto.getEmail());
        building.setOpeningTime(dto.getOpeningTime());
        building.setClosingTime(dto.getClosingTime());
        building.setDescription(dto.getDescription());
        building.setParkingRules(dto.getParkingRules());
        building.setPaymentMode(dto.getPaymentMode());
        building.setAutoBlockOverdueSlots(dto.getAutoBlockOverdueSlots());
        building.setAvatarUrl(dto.getAvatarUrl());

        Building updatedBuilding = buildingRepository.save(building);
        return mapToResponseDto(updatedBuilding);
    }

    private BuildingResponseDto mapToResponseDto(Building building) {
        return BuildingResponseDto.builder()
                .id(building.getId())
                .buildingName(building.getBuildingName())
                .address(building.getAddress())
                .hotline(building.getHotline())
                .email(building.getEmail())
                .openingTime(building.getOpeningTime())
                .closingTime(building.getClosingTime())
                .description(building.getDescription())
                .parkingRules(building.getParkingRules())
                .paymentMode(building.getPaymentMode())
                .autoBlockOverdueSlots(building.getAutoBlockOverdueSlots())
                .avatarUrl(building.getAvatarUrl())
                .totalFloors(building.getFloors() != null ? building.getFloors().size() : 0)
                .createdAt(building.getCreatedAt())
                .build();
    }
}
