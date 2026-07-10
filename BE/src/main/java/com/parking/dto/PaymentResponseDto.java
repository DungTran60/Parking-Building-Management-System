package com.parking.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {
    private Long id;
    private String sessionId; // giữ String: chứa ticketCode (mã vé), không phải khóa số
    private BigDecimal amount;
    private String method;
    private LocalDateTime paidAt; // mapped to paidAt in FE PaymentRecord
    private String collectedByUsername;
}
