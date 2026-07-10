package com.parking.service;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.LostTicketCheckoutRequestDto;
import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.ParkingSessionResponseDto;
import com.parking.dto.SessionExceptionRequestDto;
import com.parking.dto.SessionNoteRequestDto;
import com.parking.dto.SessionStatusUpdateRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface ParkingSessionService {
    ParkingSessionResponseDto checkIn(CheckInRequestDto request);
    ParkingSessionResponseDto checkOut(String query);
    Page<ParkingSessionResponseDto> findAll(String status, String query, Long vehicleTypeId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    ParkingSessionResponseDto findById(Long id);

    /** Lấy các lượt gửi xe của tài khoản Driver đang đăng nhập. */
    List<ParkingSessionResponseDto> getMySessions();

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
    
    ParkingSessionResponseDto handleException(Long id, SessionExceptionRequestDto request);

    ParkingSessionResponseDto updateStatus(Long id, SessionStatusUpdateRequestDto request);

    ParkingSessionResponseDto reopenSession(Long id);

    ParkingSessionResponseDto markAsUnpaid(Long id);

    ParkingSessionResponseDto waiveFee(Long id);

    ParkingSessionResponseDto addNote(Long id, SessionNoteRequestDto request);
}
