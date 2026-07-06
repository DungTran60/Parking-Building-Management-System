package com.parking.service;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.LostTicketCheckoutRequestDto;
import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.ParkingSessionResponseDto;

public interface ParkingSessionService {
    ParkingSessionResponseDto checkIn(CheckInRequestDto request);
    ParkingSessionResponseDto checkOut(String query);
    ParkingSessionResponseDto getActiveSession();

    /**
     * Tính phí preview khi khách báo mất vé (chưa checkout).
     * Trả về thông tin phí giờ + phụ phí mất vé.
     *
     * @param plateNumber biển số xe
     * @return chi tiết phí mất vé
     */
    LostTicketFeeResponseDto previewLostTicketFee(String plateNumber);

    /**
     * Xử lý checkout cho xe bị mất vé:
     *  1. Tìm session ACTIVE theo biển số
     *  2. Tính phí giờ + phụ phí mất vé
     *  3. Hoàn thành session (COMPLETED), giải phóng slot
     *  4. Trả về thông tin session đã checkout
     *
     * @param request biển số + phương thức thanh toán
     * @return session đã checkout kèm tổng phí
     */
    ParkingSessionResponseDto lostTicketCheckout(LostTicketCheckoutRequestDto request);
}
