package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Phản hồi / đánh giá của khách hàng sau khi hoàn thành lượt gửi xe.
 * Mỗi ParkingSession chỉ được nhận đúng một Feedback.
 */
@Entity
@Table(
    name = "feedbacks",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_feedback_session",
        columnNames = {"session_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Khách hàng gửi phản hồi */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    /** Lượt gửi xe được đánh giá – UNIQUE: mỗi session chỉ 1 feedback */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private ParkingSession session;

    /** Thanh toán liên quan (không bắt buộc) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    /** Điểm đánh giá 1–5 */
    @Column(nullable = false)
    private Integer rating;

    /** Nội dung bình luận, tối đa 1000 ký tự */
    @Column(length = 1000)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FeedbackStatus status = FeedbackStatus.PENDING;

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
