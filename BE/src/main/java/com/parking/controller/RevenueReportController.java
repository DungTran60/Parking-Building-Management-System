package com.parking.controller;

import com.parking.dto.RevenueReportRequest;
import com.parking.dto.RevenueReportResponse;
import com.parking.service.RevenueReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing revenue report generation.
 * Provides endpoints for generating financial reports based on parking activities.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class RevenueReportController {

    private final RevenueReportService revenueReportService;

    /**
     * Generates a revenue report based on the provided request criteria.
     * Accessible by users with 'ADMIN' or 'MANAGER' roles.
     *
     * @param request The RevenueReportRequest object containing criteria for report generation (e.g., date range).
     * @return A ResponseEntity containing the generated RevenueReportResponse.
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')") // Example authorization, adjust as needed
    public ResponseEntity<RevenueReportResponse> generateRevenueReport(@Valid RevenueReportRequest request) {
        RevenueReportResponse response = revenueReportService.generateRevenueReport(request);
        return ResponseEntity.ok(response);
    }
}
