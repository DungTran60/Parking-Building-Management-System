package com.parking.dto;

import jakarta.validation.constraints.Email;
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

    // Email mới (nếu muốn thay đổi)
    @Email(message = "Email format is invalid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    // Số điện thoại mới (nếu muốn thay đổi)
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    // Mật khẩu hiện tại để xác minh danh tính trước khi cập nhật
    private String currentPassword;

    // Mật khẩu mới (nếu muốn thay đổi)
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;
}

