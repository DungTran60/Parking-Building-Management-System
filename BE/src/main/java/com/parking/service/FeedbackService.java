package com.parking.service;

import com.parking.dto.FeedbackRequestDto;
import com.parking.dto.FeedbackResolveDto;
import com.parking.dto.FeedbackResponseDto;
import com.parking.entity.FeedbackStatus;

import java.util.List;

/**
 * Service quản lý phản hồi của Driver.
 */
public interface FeedbackService {

    /** Driver gửi phản hồi mới. */
    FeedbackResponseDto createFeedback(FeedbackRequestDto dto);

    /** Danh sách phản hồi của tài khoản đang đăng nhập. */
    List<FeedbackResponseDto> getMyFeedbacks();

    /** Danh sách tất cả phản hồi (Manager/Admin), tùy chọn lọc theo trạng thái. */
    List<FeedbackResponseDto> getAllFeedbacks(FeedbackStatus status);

    /** Manager/Admin xử lý & phản hồi lại. */
    FeedbackResponseDto resolveFeedback(Long id, FeedbackResolveDto dto);
}
