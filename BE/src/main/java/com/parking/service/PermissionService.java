package com.parking.service;

import com.parking.dto.PermissionResponseDto;

import java.util.List;

public interface PermissionService {
    List<PermissionResponseDto> getAllPermissions();
}
