package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Bảng lưu cấu hình hệ thống (singleton row – chỉ có 1 bản ghi duy nhất, id = 1).
 */
@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {

    @Id
    private Long id; // luôn = 1 (singleton)

    @Column(name = "system_name", nullable = false, length = 100)
    private String systemName;

    @Column(name = "password_policy", length = 20)
    private String passwordPolicy;

    @Column(name = "session_timeout")
    private Integer sessionTimeout;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "version", length = 50)
    private String version;

    @Column(name = "theme_color", length = 50)
    private String themeColor;

    @Column(name = "timezone", length = 50)
    private String timezone;

    @Column(name = "date_format", length = 50)
    private String dateFormat;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
