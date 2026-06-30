package com.parking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInRequestDto {
    private String plateNumber;
    private String vehicleTypeId;
    private String entryGate;
}
