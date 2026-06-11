package com.parking.controller;

import com.parking.dto.RoleRequestDto;
import com.parking.dto.RoleResponseDto;
import com.parking.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cung cấp các API quản lý vai trò (Role), giới hạn truy cập cho ADMIN.
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
// Enforce class-level security to verify that only ADMIN can hit any of these endpoints
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService roleService;

    /**
     * API tạo vai trò mới.
     * HTTP Method: POST
     * URL: /api/roles
     */
    @PostMapping
    public ResponseEntity<RoleResponseDto> createRole(@Valid @RequestBody RoleRequestDto dto) {
        RoleResponseDto createdRole = roleService.createRole(dto);
        return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
    }

    /**
     * API lấy thông tin vai trò theo ID.
     * HTTP Method: GET
     * URL: /api/roles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponseDto> getRoleById(@PathVariable Long id) {
        RoleResponseDto role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }

    /**
     * API lấy danh sách tất cả các vai trò.
     * HTTP Method: GET
     * URL: /api/roles
     */
    @GetMapping
    public ResponseEntity<List<RoleResponseDto>> getAllRoles() {
        List<RoleResponseDto> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * API cập nhật thông tin vai trò.
     * HTTP Method: PUT
     * URL: /api/roles/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<RoleResponseDto> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequestDto dto
    ) {
        RoleResponseDto updatedRole = roleService.updateRole(id, dto);
        return ResponseEntity.ok(updatedRole);
    }

    /**
     * API xóa vai trò.
     * HTTP Method: DELETE
     * URL: /api/roles/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
