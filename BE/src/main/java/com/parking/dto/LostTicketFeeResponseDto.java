package com.parking.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostTicketFeeResponseDto {

    private String vehicleType;
    private BigDecimal lostTicketFee;
    private BigDecimal total;
}
