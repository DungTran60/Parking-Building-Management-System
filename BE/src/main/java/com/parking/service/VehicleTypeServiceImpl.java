package com.parking.service;

import com.parking.dto.VehicleTypeRequestDto;
import com.parking.dto.VehicleTypeResponseDto;
import com.parking.entity.VehicleType;
import com.parking.entity.VehicleTypeStatus;
import com.parking.exception.ResourceConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FloorRepository;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PricingRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleTypeServiceImpl implements VehicleTypeService {

    private final VehicleTypeRepository  vehicleTypeRepository;
    private final FloorRepository        floorRepository;
    private final PricingRepository      pricingRepository;
    private final ReservationRepository  reservationRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository  parkingSlotRepository;

    /* ─────────────────────────────────────────────────────
       Tạo loại xe mới
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public VehicleTypeResponseDto createVehicleType(VehicleTypeRequestDto dto) {
        String code = dto.getCode().trim().toUpperCase();
        String name = dto.getName().trim();

        if (vehicleTypeRepository.existsByCode(code)) {
            throw new ResourceConflictException("Vehicle type with code '" + code + "' already exists");
        }
        if (vehicleTypeRepository.existsByName(name)) {
            throw new ResourceConflictException("Vehicle type with name '" + name + "' already exists");
        }

        VehicleType vehicleType = VehicleType.builder()
                .code(code)
                .name(name)
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : VehicleTypeStatus.ACTIVE)
                .build();

        return mapToResponse(vehicleTypeRepository.save(vehicleType));
    }

    /* ─────────────────────────────────────────────────────
       Cập nhật loại xe
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public VehicleTypeResponseDto updateVehicleType(Long id, VehicleTypeRequestDto dto) {
        VehicleType vehicleType = findOrThrow(id);

        String code = dto.getCode().trim().toUpperCase();
        String name = dto.getName().trim();

        // Check duplicate code (exclude self)
        if (vehicleTypeRepository.existsByCodeAndIdNot(code, id)) {
            throw new ResourceConflictException("Vehicle type with code '" + code + "' already exists");
        }
        // Check duplicate name (exclude self)
        if (vehicleTypeRepository.existsByNameAndIdNot(name, id)) {
            throw new ResourceConflictException("Vehicle type with name '" + name + "' already exists");
        }

        vehicleType.setCode(code);
        vehicleType.setName(name);
        vehicleType.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            vehicleType.setStatus(dto.getStatus());
        }

        return mapToResponse(vehicleTypeRepository.save(vehicleType));
    }

    /* ─────────────────────────────────────────────────────
       Xóa loại xe
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public void deleteVehicleType(Long id) {
        VehicleType vehicleType = findOrThrow(id);

        // Check if in use
        if (floorRepository.existsBySupportedVehicleTypesId(id)) {
            throw new ResourceConflictException(
                    "Cannot delete vehicle type '" + vehicleType.getName() + "': it is referenced by Floor records");
        }
        if (pricingRepository.existsByVehicleTypeId(id)) {
            throw new ResourceConflictException(
                    "Cannot delete vehicle type '" + vehicleType.getName() + "': it is referenced by Pricing records");
        }
        if (reservationRepository.existsByVehicleTypeId(id)) {
            throw new ResourceConflictException(
                    "Cannot delete vehicle type '" + vehicleType.getName() + "': it is referenced by Reservation records");
        }
        if (parkingSessionRepository.existsByVehicleTypeId(id)) {
            throw new ResourceConflictException(
                    "Cannot delete vehicle type '" + vehicleType.getName() + "': it is referenced by Parking Session records");
        }
        if (parkingSlotRepository.existsByVehicleTypeId(id)) {
            throw new ResourceConflictException(
                    "Cannot delete vehicle type '" + vehicleType.getName() + "': it is referenced by Parking Slot records");
        }

        vehicleTypeRepository.delete(vehicleType);
    }

    /* ─────────────────────────────────────────────────────
       Lấy theo ID
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public VehicleTypeResponseDto getVehicleType(Long id) {
        return mapToResponse(findOrThrow(id));
    }

    /* ─────────────────────────────────────────────────────
       Lấy tất cả (tùy chọn lọc theo status)
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<VehicleTypeResponseDto> getAllVehicleTypes(VehicleTypeStatus status) {
        List<VehicleType> types = (status != null)
                ? vehicleTypeRepository.findByStatus(status)
                : vehicleTypeRepository.findAll();

        return types.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Helper methods
    ───────────────────────────────────────────────────── */
    private VehicleType findOrThrow(Long id) {
        return vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with ID: " + id));
    }

    private VehicleTypeResponseDto mapToResponse(VehicleType vt) {
        return VehicleTypeResponseDto.builder()
                .id(vt.getId())
                .code(vt.getCode())
                .name(vt.getName())
                .description(vt.getDescription())
                .status(vt.getStatus())
                .createdAt(vt.getCreatedAt())
                .updatedAt(vt.getUpdatedAt())
                .build();
    }
}
