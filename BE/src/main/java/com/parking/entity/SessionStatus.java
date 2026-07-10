package com.parking.entity;

/**
 * Trạng thái của một lượt gửi xe (parking session).
 * Trước đây lưu dạng String tự do — nay ràng buộc bằng enum để tránh sai chính tả
 * và bảo đảm toàn vẹn dữ liệu. Cột DB vẫn là varchar (EnumType.STRING).
 */
public enum SessionStatus {
    /** Xe đang gửi trong bãi */
    ACTIVE,
    /** Đã check-out và hoàn tất thanh toán */
    COMPLETED,
    /** Đã check-out nhưng chưa thanh toán */
    UNPAID,
    /** Check-out theo diện mất vé */
    LOST_TICKET,
    /** Quá hạn gửi */
    EXPIRED
}
