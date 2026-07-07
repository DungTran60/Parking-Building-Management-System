package com.parking.service;

import com.parking.dto.UserCreateDto;
import com.parking.dto.UserResponseDto;
import com.parking.dto.UserStatusResponseDto;
import com.parking.dto.UserStatusUpdateDto;
import com.parking.dto.UserUpdateDto;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

import com.parking.dto.UserProfileUpdateDto;

/**
 * Interface nghiệp vụ quản lý người dùng (User), kế thừa cơ chế nạp thông tin user của Spring Security.
 */
public interface UserService extends UserDetailsService {
    
    /**
     * Tạo tài khoản người dùng mới.
     */
    UserResponseDto createUser(UserCreateDto dto);
    
    /**
     * Lấy thông tin người dùng bằng ID.
     */
    UserResponseDto getUserById(Long id);
    
    /**
     * Lấy thông tin người dùng theo tên đăng nhập.
     */
    UserResponseDto getUserByUsername(String username);
    
    /**
     * Lấy toàn bộ danh sách người dùng.
     */
    List<UserResponseDto> getAllUsers();
    
    /**
     * Cập nhật thông tin người dùng theo ID (Admin quản trị).
     */
    UserResponseDto updateUser(Long id, UserUpdateDto dto);
    
    /**
     * Xóa tài khoản người dùng.
     */
    void deleteUser(Long id);

    /**
     * Cập nhật trạng thái tài khoản người dùng.
     */
    UserStatusResponseDto updateUserStatus(Long id, UserStatusUpdateDto dto);

    /**
     * Lấy thông tin hồ sơ của người dùng hiện tại đang đăng nhập.
     * @param username Tên tài khoản hiện tại.
     * @return DTO chứa thông tin hồ sơ cá nhân.
     */
    UserResponseDto getProfile(String username);

    /**
     * Cập nhật thông tin hồ sơ của người dùng hiện tại đang đăng nhập.
     * @param username Tên tài khoản hiện tại.
     * @param dto DTO chứa thông tin thay đổi.
     * @return DTO chứa thông tin hồ sơ sau cập nhật.
     */
    UserResponseDto updateProfile(String username, UserProfileUpdateDto dto);
}
