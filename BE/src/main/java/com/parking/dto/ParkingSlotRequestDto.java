package com.parking.dto;

import com.parking.entity.SlotStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlotRequestDto {
    private String code;
    private Long floorId;
    private String vehicleTypeId;
    private SlotStatus status;
}
