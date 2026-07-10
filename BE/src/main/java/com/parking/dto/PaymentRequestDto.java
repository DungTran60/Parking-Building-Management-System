package com.parking.dto;

import com.parking.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDto {
    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod method; // CASH, QR_CODE, BANK_CARD
}
