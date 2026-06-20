package com.parking.service;

import com.parking.dto.ParkingSlotResponseDto;
import com.parking.dto.SlotStatusUpdateRequestDto;
import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingSlotServiceImpl implements ParkingSlotService {

    private final ParkingSlotRepository parkingSlotRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ParkingSlotResponseDto> getAllSlots() {
        return parkingSlotRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingSlotResponseDto> getAvailableSlots(String vehicleTypeId) {
        List<ParkingSlot> slots;
        if (vehicleTypeId != null && !vehicleTypeId.trim().isEmpty()) {
            slots = parkingSlotRepository.findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, vehicleTypeId);
        } else {
            slots = parkingSlotRepository.findByStatus(SlotStatus.AVAILABLE);
        }
        return slots.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto updateSlotStatus(Long id, SlotStatusUpdateRequestDto request) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
        slot.setStatus(request.getStatus());
        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    private ParkingSlotResponseDto convertToDto(ParkingSlot slot) {
        return ParkingSlotResponseDto.builder()
                .id(String.valueOf(slot.getId()))
                .code(slot.getCode())
                .floorId(String.valueOf(slot.getFloor().getId()))
                .vehicleTypeId(slot.getVehicleType().getId())
                .status(slot.getStatus())
                .updatedAt(slot.getUpdatedAt())
                .build();
    }
}
