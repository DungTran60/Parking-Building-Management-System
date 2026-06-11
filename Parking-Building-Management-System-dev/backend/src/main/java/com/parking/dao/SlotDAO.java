package com.parking.dao;

import com.parking.model.ParkingSlot;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) cho bảng parking_slots.
 */
public class SlotDAO {

    /**
     * Thêm một chỗ đỗ xe mới.
     */
    public boolean insert(ParkingSlot slot) {
        String sql = "INSERT INTO parking_slots (slot_code, floor_id, slot_type, status) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, slot.getSlotCode().trim());
            pstmt.setInt(2, slot.getFloorId());
            pstmt.setString(3, slot.getSlotType() != null ? slot.getSlotType() : "CAR");
            pstmt.setString(4, slot.getStatus() != null ? slot.getStatus() : "AVAILABLE");

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        slot.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi thêm chỗ đỗ xe mới: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Lấy toàn bộ danh sách chỗ đỗ xe.
     */
    public List<ParkingSlot> findAll() {
        List<ParkingSlot> list = new ArrayList<>();
        String sql = "SELECT * FROM parking_slots ORDER BY id ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi lấy danh sách chỗ đỗ xe: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Tìm chỗ đỗ xe theo ID.
     */
    public ParkingSlot findById(int id) {
        String sql = "SELECT * FROM parking_slots WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi tìm chỗ đỗ xe theo ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Tìm chỗ đỗ xe theo mã code.
     */
    public ParkingSlot findBySlotCode(String slotCode) {
        String sql = "SELECT * FROM parking_slots WHERE slot_code = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, slotCode);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi tìm chỗ đỗ xe theo Code: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Lấy danh sách chỗ đỗ xe thuộc một tầng.
     */
    public List<ParkingSlot> findByFloorId(int floorId) {
        List<ParkingSlot> list = new ArrayList<>();
        String sql = "SELECT * FROM parking_slots WHERE floor_id = ? ORDER BY slot_code ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, floorId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSet(rs));
                }
            }
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi tìm chỗ đỗ xe theo Floor ID: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Cập nhật thông tin chỗ đỗ xe.
     */
    public boolean update(ParkingSlot slot) {
        String sql = "UPDATE parking_slots SET slot_code = ?, floor_id = ?, slot_type = ?, status = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, slot.getSlotCode().trim());
            pstmt.setInt(2, slot.getFloorId());
            pstmt.setString(3, slot.getSlotType());
            pstmt.setString(4, slot.getStatus());
            pstmt.setInt(5, slot.getId());

            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi cập nhật chỗ đỗ xe: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Cập nhật nhanh trạng thái của chỗ đỗ xe (AVAILABLE, OCCUPIED, RESERVED).
     */
    public boolean updateStatus(int id, String status) {
        String sql = "UPDATE parking_slots SET status = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            pstmt.setInt(2, id);

            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi cập nhật trạng thái chỗ đỗ xe: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Xóa chỗ đỗ xe.
     */
    public boolean delete(int id) {
        String sql = "DELETE FROM parking_slots WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi xóa chỗ đỗ xe: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Kiểm tra xem slot code đã tồn tại hay chưa.
     */
    public boolean slotCodeExists(String slotCode) {
        String sql = "SELECT 1 FROM parking_slots WHERE slot_code = ? LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, slotCode);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.err.println("[SlotDAO] Lỗi khi kiểm tra slot code tồn tại: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Đọc dữ liệu từ ResultSet sang ParkingSlot.
     */
    private ParkingSlot mapResultSet(ResultSet rs) throws Exception {
        return new ParkingSlot(
                rs.getInt("id"),
                rs.getString("slot_code"),
                rs.getInt("floor_id"),
                rs.getString("slot_type"),
                rs.getString("status")
        );
    }
}
