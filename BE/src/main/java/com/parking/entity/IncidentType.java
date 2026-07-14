package com.parking.entity;

/**
 * Loại sự cố bãi xe.
 */
public enum IncidentType {
    LOST_TICKET,    // Mất vé / mã gửi xe
    WRONG_PLATE,    // Sai biển số xe
    WRONG_ZONE,     // Gửi sai khu vực
    OVERTIME,       // Quá giờ gửi
    UNPAID,         // Chưa thanh toán
    VEHICLE_DAMAGE, // Xe bị hỏng / va chạm trong bãi
    FACILITY_ISSUE  // Vấn đề cơ sở vật chất
}
