package com.parking.controller;

import com.parking.dto.VehicleTrafficReportRequest;
import com.parking.dto.VehicleTrafficReportResponse;
import com.parking.service.VehicleTrafficService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing vehicle traffic report generation.
 * Provides endpoints for generating reports on vehicle traffic and occupancy.
 */
@RestController
@RequestMapping("/api/traffic-reports")
@RequiredArgsConstructor
public class VehicleTrafficController {

    private final VehicleTrafficService vehicleTrafficService;

    /**
     * Generates a vehicle traffic report based on the provided request criteria.
     * Accessible by users with 'ADMIN' or 'MANAGER' roles.
     *
     * @param request The VehicleTrafficReportRequest object containing criteria for report generation (e.g., date range, parking area).
     * @return A ResponseEntity containing the generated VehicleTrafficReportResponse.
     */
    @GetMapping("/vehicle-traffic")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')") // Adjust authorization as needed
    public ResponseEntity<VehicleTrafficReportResponse> generateVehicleTrafficReport(VehicleTrafficReportRequest request) {
        VehicleTrafficReportResponse response = vehicleTrafficService.generateVehicleTrafficReport(request);
        return ResponseEntity.ok(response);
    }
}