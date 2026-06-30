package com.parking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDto {
    private String sessionId;
    private String method; // "QR_CODE", "BANK_CARD", "CASH"
}
