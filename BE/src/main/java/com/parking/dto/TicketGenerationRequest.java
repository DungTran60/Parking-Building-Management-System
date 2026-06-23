package com.parking.dto;

import lombok.Data;

@Data
public class TicketGenerationRequest {

    private String licensePlate;

    private Long parkingAreaId;
}