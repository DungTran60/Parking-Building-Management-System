package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 100)
    private String ticketCode;

    @Column(name = "plate_number", nullable = false, length = 50)
    private String plateNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    private VehicleType vehicleType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private ParkingSlot slot;

    @Column(name = "entry_gate", length = 50)
    private String entryGate;

    @Column(name = "check_in_at", nullable = false)
    private LocalDateTime checkInAt;

    @Column(name = "check_out_at")
    private LocalDateTime checkOutAt;

    @Column(name = "fee", precision = 10, scale = 2)
    private Double fee;

    @Column(nullable = false, length = 30)
    private String status; // "ACTIVE", "COMPLETED"

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
