package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "vehicle_types",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_vehicle_type_code", columnNames = {"code"}),
        @UniqueConstraint(name = "uq_vehicle_type_name", columnNames = {"name"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã loại xe, dùng để nhận dạng ngắn gọn (ví dụ: CAR, MOTORBIKE) */
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VehicleTypeStatus status = VehicleTypeStatus.ACTIVE;

    // ─── Legacy fields (kept for backward compat) ────────────────────────────

    @Column(length = 50)
    private String size;

    @Column(name = "capacity_unit")
    private Integer capacityUnit;

    @Column(length = 20)
    private String color;

    @Column(name = "hourly_rate")
    private Double hourlyRate;

    // ─── Audit ───────────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt  = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
