package com.parking.dto;

import com.parking.entity.SlotStatus;
import lombok.*;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotStatusUpdateRequestDto {
    @NotNull(message = "Slot status is required")
    private SlotStatus status;
}
