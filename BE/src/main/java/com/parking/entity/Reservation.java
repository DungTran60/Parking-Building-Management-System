package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity đặt chỗ trước – người dùng có thể đặt một slot cụ thể
 * trong khoảng thời gian xác định trước.
 */
@Entity
@Table(name = "reservations", indexes = {
        @Index(name = "idx_reservations_status", columnList = "status"),
        @Index(name = "idx_reservations_start", columnList = "start_at"),
        @Index(name = "idx_reservations_end", columnList = "end_at"),
        @Index(name = "idx_reservations_plate", columnList = "plate_number"),
        @Index(name = "idx_reservations_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Biển số xe của người đặt */
    @Column(name = "plate_number", nullable = false, length = 20)
    private String plateNumber;

    /** Loại phương tiện (ManyToOne → VehicleType) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    private VehicleType vehicleType;

    /** Slot được đặt trước (ManyToOne → ParkingSlot) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private ParkingSlot slot;

    /** Tài khoản Driver đã tạo đặt chỗ (nullable cho dữ liệu cũ/không xác định). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /** Thời gian bắt đầu khoảng đặt chỗ */
    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    /** Thời gian kết thúc khoảng đặt chỗ */
    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    /** Trạng thái đặt chỗ */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;

    /** Thời điểm tạo bản ghi */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** Thời điểm cập nhật gần nhất */
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
