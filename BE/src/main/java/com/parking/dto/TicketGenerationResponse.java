package com.parking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketGenerationResponse {

    private Long ticketId;

    private String ticketCode;

    private String licensePlate;

    private String vehicleType;

    private String parkingArea;

    private String slotCode;

    private String entryGate;

    private LocalDateTime checkInTime;

    private String status;

    private Double fee;
}
