package com.parking.entity;

/**
 * Loại phản hồi từ Driver về trải nghiệm gửi xe.
 */
public enum FeedbackType {
    /** Mất thẻ/vé xe */
    LOST_TICKET,
    /** Sai phí gửi xe */
    WRONG_FEE,
    /** Khó tìm xe */
    HARD_TO_FIND,
    /** Slot bị chiếm */
    SLOT_OCCUPIED,
    /** Vấn đề khác */
    OTHER
}
