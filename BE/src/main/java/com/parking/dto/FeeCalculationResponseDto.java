package com.parking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO trả về kết quả tính phí theo giờ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeCalculationResponseDto {

    /** Mã vé */
    private String ticketCode;

    /** Biển số xe */
    private String plateNumber;

    /** Loại phương tiện */
    private String vehicleTypeId;
    private String vehicleTypeName;

    /** Thời gian vào */
    private LocalDateTime checkInAt;

    /** Thời gian tính phí (thời điểm gọi API hoặc checkout thực tế) */
    private LocalDateTime calculatedAt;

    /** Số giờ gửi (làm tròn lên, tối thiểu 1 giờ) */
    private double hours;

    /** Đơn giá theo giờ áp dụng (VND/giờ) */
    private BigDecimal hourlyRate;

    /** Tổng phí phải trả (VND) */
    private BigDecimal totalFee;

    /** Nguồn lấy đơn giá: "PRICING_TABLE" hoặc "VEHICLE_TYPE_DEFAULT" */
    private String rateSource;
}
