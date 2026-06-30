package com.parking.dto;

import lombok.Data;

@Data
public class TicketGenerationRequest {

    private String licensePlate;

    private String vehicleType;

    private Long parkingAreaId;

    private String entryGate;
}
