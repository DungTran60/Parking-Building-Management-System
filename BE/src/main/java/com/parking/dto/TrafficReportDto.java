package com.parking.dto;

import com.parking.dto.TrafficByHourAndVehicleTypeDto;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficReportDto {
    private Long totalCheckIns;
    private Long totalCheckOuts;
    private List<DateTrafficDto> trafficByDate;
    private List<HourTrafficDto> trafficByHour;
    private List<VehicleTypeTrafficDto> trafficByVehicleType;
    private List<TrafficByHourAndVehicleTypeDto> trafficByHourAndVehicleType;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DateTrafficDto {
        private String date; // yyyy-MM-dd
        private Long checkIns;
        private Long checkOuts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HourTrafficDto {
        private Integer hour; // 0 - 23
        private Long checkIns;
        private Long checkOuts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VehicleTypeTrafficDto {
        private String vehicleTypeName;
        private Long checkIns;
        private Long checkOuts;
    }
}
