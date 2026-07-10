package com.parking.service;

import com.parking.dto.*;
import com.parking.entity.Role;
import com.parking.entity.User;
import com.parking.entity.Status;
import com.parking.repository.RoleRepository;
import com.parking.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    // Sử dụng @Lazy để trì hoãn khởi tạo PasswordEncoder, tránh lỗi vòng lặp phụ thuộc (circular dependency)
    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            @Lazy PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        boolean isEnabled = user.getStatus() == Status.ACTIVE;

        // Cấp cả role authority (ROLE_*) lẫn các permission của role.
        // Nhờ đó @PreAuthorize("hasRole(...)") và @PreAuthorize("hasAuthority('sessions:*')")
        // đều hoạt động. Role.permissions là EAGER nên không có nguy cơ LazyInitializationException.
        List<GrantedAuthority> authorities = new ArrayList<>();
        Role role = user.getRole();
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            if (role.getPermissions() != null) {
                role.getPermissions().stream()
                        .filter(p -> p != null && p.getName() != null)
                        .forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getName())));
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                isEnabled,
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities
        );
    }

    @Override
    @Transactional
    public UserResponseDto createUser(UserCreateDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + dto.getUsername());
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
        }

        Role role = roleRepository.findByName(dto.getRoleName().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + dto.getRoleName()));

        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .role(role)
                .status(dto.getStatus())
                .build();

        User savedUser = userRepository.save(user);

        // Public registration has no authenticated actor. In that case, record the
        // newly registered user as the actor so the non-null audit columns remain valid.
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication != null ? authentication.getName() : "anonymousUser";
        User currentUser = userRepository.findByUsername(currentUsername).orElse(savedUser);
        auditService.log("USER_CREATED", "USER", savedUser.getId(), currentUser.getId(), currentUser.getUsername());

        return mapToResponseDto(savedUser);
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return mapToResponseDto(user);
    }

    @Override
    public UserResponseDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        return mapToResponseDto(user);
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDto> getActiveStaffUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && "STAFF".equalsIgnoreCase(user.getRole().getName()))
                .filter(user -> user.getStatus() == Status.ACTIVE)
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()
                && !dto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new IllegalArgumentException("Username already exists: " + dto.getUsername());
            }
            user.setUsername(dto.getUsername());
        }

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()
                && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(dto.getPhoneNumber());
        }

        if (dto.getRoleName() != null && !dto.getRoleName().trim().isEmpty()) {
            Role role = roleRepository.findByName(dto.getRoleName().toUpperCase())
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + dto.getRoleName()));
            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);

        // Audit Log
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow();
        auditService.log("USER_UPDATED", "USER", updatedUser.getId(), currentUser.getId(), currentUsername);

        return mapToResponseDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (userToDelete.getUsername().equals(currentUsername)) {
            throw new IllegalArgumentException("Admin cannot delete their own account.");
        }

        userRepository.deleteById(id);

        // Audit Log
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow();
        auditService.log("USER_DELETED", "USER", id, currentUser.getId(), currentUsername);
    }

    @Override
    @Transactional
    public UserStatusResponseDto updateUserStatus(Long id, UserStatusUpdateDto dto) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (userToUpdate.getUsername().equals(currentUsername)) {
            throw new IllegalArgumentException("Admin cannot lock their own account.");
        }

        userToUpdate.setStatus(dto.getStatus());
        userToUpdate.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(userToUpdate);

        // Audit Log
        String logAction = dto.getStatus() == Status.ACTIVE ? "USER_UNLOCKED" : "USER_LOCKED";
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow();
        auditService.log(logAction, "USER", updatedUser.getId(), currentUser.getId(), currentUsername);

        return UserStatusResponseDto.builder()
                .id(updatedUser.getId())
                .status(updatedUser.getStatus())
                .updatedAt(updatedUser.getUpdatedAt())
                .build();
    }

    @Override
    public UserResponseDto getProfile(String username) {
        // Tìm user theo username của tài khoản đang đăng nhập
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return mapToResponseDto(user);
    }

    @Override
    @Transactional
    public UserResponseDto updateProfile(String username, UserProfileUpdateDto dto) {
        // Tìm user theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        // 1. Cập nhật username mới (nếu có thay đổi)
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty() 
                && !dto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new IllegalArgumentException("Username already exists: " + dto.getUsername());
            }
            user.setUsername(dto.getUsername());
        }

        // 2. Cập nhật mật khẩu mới (nếu có cung cấp)
        if (dto.getNewPassword() != null && !dto.getNewPassword().trim().isEmpty()) {
            if (dto.getCurrentPassword() == null || dto.getCurrentPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("Current password is required to change password");
            }
            // Kiểm tra mật khẩu hiện tại có đúng không
            if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Incorrect current password");
            }
            // Lưu mật khẩu mới đã được mã hóa
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);
        return mapToResponseDto(updatedUser);
    }

    private UserResponseDto mapToResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roleName(user.getRole().getName())
                .status(user.getStatus())
                .build();
    }
}
