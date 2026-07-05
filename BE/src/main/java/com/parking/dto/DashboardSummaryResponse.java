package com.parking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryResponse {
    // Parking Area/Slot Metrics
    private Long totalParkingAreas;
    private Long totalParkingSlots;
    private Long availableParkingSlots;
    private Long occupiedParkingSlots;

    // Revenue Summary
    private Double todayRevenue;
    private Double monthRevenue;

    // Ticket Metrics
    private Long totalActiveTickets;
    private Long totalCheckedOutToday;
}