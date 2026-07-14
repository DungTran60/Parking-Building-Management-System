package com.parking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_session_exceptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSessionException {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ParkingSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionExceptionType type;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(precision = 10, scale = 2)
    private BigDecimal extraFee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}