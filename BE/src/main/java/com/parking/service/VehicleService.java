package com.parking.service;

import com.parking.dto.VehicleRequestDto;
import com.parking.dto.VehicleResponseDto;

import java.util.List;

/**
 * Service quản lý danh mục phương tiện đã đăng ký (chuẩn hóa biển số).
 */
public interface VehicleService {

    VehicleResponseDto createVehicle(VehicleRequestDto dto);

    VehicleResponseDto updateVehicle(Long id, VehicleRequestDto dto);

    void deleteVehicle(Long id);

    VehicleResponseDto getVehicleById(Long id);

    List<VehicleResponseDto> getAllVehicles();

    /** Danh sách xe của tài khoản đang đăng nhập. */
    List<VehicleResponseDto> getMyVehicles();
}
