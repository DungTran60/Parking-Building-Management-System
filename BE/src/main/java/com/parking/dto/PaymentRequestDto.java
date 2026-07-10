package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDto {
    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotBlank(message = "Payment method is required")
    private String method; // "QR_CODE", "BANK_CARD", "CASH"
}
