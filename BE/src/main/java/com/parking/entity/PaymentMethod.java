package com.parking.entity;

/**
 * Hình thức thanh toán phí gửi xe.
 * Trước đây lưu dạng String tự do — nay ràng buộc bằng enum. Cột DB vẫn là varchar (EnumType.STRING).
 */
public enum PaymentMethod {
    /** Tiền mặt */
    CASH,
    /** Quét mã QR */
    QR_CODE,
    /** Thẻ ngân hàng */
    BANK_CARD
}
