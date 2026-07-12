package com.parking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOptimizeResponseDto {

    private String floorSuggestion;
    private String slotSuggestion;
    private int occupancyForecast;
    private String peakHourForecast;
    private int confidence;
}
