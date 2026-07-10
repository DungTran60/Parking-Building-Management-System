package com.parking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponseDto {
    private Long id;
    private String action;
    private String resource;
    private Long resourceId;
    private Long actorId;
    private String actorUsername;
    private LocalDateTime createdAt;
}
