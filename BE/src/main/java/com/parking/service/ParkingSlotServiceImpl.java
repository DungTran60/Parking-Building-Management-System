package com.parking.service;

import com.parking.dto.ParkingSlotRequestDto;
import com.parking.dto.ParkingSlotResponseDto;
import com.parking.dto.SlotStatusUpdateRequestDto;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingSlotServiceImpl implements ParkingSlotService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final FloorRepository floorRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

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
            Long vtId = resolveVehicleTypeId(vehicleTypeId);
            slots = parkingSlotRepository.findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, vtId);
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

    @Override
    @Transactional
    public ParkingSlotResponseDto createSlot(ParkingSlotRequestDto request) {
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + request.getFloorId()));
        VehicleType vehicleType = resolveVehicleType(request.getVehicleTypeId());

        ParkingSlot slot = ParkingSlot.builder()
                .code(request.getCode())
                .floor(floor)
                .vehicleType(vehicleType)
                .status(request.getStatus() != null ? request.getStatus() : SlotStatus.AVAILABLE)
                .build();
        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto updateSlot(Long id, ParkingSlotRequestDto request) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        if (request.getCode() != null) {
            slot.setCode(request.getCode());
        }
        if (request.getFloorId() != null) {
            Floor floor = floorRepository.findById(request.getFloorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + request.getFloorId()));
            slot.setFloor(floor);
        }
        if (request.getVehicleTypeId() != null) {
            VehicleType vehicleType = resolveVehicleType(request.getVehicleTypeId());
            slot.setVehicleType(vehicleType);
        }
        if (request.getStatus() != null) {
            slot.setStatus(request.getStatus());
        }

        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public void deleteSlot(Long id) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
        parkingSlotRepository.delete(slot);
    }

    private ParkingSlotResponseDto convertToDto(ParkingSlot slot) {
        return ParkingSlotResponseDto.builder()
                .id(String.valueOf(slot.getId()))
                .code(slot.getCode())
                .floorId(String.valueOf(slot.getFloor().getId()))
                .vehicleTypeId(String.valueOf(slot.getVehicleType().getId()))
                .status(slot.getStatus())
                .updatedAt(slot.getUpdatedAt())
                .build();
    }

    private VehicleType resolveVehicleType(String vehicleTypeRef) {
        try {
            Long numericId = Long.parseLong(vehicleTypeRef.trim());
            return vehicleTypeRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle type not found with ID: " + numericId));
        } catch (NumberFormatException e) {
            return vehicleTypeRepository.findByCode(vehicleTypeRef.trim().toUpperCase())
                    .or(() -> vehicleTypeRepository.findByCode(vehicleTypeRef.trim()))
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle type not found: " + vehicleTypeRef));
        }
    }

    private Long resolveVehicleTypeId(String vehicleTypeRef) {
        return resolveVehicleType(vehicleTypeRef).getId();
    }
}
