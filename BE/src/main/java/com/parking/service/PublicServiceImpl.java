package com.parking.service;

import com.parking.dto.PublicStatsDto;
import com.parking.entity.SlotStatus;
import com.parking.repository.BuildingRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicServiceImpl implements PublicService {

    private final BuildingRepository buildingRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public PublicStatsDto getStats() {
        return PublicStatsDto.builder()
                .totalBuildings(buildingRepository.count())
                .totalSlots(parkingSlotRepository.count())
                .availableSlots(parkingSlotRepository.countByStatus(SlotStatus.AVAILABLE))
                .totalVehicleTypes(vehicleTypeRepository.count())
                .build();
    }
}
