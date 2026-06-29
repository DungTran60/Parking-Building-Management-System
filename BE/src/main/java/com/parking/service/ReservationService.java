package com.parking.service;

import com.parking.dto.ReservationRequestDto;
import com.parking.dto.ReservationResponseDto;
import com.parking.entity.ReservationStatus;

import java.util.List;

/**
 * Service xử lý nghiệp vụ đặt chỗ trước (Reservation Module).
 */
public interface ReservationService {

    /** Tạo đặt chỗ mới, status mặc định là PENDING */
    ReservationResponseDto createReservation(ReservationRequestDto dto);

    /** Lấy thông tin một đặt chỗ theo ID */
    ReservationResponseDto getReservationById(Long id);

    /** Lấy danh sách tất cả đặt chỗ */
    List<ReservationResponseDto> getAllReservations();

    /** Lọc danh sách đặt chỗ theo trạng thái */
    List<ReservationResponseDto> getReservationsByStatus(ReservationStatus status);

    /** Xác nhận đặt chỗ (PENDING → CONFIRMED) */
    ReservationResponseDto confirmReservation(Long id);

    /** Hủy đặt chỗ (PENDING hoặc CONFIRMED → CANCELLED) */
    ReservationResponseDto cancelReservation(Long id);
}
