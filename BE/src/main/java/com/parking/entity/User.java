package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng users trong database
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    /**
     * Khóa chính của bảng users
     * Tự động tăng khi thêm user mới
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên đăng nhập
     * - Không được null
     * - Không được trùng lặp
     * - Tối đa 100 ký tự
     */
    @Column(nullable = false, unique = true, length = 100)
    private String username;

    /**
     * Mật khẩu đã được mã hóa
     * - Không được null
     * - Tối đa 255 ký tự
     */
    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Khóa ngoại liên kết tới bảng roles
     * Mỗi User thuộc một Role
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}
