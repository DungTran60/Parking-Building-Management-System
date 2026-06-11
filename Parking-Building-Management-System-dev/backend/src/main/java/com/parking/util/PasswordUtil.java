package com.parking.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    /**
     * Mã hóa mật khẩu văn bản thô bằng BCrypt với độ phức tạp mặc định là 12.
     *
     * @param plainPassword mật khẩu văn bản thô
     * @return chuỗi hash mật khẩu bảo mật đã được thêm muối
     */
    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống hoặc rỗng");
        }
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
    }

    /**
     * Xác minh mật khẩu văn bản thô so với chuỗi hash BCrypt đã được lưu.
     *
     * @param plainPassword mật khẩu văn bản thô cần kiểm tra
     * @param hashedPassword chuỗi hash mật khẩu đã mã hóa để đối chiếu
     * @return true nếu mật khẩu trùng khớp, ngược lại là false
     */
    public static boolean checkPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainPassword, hashedPassword);
        } catch (Exception e) {
            System.err.println("[PasswordUtil] Lỗi xác minh mã hóa mật khẩu: " + e.getMessage());
            return false;
        }
    }
}
