package com.parking.dto;

import com.parking.entity.PaymentMode;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingsResponseDto {
    private String systemName;
    private String passwordPolicy;
    private Integer sessionTimeout;
    private String logoUrl;
    private String version;
    private String themeColor;
    private String timezone;
    private String dateFormat;
    private LocalDateTime updatedAt;
}
