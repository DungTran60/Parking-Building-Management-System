package com.parking.dao;

import com.parking.model.ExceptionLog;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) cho bảng exception_logs.
 */
public class ExceptionLogDAO {

    /**
     * Ghi nhận một sự cố đỗ xe mới.
     */
    public boolean insert(ExceptionLog log) {
        String sql = "INSERT INTO exception_logs (session_id, log_message, resolved, created_at) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            if (log.getSessionId() != null) {
                pstmt.setInt(1, log.getSessionId());
            } else {
                pstmt.setNull(1, java.sql.Types.INTEGER);
            }
            pstmt.setString(2, log.getLogMessage().trim());
            pstmt.setString(3, log.getResolved() != null ? log.getResolved() : "NO");
            Timestamp now = log.getCreatedAt() != null ? log.getCreatedAt() : new Timestamp(System.currentTimeMillis());
            pstmt.setTimestamp(4, now);
            log.setCreatedAt(now);

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        log.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("[ExceptionLogDAO] Lỗi khi thêm nhật ký lỗi: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Lấy danh sách toàn bộ sự cố đỗ xe.
     */
    public List<ExceptionLog> findAll() {
        List<ExceptionLog> list = new ArrayList<>();
        String sql = "SELECT * FROM exception_logs ORDER BY id DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[ExceptionLogDAO] Lỗi khi lấy danh sách sự cố: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Cập nhật trạng thái sự cố thành đã được giải quyết (resolved = 'YES').
     */
    public boolean resolveLog(int id) {
        String sql = "UPDATE exception_logs SET resolved = 'YES' WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("[ExceptionLogDAO] Lỗi khi giải quyết sự cố: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Ánh xạ ResultSet sang ExceptionLog.
     */
    private ExceptionLog mapResultSet(ResultSet rs) throws Exception {
        Integer sessionId = rs.getInt("session_id");
        if (rs.wasNull()) {
            sessionId = null;
        }
        return new ExceptionLog(
                rs.getInt("id"),
                sessionId,
                rs.getString("log_message"),
                rs.getString("resolved"),
                rs.getTimestamp("created_at")
        );
    }
}
