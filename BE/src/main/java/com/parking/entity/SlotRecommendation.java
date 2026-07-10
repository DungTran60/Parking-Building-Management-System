package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Nhật ký gợi ý phân bổ slot (hỗ trợ tối ưu chỗ đỗ — RQ2/RQ3).
 * Gợi ý được sinh bằng heuristic (ưu tiên tầng thấp + mã slot nhỏ), KHÔNG phải ML.
 */
@Entity
@Table(name = "slot_recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    private VehicleType vehicleType;

    /** Slot được gợi ý (nullable nếu không còn slot trống). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_slot_id")
    private ParkingSlot recommendedSlot;

    /** Điểm ưu tiên của gợi ý (càng cao càng tốt). */
    @Column(name = "score")
    private Double score;

    /** Chiến lược sử dụng (ví dụ: LOWEST_FLOOR_FIRST). */
    @Column(name = "strategy", length = 50)
    private String strategy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
