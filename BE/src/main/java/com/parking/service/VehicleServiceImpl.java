package com.parking.service;

import com.parking.dto.VehicleRequestDto;
import com.parking.dto.VehicleResponseDto;
import com.parking.entity.User;
import com.parking.entity.Vehicle;
import com.parking.entity.VehicleType;
import com.parking.exception.BadRequestException;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final UserRepository userRepository;
    private final AuthenticationService authenticationService;

    @Override
    @Transactional
    public VehicleResponseDto createVehicle(VehicleRequestDto dto) {
        String plate = dto.getPlateNumber().trim().toUpperCase();
        if (vehicleRepository.existsByPlateNumber(plate)) {
            throw new ConflictException("Biển số xe đã tồn tại: " + plate);
        }
        VehicleType vehicleType = resolveVehicleType(dto.getVehicleTypeId());
        User owner = resolveOwner(dto.getOwnerUserId());

        Vehicle vehicle = Vehicle.builder()
                .plateNumber(plate)
                .vehicleType(vehicleType)
                .owner(owner)
                .color(dto.getColor())
                .build();
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    public VehicleResponseDto updateVehicle(Long id, VehicleRequestDto dto) {
        Vehicle vehicle = findOrThrow(id);
        String plate = dto.getPlateNumber().trim().toUpperCase();
        if (!vehicle.getPlateNumber().equalsIgnoreCase(plate) && vehicleRepository.existsByPlateNumber(plate)) {
            throw new ConflictException("Biển số xe đã tồn tại: " + plate);
        }
        vehicle.setPlateNumber(plate);
        vehicle.setVehicleType(resolveVehicleType(dto.getVehicleTypeId()));
        vehicle.setColor(dto.getColor());
        if (dto.getOwnerUserId() != null) {
            vehicle.setOwner(resolveOwner(dto.getOwnerUserId()));
        }
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy phương tiện với ID: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    @Override
    public VehicleResponseDto getVehicleById(Long id) {
        return mapToResponse(findOrThrow(id));
    }

    @Override
    public List<VehicleResponseDto> getAllVehicles() {
        return vehicleRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<VehicleResponseDto> getMyVehicles() {
        User currentUser = authenticationService.getCurrentUser();
        if (currentUser == null) {
            throw new BadRequestException("Không xác định được người dùng hiện tại.");
        }
        return vehicleRepository.findByOwnerIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::mapToResponse).toList();
    }

    /* ───────────────── Helpers ───────────────── */

    private Vehicle findOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương tiện với ID: " + id));
    }

    private VehicleType resolveVehicleType(Long vehicleTypeId) {
        return vehicleTypeRepository.findById(vehicleTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại xe với ID: " + vehicleTypeId));
    }

    /** Owner tường minh nếu có; ngược lại gắn cho người dùng đang đăng nhập (có thể null). */
    private User resolveOwner(Long ownerUserId) {
        if (ownerUserId != null) {
            return userRepository.findById(ownerUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + ownerUserId));
        }
        return authenticationService.getCurrentUser();
    }

    private VehicleResponseDto mapToResponse(Vehicle v) {
        return VehicleResponseDto.builder()
                .id(v.getId())
                .plateNumber(v.getPlateNumber())
                .vehicleTypeId(v.getVehicleType().getId())
                .vehicleTypeName(v.getVehicleType().getName())
                .ownerUserId(v.getOwner() != null ? v.getOwner().getId() : null)
                .ownerUsername(v.getOwner() != null ? v.getOwner().getUsername() : null)
                .color(v.getColor())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
