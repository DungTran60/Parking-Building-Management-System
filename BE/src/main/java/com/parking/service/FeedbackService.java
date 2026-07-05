package com.parking.service;

import com.parking.dto.FeedbackRequestDto;
import com.parking.dto.FeedbackResponseDto;
import com.parking.entity.FeedbackStatus;

import java.util.List;

public interface FeedbackService {

    /** Khách hàng tạo feedback mới */
    FeedbackResponseDto createFeedback(FeedbackRequestDto dto, String username);

    /** Lấy feedback theo ID */
    FeedbackResponseDto getFeedback(Long id);

    /** Admin lấy tất cả feedback */
    List<FeedbackResponseDto> getAllFeedback();

    /** Admin lọc feedback theo status */
    List<FeedbackResponseDto> getFeedbackByStatus(FeedbackStatus status);

    /** Khách hàng lấy feedback của chính mình */
    List<FeedbackResponseDto> getCustomerFeedback(String username);

    /** Admin cập nhật feedback */
    FeedbackResponseDto updateFeedback(Long id, FeedbackRequestDto dto);

    /** Admin duyệt feedback */
    FeedbackResponseDto approveFeedback(Long id);

    /** Admin từ chối feedback */
    FeedbackResponseDto rejectFeedback(Long id);

    /** Admin xóa feedback */
    void deleteFeedback(Long id);
}
