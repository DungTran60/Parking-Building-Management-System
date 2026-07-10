package com.parking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponseDto {
    private Long id;
    private String plateNumber;
    private Long vehicleTypeId;
    private String vehicleTypeName;
    private Long ownerUserId;
    private String ownerUsername;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
