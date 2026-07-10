package com.parking.dto;

import com.parking.entity.SlotStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlotResponseDto {
    private Long id;
    private String code;
    private Long floorId;
    private Long vehicleTypeId;
    private SlotStatus status;
    private LocalDateTime updatedAt;
}
