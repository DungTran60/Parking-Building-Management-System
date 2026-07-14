package com.parking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentAssignDto {
    @NotNull(message = "Assignee ID cannot be null")
    private Long assigneeId;
}