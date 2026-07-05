package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng giá đỗ xe theo loại phương tiện và đơn vị thời gian.
 */
@Entity
@Table(
    name = "pricing",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_pricing_vehicle_type_unit",
        columnNames = {"vehicle_type_id", "time_unit"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Loại phương tiện áp dụng mức giá này */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    private VehicleType vehicleType;

    /**
     * Đơn vị thời gian tính giá: HOURLY, DAILY, MONTHLY
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "time_unit", nullable = false, length = 20)
    private PricingTimeUnit timeUnit;

    /** Giá tiền (VND) tương ứng với đơn vị thời gian */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Phí đỗ xe qua đêm (VND) */
    @Builder.Default
    @Column(name = "overnight_fee", precision = 12, scale = 2)
    private BigDecimal overnightFee = BigDecimal.ZERO;

    /** Mô tả thêm (tùy chọn) */
    @Column(length = 255)
    private String description;

    /** Trạng thái áp dụng */
    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

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
