package com.parking.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RevenueReportResponse {
    private Double totalRevenue;
    private Long totalTickets;
    private Double averageRevenuePerTicket;
    private List<RevenueByArea> revenueByAreaList;
}