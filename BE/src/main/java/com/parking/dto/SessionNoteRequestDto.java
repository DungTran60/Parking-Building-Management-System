package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SessionNoteRequestDto {
    @NotBlank(message = "Note content is required")
    private String note;
}