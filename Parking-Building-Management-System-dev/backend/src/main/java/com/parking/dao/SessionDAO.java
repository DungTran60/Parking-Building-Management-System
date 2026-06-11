package com.parking.dao;

import com.parking.model.ParkingSession;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) cho bảng parking_sessions.
 */
public class SessionDAO {

    private final SlotDAO slotDAO = new SlotDAO();

    /**
     * Thực hiện check-in xe mới vào bãi.
     * Tạo một session ACTIVE và cập nhật slot sang OCCUPIED.
     */
    public boolean checkIn(ParkingSession session) {
        String sql = "INSERT INTO parking_sessions (license_plate, slot_id, user_id, check_in_time, status) VALUES (?, ?, ?, ?, 'ACTIVE')";
        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Sử dụng Transaction

            try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setString(1, session.getLicensePlate().trim().toUpperCase());
                pstmt.setInt(2, session.getSlotId());
                if (session.getUserId() != null) {
                    pstmt.setInt(3, session.getUserId());
                } else {
                    pstmt.setNull(3, java.sql.Types.INTEGER);
                }
                
                // Nếu checkInTime null thì dùng thời gian hiện tại
                Timestamp now = session.getCheckInTime() != null ? session.getCheckInTime() : new Timestamp(System.currentTimeMillis());
                pstmt.setTimestamp(4, now);
                session.setCheckInTime(now);

                int affectedRows = pstmt.executeUpdate();
                if (affectedRows > 0) {
                    try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            session.setId(generatedKeys.getInt(1));
                        }
                    }
                    
                    // Cập nhật trạng thái slot sang OCCUPIED
                    String updateSlotSql = "UPDATE parking_slots SET status = 'OCCUPIED' WHERE id = ?";
                    try (PreparedStatement pstmtSlot = conn.prepareStatement(updateSlotSql)) {
                        pstmtSlot.setInt(1, session.getSlotId());
                        pstmtSlot.executeUpdate();
                    }

                    conn.commit(); // Hoàn thành transaction
                    return true;
                }
            } catch (Exception e) {
                conn.rollback(); // Hoàn tác nếu lỗi
                throw e;
            }
        } catch (Exception e) {
            System.err.println("[SessionDAO] Lỗi khi thực hiện check-in: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); } catch (Exception ignored) {}
            }
        }
        return false;
    }

    /**
     * Thực hiện check-out xe ra khỏi bãi.
     * Cập nhật check_out_time, status = 'COMPLETED' và trả slot về AVAILABLE.
     */
    public boolean checkOut(int sessionId, Timestamp checkOutTime) {
        String selectSql = "SELECT slot_id FROM parking_sessions WHERE id = ?";
        String updateSessionSql = "UPDATE parking_sessions SET check_out_time = ?, status = 'COMPLETED' WHERE id = ?";
        String updateSlotSql = "UPDATE parking_slots SET status = 'AVAILABLE' WHERE id = ?";
        
        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Sử dụng Transaction

            int slotId = -1;
            try (PreparedStatement pstmtSelect = conn.prepareStatement(selectSql)) {
                pstmtSelect.setInt(1, sessionId);
                try (ResultSet rs = pstmtSelect.executeQuery()) {
                    if (rs.next()) {
                        slotId = rs.getInt("slot_id");
                    }
                }
            }

            if (slotId == -1) {
                conn.rollback();
                return false;
            }

            // 1. Cập nhật Session
            try (PreparedStatement pstmtSession = conn.prepareStatement(updateSessionSql)) {
                pstmtSession.setTimestamp(1, checkOutTime);
                pstmtSession.setInt(2, sessionId);
                pstmtSession.executeUpdate();
            }

            // 2. Cập nhật Slot
            try (PreparedStatement pstmtSlot = conn.prepareStatement(updateSlotSql)) {
                pstmtSlot.setInt(1, slotId);
                pstmtSlot.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (Exception e) {
            if (conn != null) {
                try { conn.rollback(); } catch (Exception ignored) {}
            }
            System.err.println("[SessionDAO] Lỗi khi thực hiện check-out: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); } catch (Exception ignored) {}
            }
        }
        return false;
    }

    /**
     * Lấy toàn bộ danh sách lượt đỗ xe.
     */
    public List<ParkingSession> findAll() {
        List<ParkingSession> list = new ArrayList<>();
        String sql = "SELECT * FROM parking_sessions ORDER BY id DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[SessionDAO] Lỗi khi lấy danh sách session: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Lấy danh sách lượt đỗ xe đang hoạt động (ACTIVE).
     */
    public List<ParkingSession> findAllActive() {
        List<ParkingSession> list = new ArrayList<>();
        String sql = "SELECT * FROM parking_sessions WHERE status = 'ACTIVE' ORDER BY check_in_time DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[SessionDAO] Lỗi khi lấy danh sách session đang đỗ: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Tìm session theo ID.
     */
    public ParkingSession findById(int id) {
        String sql = "SELECT * FROM parking_sessions WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[SessionDAO] Lỗi khi tìm session theo ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Tìm lượt đỗ xe đang hoạt động (ACTIVE) theo biển số xe.
     */
    public ParkingSession findActiveByLicensePlate(String licensePlate) {
        String sql = "SELECT * FROM parking_sessions WHERE license_plate = ? AND status = 'ACTIVE' LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, licensePlate.trim().toUpperCase());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[SessionDAO] Lỗi khi tìm session hoạt động theo biển số: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Lấy lịch sử đỗ xe của người dùng.
     */
    public List<ParkingSession> findByUserId(int userId) {
        List<ParkingSession> list = new ArrayList<>();
        String sql = "SELECT * FROM parking_sessions WHERE user_id = ? ORDER BY check_in_time DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSet(rs));
                }
            }
        } catch (Exception e) {
            System.err.println("[SessionDAO] Lỗi khi lấy lịch sử đỗ của user: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Ánh xạ từ ResultSet sang model ParkingSession.
     */
    private ParkingSession mapResultSet(ResultSet rs) throws Exception {
        Integer userId = rs.getInt("user_id");
        if (rs.wasNull()) {
            userId = null;
        }
        return new ParkingSession(
                rs.getInt("id"),
                rs.getString("license_plate"),
                rs.getInt("slot_id"),
                userId,
                rs.getTimestamp("check_in_time"),
                rs.getTimestamp("check_out_time"),
                rs.getString("status")
        );
    }
}
