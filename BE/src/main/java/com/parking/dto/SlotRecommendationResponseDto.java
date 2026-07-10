package com.parking.dto;

import lombok.*;

/**
 * Kết quả gợi ý phân bổ slot cho một loại phương tiện.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotRecommendationResponseDto {
    private Long vehicleTypeId;
    private String vehicleTypeName;
    private Long recommendedSlotId;
    private String recommendedSlotCode;
    private Long floorId;
    private String floorName;
    private Double score;
    private String strategy;
    /** true nếu tìm được slot trống phù hợp. */
    private boolean available;
    private String message;
}
