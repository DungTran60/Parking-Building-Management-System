package com.parking.service;

import com.parking.dto.RoleRequestDto;
import com.parking.dto.RoleResponseDto;

import java.util.List;

/**
 * Interface định nghĩa các nghiệp vụ (Service) để quản lý vai trò (Role).
 */
public interface RoleService {
    
    /**
     * Tạo một vai trò mới.
     * @param dto Dữ liệu tạo vai trò.
     * @return Thông tin vai trò vừa tạo.
     */
    RoleResponseDto createRole(RoleRequestDto dto);
    
    /**
     * Lấy thông tin vai trò bằng ID.
     * @param id ID của vai trò.
     * @return Thông tin vai trò tìm thấy.
     */
    RoleResponseDto getRoleById(Long id);
    
    /**
     * Lấy danh sách tất cả vai trò trong hệ thống.
     * @return Danh sách vai trò.
     */
    List<RoleResponseDto> getAllRoles();
    
    /**
     * Cập nhật thông tin vai trò hiện có.
     * @param id ID của vai trò cần cập nhật.
     * @param dto Dữ liệu cập nhật mới.
     * @return Thông tin vai trò sau khi cập nhật.
     */
    RoleResponseDto updateRole(Long id, RoleRequestDto dto);
    
    /**
     * Xóa vai trò bằng ID.
     * @param id ID của vai trò cần xóa.
     */
    void deleteRole(Long id);
}
