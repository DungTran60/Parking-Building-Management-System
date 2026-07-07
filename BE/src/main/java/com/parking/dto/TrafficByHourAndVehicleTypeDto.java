package com.parking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficByHourAndVehicleTypeDto {
    private int hour;
    private String vehicleTypeName;
    private long checkIns;
    private long checkOuts;
}