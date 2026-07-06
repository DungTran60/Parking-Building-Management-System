package com.parking.dto;

import com.parking.entity.IncidentStatus;
import com.parking.entity.IncidentType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentResponseDto {

    private Long id;

    private Long reporterId;
    private String reporterName;

    private Long sessionId;
    private String ticketCode;

    private Long slotId;
    private String slotCode;

    private IncidentType type;
    private String description;
    private String resolution;

    private IncidentStatus status;

    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;
}
