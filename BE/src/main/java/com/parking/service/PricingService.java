package com.parking.service;

import com.parking.dto.OvernightFeeResponseDto;
import com.parking.dto.PricingRequestDto;
import com.parking.dto.PricingResponseDto;

import java.util.List;

public interface PricingService {

    /** Tạo bảng giá mới */
    PricingResponseDto createPricing(PricingRequestDto dto);

    /** Lấy bảng giá theo ID */
    PricingResponseDto getPricingById(Long id);

    /** Lấy tất cả bảng giá */
    List<PricingResponseDto> getAllPricings();

    /** Lấy bảng giá đang áp dụng */
    List<PricingResponseDto> getActivePricings();

    /** Lấy bảng giá theo loại phương tiện */
    List<PricingResponseDto> getPricingsByVehicleType(String vehicleTypeId);

    /** Lấy bảng giá đang áp dụng theo loại phương tiện */
    List<PricingResponseDto> getActivePricingsByVehicleType(String vehicleTypeId);

    /** Cập nhật bảng giá */
    PricingResponseDto updatePricing(Long id, PricingRequestDto dto);

    /** Xóa bảng giá */
    void deletePricing(Long id);

    /** Kích hoạt / vô hiệu hóa bảng giá */
    PricingResponseDto togglePricingStatus(Long id);

    /** Tính phí đỗ xe qua đêm */
    OvernightFeeResponseDto calculateOvernightFee(
            java.time.LocalDateTime checkIn,
            java.time.LocalDateTime checkOut,
            String vehicleTypeId);
}
