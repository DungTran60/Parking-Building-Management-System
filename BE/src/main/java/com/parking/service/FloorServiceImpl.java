package com.parking.service;

import com.parking.dto.FloorRequestDto;
import com.parking.dto.FloorResponseDto;
import com.parking.dto.FloorStatsDto;
import com.parking.entity.Building;
import com.parking.entity.Floor;
import com.parking.entity.SlotStatus;
import com.parking.entity.VehicleType;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.BuildingRepository;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FloorServiceImpl implements FloorService {

    private final FloorRepository floorRepository;
    private final BuildingRepository buildingRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    @Override
    public List<FloorResponseDto> getAllFloors() {
        List<Floor> floors = floorRepository.findAll();
        return floors.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

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

    @Override
    public FloorResponseDto createFloor(FloorRequestDto request) {
        validateFloorRequest(request);

        if (floorRepository.existsByNameAndBuildingId(request.getName(), request.getBuildingId())) {
            throw new ResourceConflictException("Floor with name '" + request.getName() + "' already exists in this building.");
        }

        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        List<VehicleType> vehicleTypes = vehicleTypeRepository.findAllById(request.getSupportedVehicleTypeIds());
        if (vehicleTypes.size() != request.getSupportedVehicleTypeIds().size()) {
            throw new ResourceNotFoundException("One or more vehicle types not found");
        }

        Floor floor = Floor.builder()
                .building(building)
                .name(request.getName())
                .zone(request.getZone())
                .slotCount(request.getSlotCount())
                .supportedVehicleTypes(new HashSet<>(vehicleTypes))
                .build();

        Floor savedFloor = floorRepository.save(floor);
        return convertToDto(savedFloor);
    }

    @Override
    public FloorResponseDto updateFloor(Long id, FloorRequestDto request) {
        validateFloorRequest(request);

        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + id));

        if (!floor.getName().equals(request.getName()) && floorRepository.existsByNameAndBuildingId(request.getName(), request.getBuildingId())) {
            throw new ResourceConflictException("Floor with name '" + request.getName() + "' already exists in this building.");
        }

        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        List<VehicleType> vehicleTypes = vehicleTypeRepository.findAllById(request.getSupportedVehicleTypeIds());
        if (vehicleTypes.size() != request.getSupportedVehicleTypeIds().size()) {
            throw new ResourceNotFoundException("One or more vehicle types not found");
        }

        floor.setBuilding(building);
        floor.setName(request.getName());
        floor.setZone(request.getZone());
        floor.setSlotCount(request.getSlotCount());
        floor.setSupportedVehicleTypes(new HashSet<>(vehicleTypes));

        Floor updatedFloor = floorRepository.save(floor);
        return convertToDto(updatedFloor);
    }

    @Override
    public void deleteFloor(Long id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + id));

        // Note: Assuming ParkingSlot entity has a 'floor' field.
        // And ParkingSession is linked via ParkingSlot.
        // A more direct check might be needed depending on the domain model.
        if (!floorRepository.findParkingSlotsByFloorId(id).isEmpty()) {
            throw new ResourceConflictException("Cannot delete floor with active parking slots.");
        }

        floorRepository.delete(floor);
    }

    @Override
    public FloorStatsDto getFloorStats(Long id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + id));

        long totalSlots = floor.getSlotCount();
        long occupiedSlots = parkingSlotRepository.countByFloorIdAndStatus(id, SlotStatus.OCCUPIED);
        long availableSlots = parkingSlotRepository.countByFloorIdAndStatus(id, SlotStatus.AVAILABLE);
        long reservedSlots = parkingSlotRepository.countByFloorIdAndStatus(id, SlotStatus.RESERVED);
        long maintenanceSlots = parkingSlotRepository.countByFloorIdAndStatus(id, SlotStatus.MAINTENANCE);
        long blockedSlots = parkingSlotRepository.countByFloorIdAndStatus(id, SlotStatus.BLOCKED);

        double occupancyRate = (totalSlots > 0) ? ((double) occupiedSlots / totalSlots) * 100 : 0;

        return FloorStatsDto.builder()
                .totalSlots(totalSlots)
                .occupiedSlots(occupiedSlots)
                .availableSlots(availableSlots)
                .reservedSlots(reservedSlots)
                .maintenanceSlots(maintenanceSlots)
                .blockedSlots(blockedSlots)
                .occupancyRate(occupancyRate)
                .build();
    }

    private void validateFloorRequest(FloorRequestDto request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Floor name cannot be empty.");
        }
        if (request.getSlotCount() == null || request.getSlotCount() < 1) {
            throw new BadRequestException("Slot count must be at least 1.");
        }
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
