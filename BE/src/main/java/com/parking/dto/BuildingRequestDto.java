package com.parking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingRequestDto {

    @NotBlank(message = "Building name is required")
    @Size(min = 2, max = 150, message = "Building name must be between 2 and 150 characters")
    private String buildingName;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    private String address;

    @NotNull(message = "Total floors is required")
    @Min(value = 1, message = "Total floors must be at least 1")
    private Integer totalFloors;
}
