package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "parking_ticket")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String ticketCode;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Double fee;

    private String status;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "parking_area_id")
    private ParkingArea parkingArea;

    @ManyToOne
    @JoinColumn(name = "slot_id")
    private ParkingSlot slot;

    @Column(name = "entry_gate")
    private String entryGate;
}