package com.parking.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.stream.Collectors;

public class DatabaseConnection {
    private static final String DB_URL = "jdbc:sqlite:parking_building.db";
    private static Connection connection = null;

    /**
     * Lấy kết nối cơ sở dữ liệu hiện tại. Tự động kết nối và khởi tạo
     * các bảng cơ sở dữ liệu nếu chúng chưa tồn tại.
     */
    public static synchronized Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                // Đăng ký driver SQLite một cách rõ ràng để đảm bảo đã tải
                Class.forName("org.sqlite.JDBC");
                connection = DriverManager.getConnection(DB_URL);
                System.out.println("[DatabaseConnection] Đã kết nối tới cơ sở dữ liệu SQLite: parking_building.db");
                
                // Khởi tạo cơ sở dữ liệu nếu cần
                initializeDatabase(connection);
            }
        } catch (Exception e) {
            System.err.println("[DatabaseConnection] Lỗi khi lấy kết nối cơ sở dữ liệu: " + e.getMessage());
            e.printStackTrace();
        }
        return connection;
    }

    /**
     * Kiểm tra xem cơ sở dữ liệu đã được khởi tạo chưa bằng cách xác minh sự tồn tại của bảng 'users'.
     * Nếu chưa khởi tạo, tiến hành thực thi tệp tin database_script.sql để tạo cấu trúc bảng.
     */
    private static void initializeDatabase(Connection conn) {
        try {
            // Kiểm tra xem bảng 'users' đã tồn tại hay chưa
            ResultSet rs = conn.getMetaData().getTables(null, null, "users", null);
            if (!rs.next()) {
                System.out.println("[DatabaseConnection] Các bảng chưa tồn tại. Bắt đầu tự động khởi tạo...");
                
                // Tải và đọc tài nguyên kịch bản SQL từ thư mục resources
                InputStream is = DatabaseConnection.class.getResourceAsStream("/database/database_script.sql");
                if (is == null) {
                    System.err.println("[DatabaseConnection] Lỗi nghiêm trọng: Không tìm thấy database_script.sql trong thư mục resources!");
                    return;
                }

                try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
                    String sqlContent = reader.lines().collect(Collectors.joining("\n"));
                    
                    // Tách các lệnh SQL bằng dấu chấm phẩy để thực thi từng lệnh riêng biệt
                    String[] statements = sqlContent.split(";");
                    try (Statement stmt = conn.createStatement()) {
                        for (String sql : statements) {
                            String trimmed = sql.trim();
                            if (!trimmed.isEmpty()) {
                                stmt.execute(trimmed);
                            }
                        }
                    }
                }
                System.out.println("[DatabaseConnection] Các bảng SQLite đã được khởi tạo thành công!");
            } else {
                System.out.println("[DatabaseConnection] Các bảng SQLite đã được xác minh và sẵn sàng sử dụng.");
            }
        } catch (Exception e) {
            System.err.println("[DatabaseConnection] Thất bại khi khởi tạo cơ sở dữ liệu SQLite: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
