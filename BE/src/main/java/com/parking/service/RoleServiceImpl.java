package com.parking.service;

import com.parking.dto.RoleRequestDto;
import com.parking.dto.RoleResponseDto;
import com.parking.dto.SyncPermissionsRequestDto;
import com.parking.entity.Permission;
import com.parking.entity.Role;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.PermissionRepository;
import com.parking.repository.RoleRepository;
import com.parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public RoleResponseDto createRole(RoleRequestDto dto) {
        String roleNameUpper = dto.getName().toUpperCase();

        if (roleRepository.findByName(roleNameUpper).isPresent()) {
            throw new IllegalArgumentException("Role name already exists: " + roleNameUpper);
        }

        Set<Permission> permissions = resolvePermissions(dto.getPermissionIds());

        Role role = Role.builder()
                .name(roleNameUpper)
                .permissions(permissions)
                .build();

        Role savedRole = roleRepository.save(role);
        return mapToResponseDto(savedRole);
    }

    @Override
    public RoleResponseDto getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));
        return mapToResponseDto(role);
    }

    @Override
    public List<RoleResponseDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoleResponseDto updateRole(Long id, RoleRequestDto dto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));

        String roleNameUpper = dto.getName().toUpperCase();
        if (!roleNameUpper.equals(role.getName())) {
            if (roleRepository.findByName(roleNameUpper).isPresent()) {
                throw new IllegalArgumentException("Role name already exists: " + roleNameUpper);
            }
            role.setName(roleNameUpper);
        }

        if (dto.getPermissionIds() != null) {
            role.setPermissions(resolvePermissions(dto.getPermissionIds()));
        }

        Role updatedRole = roleRepository.save(role);
        return mapToResponseDto(updatedRole);
    }

    @Override
    @Transactional
    public RoleResponseDto updateRolePermissions(Long id, List<Long> permissionIds) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));

        role.setPermissions(resolvePermissions(permissionIds));
        Role updatedRole = roleRepository.save(role);
        return mapToResponseDto(updatedRole);
    }

    @Override
    @Transactional
    public void syncPermissions(SyncPermissionsRequestDto request) {
        for (SyncPermissionsRequestDto.RolePermissionEntry entry : request.getRoles()) {
            Role role = roleRepository.findById(entry.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + entry.getRoleId()));
            role.setPermissions(resolvePermissions(entry.getPermissionIds()));
            roleRepository.save(role);
        }
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new IllegalArgumentException("Role not found with ID: " + id);
        }
        if (userRepository.existsByRole_Id(id)) {
            throw new ConflictException("Cannot delete a role that is currently assigned to one or more users");
        }
        roleRepository.deleteById(id);
    }

    private Set<Permission> resolvePermissions(List<Long> permissionIds) {
        if (permissionIds == null || permissionIds.isEmpty()) {
            return Collections.emptySet();
        }
        List<Permission> found = permissionRepository.findAllById(permissionIds);
        if (found.size() != permissionIds.size()) {
            throw new IllegalArgumentException("One or more permission IDs are invalid");
        }
        return new HashSet<>(found);
    }

    private RoleResponseDto mapToResponseDto(Role role) {
        List<String> permissionNames = role.getPermissions() == null
                ? Collections.emptyList()
                : role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.toList());

        return RoleResponseDto.builder()
                .id(role.getId())
                .name(role.getName())
                .permissions(permissionNames)
                .build();
    }
}
