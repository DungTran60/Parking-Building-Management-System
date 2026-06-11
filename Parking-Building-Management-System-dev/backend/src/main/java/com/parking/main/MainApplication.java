package com.parking.main;

import com.parking.util.DatabaseConnection;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.parking")
public class MainApplication {

    public static void main(String[] args) {
        System.out.println("[MainApplication] Đang khởi động Backend Hệ thống Quản lý Tòa nhà Gửi xe (PBMS)...");
        
        // Chủ động khởi tạo kết nối và các bảng cơ sở dữ liệu khi bắt đầu ứng dụng
        try {
            DatabaseConnection.getConnection();
        } catch (Exception e) {
            System.err.println("[MainApplication] Khởi tạo cơ sở dữ liệu thất bại khi bắt đầu: " + e.getMessage());
        }

        SpringApplication.run(MainApplication.class, args);
        
        System.out.println("[MainApplication] PBMS REST API đã được khởi động thành công trên cổng 5000!");
    }
}
