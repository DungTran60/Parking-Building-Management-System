package com.parking.service;

import com.parking.dto.SlotRecommendationResponseDto;

/**
 * Gợi ý phân bổ slot đỗ tối ưu cho một loại phương tiện.
 */
public interface SlotRecommendationService {

    /**
     * Trả về slot trống được gợi ý cho loại xe, đồng thời ghi nhật ký gợi ý.
     * @param vehicleTypeId id loại phương tiện
     */
    SlotRecommendationResponseDto recommend(Long vehicleTypeId);
}
