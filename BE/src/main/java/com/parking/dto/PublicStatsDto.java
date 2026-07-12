package com.parking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicStatsDto {

    private long totalBuildings;
    private long totalSlots;
    private long availableSlots;
    private long totalVehicleTypes;
}
