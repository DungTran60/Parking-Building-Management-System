package com.parking.util;

import java.sql.Timestamp;

/**
 * Tiện ích xử lý ngày tháng và tính toán thời gian gửi xe.
 */
public class DateTimeUtil {

    /**
     * Tính số giờ gửi xe giữa check-in và check-out (làm tròn lên).
     * Ví dụ: 10 phút -> 1 giờ, 1 giờ 5 phút -> 2 giờ.
     * 
     * @param checkIn Thời gian vào
     * @param checkOut Thời gian ra
     * @return Số giờ gửi xe (tối thiểu là 1)
     */
    public static int calculateHoursRoundedUp(Timestamp checkIn, Timestamp checkOut) {
        if (checkIn == null || checkOut == null) {
            return 1;
        }
        long diffMs = checkOut.getTime() - checkIn.getTime();
        if (diffMs <= 0) {
            return 1;
        }
        // Quy đổi ra giờ
        double hours = (double) diffMs / (1000 * 60 * 60);
        return (int) Math.ceil(hours);
    }
}
