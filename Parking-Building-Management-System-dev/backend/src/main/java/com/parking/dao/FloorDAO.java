package com.parking.dao;

import com.parking.model.Floor;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) cho bảng floors.
 * Cung cấp các thao tác CRUD: thêm, đọc, cập nhật và xóa tầng gửi xe.
 */
public class FloorDAO {

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    /**
     * Chèn một tầng gửi xe mới vào cơ sở dữ liệu.
     *
     * @param floor Thông tin tầng cần lưu
     * @return true nếu chèn thành công, ngược lại là false
     */
    public boolean insert(Floor floor) {
        String sql = "INSERT INTO floors (floor_name, total_slots) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, floor.getFloorName().trim());
            pstmt.setInt(2, floor.getTotalSlots());

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        floor.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("[FloorDAO] Lỗi khi thêm tầng mới: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    /**
     * Lấy toàn bộ danh sách tầng gửi xe từ cơ sở dữ liệu.
     *
     * @return Danh sách Floor, hoặc danh sách rỗng nếu không có dữ liệu
     */
    public List<Floor> findAll() {
        List<Floor> list = new ArrayList<>();
        String sql = "SELECT * FROM floors ORDER BY id ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[FloorDAO] Lỗi khi lấy danh sách tầng: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Tìm kiếm một tầng theo ID.
     *
     * @param id ID của tầng cần tìm
     * @return Đối tượng Floor nếu tìm thấy, ngược lại là null
     */
    public Floor findById(int id) {
        String sql = "SELECT * FROM floors WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[FloorDAO] Lỗi khi tìm tầng theo ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Kiểm tra xem tên tầng đã tồn tại trong cơ sở dữ liệu hay chưa.
     *
     * @param floorName Tên tầng cần kiểm tra
     * @return true nếu tên đã tồn tại, ngược lại là false
     */
    public boolean floorNameExists(String floorName) {
        String sql = "SELECT 1 FROM floors WHERE UPPER(floor_name) = UPPER(?) LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, floorName);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.err.println("[FloorDAO] Lỗi khi kiểm tra tên tầng: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Kiểm tra tên tầng tồn tại nhưng loại trừ bản ghi hiện tại (dùng khi cập nhật).
     *
     * @param floorName Tên tầng cần kiểm tra
     * @param excludeId ID của bản ghi cần loại trừ
     * @return true nếu tên đã được sử dụng bởi bản ghi khác, ngược lại là false
     */
    public boolean floorNameExistsExcludingId(String floorName, int excludeId) {
        String sql = "SELECT 1 FROM floors WHERE UPPER(floor_name) = UPPER(?) AND id != ? LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, floorName);
            pstmt.setInt(2, excludeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.err.println("[FloorDAO] Lỗi khi kiểm tra tên tầng (loại trừ ID): " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    /**
     * Cập nhật thông tin của một tầng đã tồn tại.
     *
     * @param floor Thông tin mới của tầng (phải có ID hợp lệ)
     * @return true nếu cập nhật thành công, ngược lại là false
     */
    public boolean update(Floor floor) {
        String sql = "UPDATE floors SET floor_name = ?, total_slots = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, floor.getFloorName().trim());
            pstmt.setInt(2, floor.getTotalSlots());
            pstmt.setInt(3, floor.getId());

            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            System.err.println("[FloorDAO] Lỗi khi cập nhật tầng ID=" + floor.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    /**
     * Xóa một tầng khỏi cơ sở dữ liệu theo ID.
     * Lưu ý: các bản ghi parking_slots thuộc tầng này sẽ bị xóa theo (ON DELETE CASCADE).
     *
     * @param id ID của tầng cần xóa
     * @return true nếu xóa thành công, ngược lại là false
     */
    public boolean delete(int id) {
        String sql = "DELETE FROM floors WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            System.err.println("[FloorDAO] Lỗi khi xóa tầng ID=" + id + ": " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    /**
     * Ánh xạ một hàng dữ liệu từ ResultSet sang đối tượng Floor.
     *
     * @param rs ResultSet đang trỏ vào hàng cần đọc
     * @return Đối tượng Floor được khởi tạo từ dữ liệu trong ResultSet
     */
    private Floor mapResultSet(ResultSet rs) throws Exception {
        Floor floor = new Floor();
        floor.setId(rs.getInt("id"));
        floor.setFloorName(rs.getString("floor_name"));
        floor.setTotalSlots(rs.getInt("total_slots"));
        floor.setCreatedAt(rs.getTimestamp("created_at"));
        return floor;
    }
}
