package com.parking.service;

import com.parking.dto.RoleRequestDto;
import com.parking.dto.RoleResponseDto;
import com.parking.dto.SyncPermissionsRequestDto;

import java.util.List;

public interface RoleService {

    RoleResponseDto createRole(RoleRequestDto dto);

    RoleResponseDto getRoleById(Long id);

    List<RoleResponseDto> getAllRoles();

    RoleResponseDto updateRole(Long id, RoleRequestDto dto);

    RoleResponseDto updateRolePermissions(Long id, List<Long> permissionIds);

    void syncPermissions(SyncPermissionsRequestDto request);

    void deleteRole(Long id);
}
