package com.parking.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OvernightFeeResponseDto {

    private BigDecimal basePrice;
    private BigDecimal overnightFee;
    private int numberOfNights;
    private BigDecimal total;
}
