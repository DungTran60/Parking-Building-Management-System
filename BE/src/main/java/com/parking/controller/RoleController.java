package com.parking.controller;

import com.parking.dto.RoleRequestDto;
import com.parking.dto.RoleResponseDto;
import com.parking.dto.SyncPermissionsRequestDto;
import com.parking.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('roles:manage')")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<RoleResponseDto> createRole(@Valid @RequestBody RoleRequestDto dto) {
        RoleResponseDto createdRole = roleService.createRole(dto);
        return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponseDto> getRoleById(@PathVariable Long id) {
        RoleResponseDto role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }

    @GetMapping
    public ResponseEntity<List<RoleResponseDto>> getAllRoles() {
        List<RoleResponseDto> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponseDto> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequestDto dto) {
        RoleResponseDto updatedRole = roleService.updateRole(id, dto);
        return ResponseEntity.ok(updatedRole);
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<RoleResponseDto> updatePermissions(
            @PathVariable Long id,
            @RequestBody List<Long> permissionIds) {
        RoleResponseDto updatedRole = roleService.updateRolePermissions(id, permissionIds);
        return ResponseEntity.ok(updatedRole);
    }

    @PutMapping("/sync-permissions")
    public ResponseEntity<Void> syncPermissions(@Valid @RequestBody SyncPermissionsRequestDto request) {
        roleService.syncPermissions(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
