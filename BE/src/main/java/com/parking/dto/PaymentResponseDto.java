package com.parking.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {
    private String id;
    /** ticketCode của session (hoặc numeric id nếu không có) */
    private String sessionId;
    /** Biển số xe — để FE hiển thị trong lịch sử */
    private String plateNumber;
    private BigDecimal amount;
    private String method;
    private LocalDateTime paidAt;
}
