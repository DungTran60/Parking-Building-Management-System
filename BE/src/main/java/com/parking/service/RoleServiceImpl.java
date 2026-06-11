package com.parking.service;

import com.parking.dto.RoleRequestDto;
import com.parking.dto.RoleResponseDto;
import com.parking.entity.Role;
import com.parking.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Lớp triển khai (Implementation) của RoleService xử lý các nghiệp vụ quản lý vai trò.
 */
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    // Tiêm (Inject) RoleRepository thông qua Constructor
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public RoleResponseDto createRole(RoleRequestDto dto) {
        // Chuyển tên vai trò thành chữ in hoa để đồng nhất chuẩn (ví dụ: ADMIN, STAFF)
        String roleNameUpper = dto.getName().toUpperCase();
        
        // Kiểm tra xem tên vai trò đã tồn tại chưa
        if (roleRepository.findByName(roleNameUpper).isPresent()) {
            throw new IllegalArgumentException("Role name already exists: " + roleNameUpper);
        }

        // Tạo thực thể Role mới từ Builder
        Role role = Role.builder()
                .name(roleNameUpper)
                .build();

        // Lưu vào cơ sở dữ liệu
        Role savedRole = roleRepository.save(role);
        return mapToResponseDto(savedRole);
    }

    @Override
    public RoleResponseDto getRoleById(Long id) {
        // Tìm vai trò theo ID, ném lỗi nếu không tồn tại
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));
        return mapToResponseDto(role);
    }

    @Override
    public List<RoleResponseDto> getAllRoles() {
        // Lấy toàn bộ danh sách vai trò và chuyển sang DTO
        return roleRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoleResponseDto updateRole(Long id, RoleRequestDto dto) {
        // Tìm thực thể cần cập nhật
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));

        String roleNameUpper = dto.getName().toUpperCase();
        // Nếu tên cập nhật khác tên hiện tại thì tiến hành kiểm tra trùng lặp
        if (!roleNameUpper.equals(role.getName())) {
            if (roleRepository.findByName(roleNameUpper).isPresent()) {
                throw new IllegalArgumentException("Role name already exists: " + roleNameUpper);
            }
            role.setName(roleNameUpper);
        }

        Role updatedRole = roleRepository.save(role);
        return mapToResponseDto(updatedRole);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        // Kiểm tra tồn tại trước khi xóa
        if (!roleRepository.existsById(id)) {
            throw new IllegalArgumentException("Role not found with ID: " + id);
        }
        roleRepository.deleteById(id);
    }

    /**
     * Phương thức nội bộ chuyển đổi đối tượng Entity Role sang DTO RoleResponseDto.
     */
    private RoleResponseDto mapToResponseDto(Role role) {
        return RoleResponseDto.builder()
                .id(role.getId())
                .name(role.getName())
                .build();
    }
}
