package com.parking.dto;

import com.parking.entity.PaymentMode;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingsResponseDto {
    private String systemName;
    private String openingTime;
    private String closingTime;
    private PaymentMode paymentMode;
    private boolean autoBlockOverdueSlots;
    private BigDecimal defaultHourlyRate;
    private LocalDateTime updatedAt;
}
