package com.parking.dto;

import lombok.Data;

@Data
public class VehicleCheckInRequest {

    private String licensePlate;

    private String vehicleType;

    private Long parkingAreaId;
}