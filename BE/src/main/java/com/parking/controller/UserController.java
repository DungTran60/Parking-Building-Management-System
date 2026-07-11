package com.parking.controller;

import com.parking.dto.UserCreateDto;
import com.parking.dto.UserResponseDto;
import com.parking.dto.UserStatusUpdateDto;
import com.parking.dto.UserUpdateDto;
import com.parking.dto.UserProfileUpdateDto;
import com.parking.dto.UserStatusResponseDto;
import com.parking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Controller cung cấp các API liên quan đến quản lý người dùng (User) và Hồ sơ cá nhân (User Profile).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * API tạo tài khoản người dùng mới.
     * Quyền truy cập: ADMIN
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserCreateDto dto) {
        UserResponseDto createdUser = userService.createUser(dto);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    /**
     * API lấy thông tin người dùng bằng ID.
     * Quyền truy cập: ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * API lấy danh sách toàn bộ người dùng trong hệ thống.
     * Quyền truy cập: ADMIN
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * API láº¥y danh sÃ¡ch Staff Ä‘ang hoáº¡t Ä‘á»™ng.
     * Quyá»n truy cáº­p: ADMIN, MANAGER
     */
    @GetMapping("/staff")
    @PreAuthorize("hasAuthority('users:view')")
    public ResponseEntity<List<UserResponseDto>> getActiveStaffUsers() {
        return ResponseEntity.ok(userService.getActiveStaffUsers());
    }

    /**
     * API cập nhật thông tin tài khoản người dùng theo ID.
     * Quyền truy cập: ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDto dto
    ) {
        UserResponseDto updatedUser = userService.updateUser(id, dto);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * API xóa tài khoản người dùng theo ID.
     * Quyền truy cập: ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * API khóa/mở khóa tài khoản người dùng.
     * Quyền truy cập: ADMIN
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatusResponseDto> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDto dto
    ) {
        UserStatusResponseDto updatedUser = userService.updateUserStatus(id, dto);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * API lấy thông tin hồ sơ của chính người dùng hiện tại đang đăng nhập.
     * Quyền truy cập: Mọi người dùng đã đăng nhập (Authenticated)
     */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> getProfile(Principal principal) {
        // Lấy thông tin dựa theo tên đăng nhập được giải mã từ token JWT
        UserResponseDto profile = userService.getProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    /**
     * API cập nhật thông tin hồ sơ cá nhân của chính người dùng đang đăng nhập.
     * Quyền truy cập: Mọi người dùng đã đăng nhập (Authenticated)
     */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> updateProfile(
            Principal principal,
            @Valid @RequestBody UserProfileUpdateDto dto
    ) {
        // Thực hiện cập nhật hồ sơ với các thông tin mới
        UserResponseDto updatedProfile = userService.updateProfile(principal.getName(), dto);
        return ResponseEntity.ok(updatedProfile);
    }
}
