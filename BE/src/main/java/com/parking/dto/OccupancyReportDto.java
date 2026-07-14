package com.parking.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OccupancyReportDto {
    private Long totalSlots;
    private Long occupiedSlots;
    private Long availableSlots;
    private Long reservedSlots;
    private Long maintenanceSlots;
    private Long blockedSlots;
    private Double occupancyRate; // percentage
    private List<FloorOccupancyDto> occupancyByFloor;
    private List<VehicleTypeOccupancyDto> occupancyByVehicleType;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FloorOccupancyDto {
        private String floorName;
        private Long occupied;
        private Long total;
        private Double rate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VehicleTypeOccupancyDto {
        private String vehicleTypeName;
        private Long occupied;
        private Long total;
        private Double rate;
    }
}
