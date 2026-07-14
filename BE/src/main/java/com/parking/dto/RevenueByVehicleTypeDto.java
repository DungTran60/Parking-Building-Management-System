package com.parking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueByVehicleTypeDto {
    private Long vehicleTypeId;
    private String vehicleTypeName;
    private BigDecimal amount;
}
