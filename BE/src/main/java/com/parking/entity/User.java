package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

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

    /**
     * Khóa ngoại liên kết tới bảng roles
     * Mỗi User thuộc một Role
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}