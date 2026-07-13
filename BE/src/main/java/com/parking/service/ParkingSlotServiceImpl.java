package com.parking.service;

import com.parking.dto.ParkingSlotRequestDto;
import com.parking.dto.ParkingSlotResponseDto;
import com.parking.dto.SlotStatusUpdateRequestDto;
import com.parking.entity.Floor;
import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import com.parking.entity.VehicleType;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
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
        slots.sort(Comparator
                .comparing((ParkingSlot s) -> s.getFloor().getId())
                .thenComparing(ParkingSlot::getCode));
        return slots.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto updateSlotStatus(Long id, SlotStatusUpdateRequestDto request) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        SlotStatus currentStatus = slot.getStatus();
        SlotStatus newStatus = request.getStatus();

        validateStatusTransition(currentStatus, newStatus);

        slot.setStatus(newStatus);
        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto createSlot(ParkingSlotRequestDto request) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        if (parkingSlotRepository.existsByCode(normalizedCode)) {
            throw new ConflictException("Slot code already exists");
        }

        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + request.getFloorId()));
        VehicleType vehicleType = resolveVehicleType(request.getVehicleTypeId());

        // Validate if vehicle type is supported by the floor
        if (floor.getSupportedVehicleTypes().stream().noneMatch(vt -> vt.getId().equals(vehicleType.getId()))) {
            throw new ConflictException("Vehicle type " + vehicleType.getCode() + " is not supported by floor " + floor.getName());
        }
        if (parkingSlotRepository.countByFloorId(floor.getId()) >= floor.getSlotCount()) {
            throw new ConflictException("Floor has reached its configured slot capacity");
        }

        ParkingSlot slot = ParkingSlot.builder()
                .code(normalizedCode)
                .floor(floor)
                .vehicleType(vehicleType)
                .status(SlotStatus.AVAILABLE)
                .build();
        ParkingSlot saved = parkingSlotRepository.save(slot);
        return convertToDto(saved);
    }

    @Override
    @Transactional
    public ParkingSlotResponseDto updateSlot(Long id, ParkingSlotRequestDto request) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        if (slot.getStatus() == SlotStatus.OCCUPIED || slot.getStatus() == SlotStatus.RESERVED) {
            throw new ConflictException("Cannot edit an OCCUPIED or RESERVED slot");
        }

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (parkingSlotRepository.existsByCodeAndIdNot(normalizedCode, id)) {
            throw new ConflictException("Slot code already exists");
        }
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with id: " + request.getFloorId()));
        VehicleType vehicleType = resolveVehicleType(request.getVehicleTypeId());
        if (floor.getSupportedVehicleTypes().stream().noneMatch(vt -> vt.getId().equals(vehicleType.getId()))) {
            throw new ConflictException("Vehicle type " + vehicleType.getCode() + " is not supported by floor " + floor.getName());
        }
        if (!slot.getFloor().getId().equals(floor.getId())
                && parkingSlotRepository.countByFloorId(floor.getId()) >= floor.getSlotCount()) {
            throw new ConflictException("Floor has reached its configured slot capacity");
        }
        validateStatusTransition(slot.getStatus(), request.getStatus());
        slot.setCode(normalizedCode);
        slot.setFloor(floor);
        slot.setVehicleType(vehicleType);
        slot.setStatus(request.getStatus());

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

    private void validateStatusTransition(SlotStatus currentStatus, SlotStatus newStatus) {
        if (newStatus == null) {
            throw new ConflictException("Slot status is required");
        }
        if ((currentStatus == SlotStatus.OCCUPIED || currentStatus == SlotStatus.RESERVED)
                && (newStatus == SlotStatus.MAINTENANCE || newStatus == SlotStatus.BLOCKED)) {
            throw new ConflictException("Cannot put an OCCUPIED or RESERVED slot into maintenance or blocked state");
        }
    }
}
