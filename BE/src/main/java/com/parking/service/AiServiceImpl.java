package com.parking.service;

import com.parking.dto.AiOptimizeRequestDto;
import com.parking.dto.AiOptimizeResponseDto;
import com.parking.entity.Floor;
import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final VehicleTypeRepository vehicleTypeRepository;
    private final FloorRepository floorRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    @Override
    @Transactional(readOnly = true)
    public AiOptimizeResponseDto optimize(AiOptimizeRequestDto request) {
        VehicleType vehicleType = resolveVehicleType(request.getVehicleTypeId());

        List<Floor> floors = floorRepository.findAll().stream()
                .filter(f -> f.getSupportedVehicleTypes().stream()
                        .anyMatch(vt -> vt.getId().equals(vehicleType.getId())))
                .toList();

        if (floors.isEmpty()) {
            throw new ResourceNotFoundException("No floor supports vehicle type: " + vehicleType.getName());
        }

        int totalSlots = floors.stream().mapToInt(Floor::getSlotCount).sum();

        Floor chosenFloor = floors.stream().max((a, b) -> {
            long availA = parkingSlotRepository.countByFloorIdAndStatus(a.getId(), SlotStatus.AVAILABLE);
            long availB = parkingSlotRepository.countByFloorIdAndStatus(b.getId(), SlotStatus.AVAILABLE);
            return Long.compare(availA, availB);
        }).orElse(floors.get(0));

        final Floor bestFloor = chosenFloor;

        ParkingSlot suggestedSlot = parkingSlotRepository
                .findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, vehicleType.getId())
                .stream()
                .filter(s -> s.getFloor().getId().equals(bestFloor.getId()))
                .findFirst()
                .orElse(null);

        long availableCount = parkingSlotRepository.countByFloorIdAndStatus(bestFloor.getId(), SlotStatus.AVAILABLE);
        int capacity = Math.max(1, bestFloor.getSlotCount());
        int occupied = capacity - (int) availableCount;
        double occupancyRate = ((double) occupied / capacity) * 100;
        int occupancyForecast = Math.min(98, (int) Math.round(occupancyRate + 8));

        String peakHourForecast = occupancyForecast > 85 ? "17:30 - 19:00" : "07:30 - 09:00";

        return AiOptimizeResponseDto.builder()
                .floorSuggestion(bestFloor.getName() + " - " + (bestFloor.getZone() != null ? bestFloor.getZone() : ""))
                .slotSuggestion(suggestedSlot != null ? suggestedSlot.getCode() : "N/A")
                .occupancyForecast(occupancyForecast)
                .peakHourForecast(peakHourForecast)
                .confidence(88)
                .build();
    }

    private VehicleType resolveVehicleType(String vehicleTypeRef) {
        if (vehicleTypeRef == null || vehicleTypeRef.trim().isEmpty()) {
            throw new ResourceNotFoundException("Vehicle type reference is required");
        }
        try {
            Long numericId = Long.parseLong(vehicleTypeRef.trim());
            return vehicleTypeRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with ID: " + numericId));
        } catch (NumberFormatException e) {
            return vehicleTypeRepository.findByCode(vehicleTypeRef.trim().toUpperCase())
                    .or(() -> vehicleTypeRepository.findByCode(vehicleTypeRef.trim()))
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found: " + vehicleTypeRef));
        }
    }
}
