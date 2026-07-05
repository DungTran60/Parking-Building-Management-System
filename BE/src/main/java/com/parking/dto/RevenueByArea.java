package com.parking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RevenueByArea {
    private Long parkingAreaId;
    private String parkingAreaName;
    private Double totalRevenue;
    private Long numberOfTickets;
    private Double averageRevenuePerTicket;
}