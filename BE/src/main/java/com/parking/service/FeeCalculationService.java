package com.parking.service;

import com.parking.dto.FeeCalculationResponseDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface FeeCalculationService {

    /**
     * Tính phí tạm tính cho xe đang gửi (preview).
     * Có thể truyền ticketCode hoặc plateNumber.
     *
     * @param query ticketCode hoặc plateNumber
     * @return thông tin phí tính đến thời điểm hiện tại
     */
    FeeCalculationResponseDto previewFee(String query);

    /**
     * Tính phí thực tế theo giờ dựa vào loại xe và khoảng thời gian.
     * Ưu tiên lấy giá từ bảng Pricing (HOURLY, active=true).
     * Fallback về hourlyRate của VehicleType nếu không có trong bảng giá.
     *
     * @param vehicleTypeId  ID loại phương tiện
     * @param checkInAt      thời gian vào
     * @param checkOutAt     thời gian ra
     * @return phí tính được (VND)
     */
    BigDecimal calculateFee(String vehicleTypeId, LocalDateTime checkInAt, LocalDateTime checkOutAt);
}
