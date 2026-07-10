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

    private String passwordPolicy;
    private Integer sessionTimeout;
    private String logoUrl;
    private String version;
    private String themeColor;
    private String timezone;
    private String dateFormat;
}
