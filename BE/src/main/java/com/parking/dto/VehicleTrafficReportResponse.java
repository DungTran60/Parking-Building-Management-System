package com.parking.dto;

import lombok.Data;

/**
 * Data Transfer Object (DTO) for the response of a vehicle traffic report.
 * Contains summary information about vehicle traffic and occupancy.
 */
@Data
public class VehicleTrafficReportResponse {
    private String reportName;
    private String dateRange;
    private Long totalVehiclesEntered;
    private Long totalVehiclesExited;
    private Long currentOccupancy;
    // Potentially add more details like traffic by hour, by vehicle type, etc.
}