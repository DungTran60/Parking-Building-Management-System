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

    private String parkingArea;

    private LocalDateTime checkInTime;

    private String status;
}