package com.parking.dto;

import com.parking.entity.SlotStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlotRequestDto {
    @NotBlank(message = "Slot code is mandatory")
    private String code;
    @NotNull(message = "Floor ID is mandatory")
    private Long floorId;
    @NotBlank(message = "Vehicle type ID is mandatory")
    private String vehicleTypeId;
    private SlotStatus status; // Should be AVAILABLE or default to AVAILABLE
}
