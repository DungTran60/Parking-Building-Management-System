package com.parking.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOptimizeRequestDto {

    @NotNull(message = "Current vehicles count is required")
    @Min(value = 0, message = "Current vehicles must be >= 0")
    private Integer currentVehicles;

    @NotNull(message = "Empty slots count is required")
    @Min(value = 0, message = "Empty slots must be >= 0")
    private Integer emptySlots;

    @NotBlank(message = "Vehicle type ID is required")
    private String vehicleTypeId;
}
