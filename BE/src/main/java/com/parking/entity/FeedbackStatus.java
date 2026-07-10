package com.parking.entity;

/**
 * Trạng thái xử lý phản hồi.
 */
public enum FeedbackStatus {
    /** Mới gửi, chưa xem */
    NEW,
    /** Đã tiếp nhận/xem xét */
    REVIEWED,
    /** Đã xử lý xong */
    RESOLVED
}
