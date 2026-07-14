package com.parking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloorStatsDto {
    private long totalSlots;
    private long occupiedSlots;
    private long availableSlots;
    private long reservedSlots;
    private long maintenanceSlots;
    private long blockedSlots;
    private double occupancyRate;
}