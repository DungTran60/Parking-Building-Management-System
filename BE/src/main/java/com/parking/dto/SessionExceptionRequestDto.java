package com.parking.dto;

import com.parking.entity.SessionExceptionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionExceptionRequestDto {
    @NotNull(message = "Exception type is required")
    private SessionExceptionType type;

    private String reason;

    private BigDecimal extraFee;
}