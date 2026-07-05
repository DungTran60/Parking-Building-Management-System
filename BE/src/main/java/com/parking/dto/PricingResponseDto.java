package com.parking.dto;

import com.parking.entity.PricingTimeUnit;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingResponseDto {

    private Long id;

    private String vehicleTypeId;
    private String vehicleTypeName;

    private PricingTimeUnit timeUnit;

    private BigDecimal price;

    private BigDecimal overnightFee;

    private String description;

    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
