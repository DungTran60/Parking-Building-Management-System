package com.parking.dao;

import com.parking.model.User;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class UserDAO {

    /**
     * Chèn một bản ghi người dùng mới vào cơ sở dữ liệu.
     *
     * @param user Thông tin người dùng cần lưu
     * @return true nếu chèn thành công, ngược lại là false
     */
    public boolean insert(User user) {
        String sql = "INSERT INTO users (username, password, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, user.getUsername());
            pstmt.setString(2, user.getPassword());
            pstmt.setString(3, user.getFullName());
            pstmt.setString(4, user.getPhoneNumber());
            pstmt.setString(5, user.getRole());
            
            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        user.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("[UserDAO] Lỗi khi thêm người dùng mới: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Tìm kiếm người dùng dựa trên tên đăng nhập.
     *
     * @param username Tên đăng nhập cần tìm
     * @return Đối tượng User nếu tìm thấy, ngược lại là null
     */
    public User findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setId(rs.getInt("id"));
                    user.setUsername(rs.getString("username"));
                    user.setPassword(rs.getString("password"));
                    user.setFullName(rs.getString("full_name"));
                    user.setPhoneNumber(rs.getString("phone_number"));
                    user.setRole(rs.getString("role"));
                    user.setCreatedAt(rs.getTimestamp("created_at"));
                    return user;
                }
            }
        } catch (Exception e) {
            System.err.println("[UserDAO] Lỗi khi tìm kiếm người dùng theo tên đăng nhập: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Kiểm tra xem tên đăng nhập đã tồn tại trong cơ sở dữ liệu hay chưa.
     *
     * @param username Tên đăng nhập cần kiểm tra
     * @return true nếu tên đăng nhập đã được sử dụng, ngược lại là false
     */
    public boolean usernameExists(String username) {
        String sql = "SELECT 1 FROM users WHERE username = ? LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.err.println("[UserDAO] Lỗi khi kiểm tra sự tồn tại của tên đăng nhập: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }
}
