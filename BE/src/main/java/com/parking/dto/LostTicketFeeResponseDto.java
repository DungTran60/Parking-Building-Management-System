package com.parking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostTicketFeeResponseDto {

    /** Tên / code loại xe */
    private String vehicleType;

    /** Biển số xe (có khi tra cứu checkout mất vé) */
    private String plateNumber;

    /** ID phiên gửi xe (nếu tìm được) */
    private Long sessionId;

    /** Thời gian vào bãi */
    private LocalDateTime checkInAt;

    /** Phí giờ gửi xe tính đến thời điểm checkout */
    private BigDecimal parkingFee;

    /** Phụ phí mất vé (theo bảng giá) */
    private BigDecimal lostTicketFee;

    /** Tổng tiền = parkingFee + lostTicketFee */
    private BigDecimal total;
}
