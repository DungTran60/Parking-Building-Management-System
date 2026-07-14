package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentResolveDto {

    @NotBlank(message = "Resolution note is required")
    @Size(max = 1000, message = "Resolution must not exceed 1000 characters")
    private String resolution;
}
