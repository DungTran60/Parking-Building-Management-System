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
    private String sessionId;
    private BigDecimal amount;
    private String method;
    private LocalDateTime paidAt; // mapped to paidAt in FE PaymentRecord
}
