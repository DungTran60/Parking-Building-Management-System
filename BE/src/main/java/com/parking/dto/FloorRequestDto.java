package com.parking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloorRequestDto {
    @NotNull(message = "Building is required")
    private Long buildingId;

    @NotBlank(message = "Floor name is required")
    @Size(max = 50, message = "Floor name must be at most 50 characters")
    private String name;

    @Size(max = 100, message = "Zone must be at most 100 characters")
    private String zone;

    @NotNull(message = "Slot count is required")
    @Min(value = 1, message = "Slot count must be at least 1")
    private Integer slotCount;

    @NotEmpty(message = "At least one supported vehicle type is required")
    private List<Long> supportedVehicleTypeIds;
}
