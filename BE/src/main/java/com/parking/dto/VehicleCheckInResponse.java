package com.parking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VehicleCheckInResponse {

    private Long ticketId;

    private String licensePlate;

    private String areaName;

    private LocalDateTime checkInTime;

    private String status;
}