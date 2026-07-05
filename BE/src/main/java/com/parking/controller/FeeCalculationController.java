package com.parking.controller;

import com.parking.dto.FeeCalculationResponseDto;
import com.parking.service.FeeCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller tính phí theo giờ (Hourly Fee Calculation).
 */
@RestController
@RequestMapping("/api/fee")
@RequiredArgsConstructor
public class FeeCalculationController {

    private final FeeCalculationService feeCalculationService;

    /**
     * GET /api/fee/preview?query={ticketCode hoặc plateNumber}
     *
     * Tính phí tạm tính cho lượt gửi xe đang ACTIVE.
     * Trả về số giờ, đơn giá/giờ và tổng phí tại thời điểm gọi API.
     *
     * Ví dụ: GET /api/fee/preview?query=51G-88888
     *        GET /api/fee/preview?query=QR-260630-231500-ABCD
     */
    @GetMapping("/preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeeCalculationResponseDto> previewFee(
            @RequestParam String query) {
        return ResponseEntity.ok(feeCalculationService.previewFee(query));
    }
}
