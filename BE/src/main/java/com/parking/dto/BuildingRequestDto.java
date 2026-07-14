package com.parking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import com.parking.entity.PaymentMode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingRequestDto {

    @NotBlank(message = "Building name is required")
    @Size(min = 2, max = 150, message = "Building name must be between 2 and 150 characters")
    private String buildingName;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    private String address;

    private String hotline;

    @Email(message = "Email must be a valid email address")
    private String email;

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Opening time must be in HH:mm format")
    private String openingTime;

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Closing time must be in HH:mm format")
    private String closingTime;

    private String description;

    private String parkingRules;

    private PaymentMode paymentMode;

    private Boolean autoBlockOverdueSlots;

    private String avatarUrl;
}