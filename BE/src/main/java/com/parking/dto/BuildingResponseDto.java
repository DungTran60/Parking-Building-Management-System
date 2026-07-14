package com.parking.dto;

import lombok.*;
import java.time.LocalDateTime;
import com.parking.entity.PaymentMode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildingResponseDto {
    private Long id;
    private String buildingName;
    private String address;
    private Integer totalFloors;
    private String hotline;
    private String email;
    private String openingTime;
    private String closingTime;
    private String description;
    private String parkingRules;
    private PaymentMode paymentMode;
    private Boolean autoBlockOverdueSlots;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
