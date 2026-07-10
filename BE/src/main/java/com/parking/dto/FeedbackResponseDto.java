package com.parking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponseDto {
    private Long id;
    private Long userId;
    private String username;
    private Long sessionId;
    private String type;
    private String content;
    private String status;
    private String response;
    private String respondedByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
