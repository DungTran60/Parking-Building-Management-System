package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ParkingSession session;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 50)
    private String method; // "QR_CODE", "BANK_CARD", "CASH"

    @Column(name = "payment_time", nullable = false)
    private LocalDateTime paymentTime;
}
