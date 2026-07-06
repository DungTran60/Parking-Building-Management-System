package com.parking.dto;

import com.parking.entity.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentRequestDto {

    @NotNull(message = "Incident type is required")
    private IncidentType type;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    /** ID lượt gửi xe liên quan (không bắt buộc) */
    private Long sessionId;

    /** ID slot liên quan (không bắt buộc) */
    private Long slotId;
}
