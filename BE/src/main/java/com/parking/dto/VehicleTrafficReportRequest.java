package com.parking.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) for requesting vehicle traffic reports.
 * Allows specifying a date range and an optional parking area ID for filtering.
 */
@Data
public class VehicleTrafficReportRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long parkingAreaId; // Optional: to filter by a specific parking area
}