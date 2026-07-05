package com.parking.dto;

import com.parking.entity.FeedbackStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponseDto {

    private Long id;

    private Long customerId;
    private String customerName;

    private Long parkingSessionId;
    private String ticketCode;

    private Long paymentId;

    private Integer rating;
    private String comment;

    private FeedbackStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
