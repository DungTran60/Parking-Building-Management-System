package com.parking.dto;

import com.parking.entity.SlotStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotStatusUpdateRequestDto {
    private SlotStatus status;
}
