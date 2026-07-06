package com.parking.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportDto {
    private Double totalRevenue;
    private List<DateRevenueDto> revenueByDate;
    private List<MethodRevenueDto> revenueByMethod;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DateRevenueDto {
        private String date; // yyyy-MM-dd
        private Double amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MethodRevenueDto {
        private String method;
        private Double amount;
    }
}
