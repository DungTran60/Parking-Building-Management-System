package com.parking.controller;

import com.parking.dto.VehicleTrafficReportRequest;
import com.parking.dto.VehicleTrafficReportResponse;
import com.parking.service.VehicleTrafficReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class VehicleTrafficReportController {

    private final VehicleTrafficReportService vehicleTrafficReportService;

    @GetMapping("/vehicle-traffic")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')") // Adjust authorization as needed
    public ResponseEntity<VehicleTrafficReportResponse> generateVehicleTrafficReport(@Valid VehicleTrafficReportRequest request) {
        VehicleTrafficReportResponse response = vehicleTrafficReportService.generateVehicleTrafficReport(request);
        return ResponseEntity.ok(response);
    }
}