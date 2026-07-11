package com.parking.service;

import com.parking.dto.ReservationRequestDto;
import com.parking.dto.ReservationResponseDto;
import com.parking.entity.ReservationStatus;

import java.security.Principal;
import java.util.List;

/**
 * Service xử lý nghiệp vụ đặt chỗ trước (Reservation Module).
 */
public interface ReservationService {

    /** Tạo đặt chỗ mới, status mặc định là PENDING, gắn Driver hiện tại */
    ReservationResponseDto createReservation(ReservationRequestDto dto, Principal principal);

    /** Lấy thông tin một đặt chỗ theo ID */
    ReservationResponseDto getReservationById(Long id);

    /** Lấy danh sách đặt chỗ của Driver hiện tại (tùy chọn lọc theo trạng thái) */
    List<ReservationResponseDto> getMyReservations(ReservationStatus status, Principal principal);

    /** Xác nhận đặt chỗ (PENDING → CONFIRMED) */
    ReservationResponseDto confirmReservation(Long id);

    /** Hủy đặt chỗ (PENDING hoặc CONFIRMED → CANCELLED) — chỉ chính Driver sở hữu nó */
    ReservationResponseDto cancelReservation(Long id, Principal principal);
}
