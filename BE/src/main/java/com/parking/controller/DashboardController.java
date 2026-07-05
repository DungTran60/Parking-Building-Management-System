package com.parking.controller;

import com.parking.dto.DashboardSummaryResponse;
import com.parking.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for retrieving dashboard-related information.
 * Provides endpoints for obtaining a summary of parking operations for the dashboard.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Retrieves a summary of dashboard metrics.
     * Accessible by users with 'ADMIN', 'MANAGER', or 'STAFF' roles.
     *
     * @return A ResponseEntity containing the DashboardSummaryResponse.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')") // Adjust authorization as needed
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        DashboardSummaryResponse response = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(response);
    }
}
