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

    @Column(name = "opening_time", nullable = false, length = 10)
    private String openingTime; // format HH:mm

    @Column(name = "closing_time", nullable = false, length = 10)
    private String closingTime; // format HH:mm

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 20)
    private PaymentMode paymentMode;

    @Column(name = "auto_block_overdue_slots", nullable = false)
    private boolean autoBlockOverdueSlots;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
