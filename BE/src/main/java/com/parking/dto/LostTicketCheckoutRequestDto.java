package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostTicketCheckoutRequestDto {

    /**
     * Biển số xe của phương tiện bị mất vé.
     * Dùng để tra cứu phiên gửi xe đang ACTIVE.
     */
    @NotBlank(message = "Plate number is required")
    private String plateNumber;

    /**
     * Phương thức thanh toán: CASH, QR_CODE, BANK_CARD.
     * Nếu không cung cấp, mặc định là CASH.
     */
    private String paymentMethod;
}
