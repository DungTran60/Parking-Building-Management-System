package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Data Transfer Object dùng để nhận dữ liệu khi tạo mới hoặc cập nhật vai trò (Role).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequestDto {

    // Tên vai trò không được để trống và phải có độ dài từ 2 đến 50 ký tự
    @NotBlank(message = "Role name is required")
    @Size(min = 2, max = 50, message = "Role name must be between 2 and 50 characters")
    private String name;
}
