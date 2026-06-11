package com.parking.dto;

import lombok.*;

/**
 * Data Transfer Object đại diện cho thông tin vai trò (Role) trả về cho phía client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleResponseDto {
    
    // ID của vai trò
    private Long id;
    
    // Tên của vai trò (ví dụ: ADMIN, MANAGER, STAFF, DRIVER)
    private String name;
}
