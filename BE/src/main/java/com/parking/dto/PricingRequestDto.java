package com.parking.dto;

import com.parking.entity.PricingTimeUnit;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRequestDto {

    @NotBlank(message = "Vehicle type ID is required")
    private String vehicleTypeId;

    @NotNull(message = "Time unit is required")
    private PricingTimeUnit timeUnit;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price format invalid")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Overnight fee must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Overnight fee format invalid")
    private BigDecimal overnightFee;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    private Boolean active;
}
