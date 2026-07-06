package com.parking.dto;

import com.parking.entity.PaymentMode;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingsRequestDto {

    @NotBlank(message = "System name is required")
    @Size(max = 100, message = "System name must be at most 100 characters")
    private String systemName;

    @NotBlank(message = "Opening time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Opening time must be in HH:mm format")
    private String openingTime;

    @NotBlank(message = "Closing time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Closing time must be in HH:mm format")
    private String closingTime;

    @NotNull(message = "Payment mode is required")
    private PaymentMode paymentMode;

    @NotNull(message = "autoBlockOverdueSlots is required")
    private Boolean autoBlockOverdueSlots;
}
