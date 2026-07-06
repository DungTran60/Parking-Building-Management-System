package com.parking.dto;

import com.parking.entity.VehicleTypeStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleTypeResponseDto {

    private Long id;
    private String code;
    private String name;
    private String description;
    private VehicleTypeStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
