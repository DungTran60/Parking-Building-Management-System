package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SessionStatusUpdateRequestDto {
    @NotBlank(message = "New status is required")
    private String newStatus;
}