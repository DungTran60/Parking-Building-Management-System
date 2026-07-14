package com.parking.dto;

import com.parking.entity.SlotStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlotResponseDto {
    private String id;
    private String code;
    private String floorId;
    private String vehicleTypeId;
    private SlotStatus status;
    private LocalDateTime updatedAt;
}
