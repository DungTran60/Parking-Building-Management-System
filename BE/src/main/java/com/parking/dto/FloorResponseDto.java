package com.parking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloorResponseDto {
    private Long id;
    private Long buildingId;
    private String name;
    private String zone;
    private Integer slotCount;
    private List<String> supportedVehicleTypeIds;
}