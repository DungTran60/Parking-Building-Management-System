package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

/**
 * Entity đại diện cho bảng roles trong database
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    /**
     * Khóa chính của bảng roles
     * Tự động tăng giá trị khi thêm bản ghi mới
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên quyền (ROLE_ADMIN, ROLE_USER,...)
     * - Không được null
     * - Không được trùng lặp
     * - Tối đa 50 ký tự
     */
    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "role_permissions",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions;
}
