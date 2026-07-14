package com.parking.entity;

/**
 * Trạng thái xử lý sự cố.
 */
public enum IncidentStatus {
    OPEN,        // Mới ghi nhận, chưa xử lý
    IN_PROGRESS, // Đang xử lý
    RESOLVED,    // Đã giải quyết
    CLOSED       // Đã đóng
}
