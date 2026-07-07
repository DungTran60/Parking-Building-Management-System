package com.parking.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportDto {
    private BigDecimal totalRevenue;
    private List<DateRevenueDto> revenueByDate;
    private List<MethodRevenueDto> revenueByMethod;
    private List<RevenueByVehicleTypeDto> revenueByVehicleType;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DateRevenueDto {
        private String date; // yyyy-MM-dd
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MethodRevenueDto {
        private String method;
        private BigDecimal amount;
    }
}
