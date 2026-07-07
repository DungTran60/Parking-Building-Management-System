package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInRequestDto {
    @NotBlank(message = "Plate number is required")
    @Size(min = 5, max = 20, message = "Plate number must be between 5 and 20 characters")
    private String plateNumber;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleTypeId;

    @NotBlank(message = "Entry gate is required")
    private String entryGate;

    private Long slotId;

    private Long reservationId;
}
