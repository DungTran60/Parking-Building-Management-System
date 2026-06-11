package com.parking.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Data Transfer Object chứa thông tin yêu cầu cập nhật hồ sơ cá nhân của người dùng hiện tại.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateDto {

    // Tên đăng nhập mới (nếu muốn thay đổi)
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    // Mật khẩu hiện tại để xác minh danh tính trước khi cập nhật
    private String currentPassword;

    // Mật khẩu mới (nếu muốn thay đổi)
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;
}
