package com.parking.service;

import com.parking.dto.VehicleTypeRequestDto;
import com.parking.dto.VehicleTypeResponseDto;
import com.parking.entity.VehicleTypeStatus;

import java.util.List;

public interface VehicleTypeService {

    VehicleTypeResponseDto createVehicleType(VehicleTypeRequestDto dto);

    VehicleTypeResponseDto updateVehicleType(Long id, VehicleTypeRequestDto dto);

    void deleteVehicleType(Long id);

    VehicleTypeResponseDto getVehicleType(Long id);

    List<VehicleTypeResponseDto> getAllVehicleTypes(VehicleTypeStatus status);
}
