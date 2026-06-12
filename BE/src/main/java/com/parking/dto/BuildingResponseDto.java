package com.parking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingResponseDto {
    private Long id;
    private String buildingName;
    private String address;
    private Integer totalFloors;
    private LocalDateTime createdAt;
}
