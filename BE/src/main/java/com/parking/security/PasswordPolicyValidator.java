package com.parking.security;

import org.springframework.stereotype.Component;

@Component
public class PasswordPolicyValidator {

    public void validate(String password, String policyLevel) {
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống.");
        }

        switch (policyLevel != null ? policyLevel.toLowerCase() : "medium") {
            case "low":
                if (password.length() < 6) {
                    throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự.");
                }
                break;
            case "high":
                if (password.length() < 10) {
                    throw new IllegalArgumentException("Mật khẩu phải có ít nhất 10 ký tự.");
                }
                if (!password.matches(".*[A-Z].*")) {
                    throw new IllegalArgumentException("Mật khẩu phải chứa ít nhất 1 ký tự in hoa.");
                }
                if (!password.matches(".*[a-z].*")) {
                    throw new IllegalArgumentException("Mật khẩu phải chứa ít nhất 1 ký tự in thường.");
                }
                if (!password.matches(".*\\d.*")) {
                    throw new IllegalArgumentException("Mật khẩu phải chứa ít nhất 1 chữ số.");
                }
                if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>_+\\-=\\[\\]~`].*")) {
                    throw new IllegalArgumentException("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.");
                }
                break;
            case "medium":
            default:
                if (password.length() < 8) {
                    throw new IllegalArgumentException("Mật khẩu phải có ít nhất 8 ký tự.");
                }
                if (!password.matches(".*[A-Z].*")) {
                    throw new IllegalArgumentException("Mật khẩu phải chứa ít nhất 1 ký tự in hoa.");
                }
                if (!password.matches(".*[a-z].*")) {
                    throw new IllegalArgumentException("Mật khẩu phải chứa ít nhất 1 ký tự in thường.");
                }
                if (!password.matches(".*\\d.*")) {
                    throw new IllegalArgumentException("Mật khẩu phải chứa ít nhất 1 chữ số.");
                }
                break;
        }
    }
}
