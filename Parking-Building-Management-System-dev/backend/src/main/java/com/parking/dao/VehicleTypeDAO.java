package com.parking.dao;

import com.parking.model.VehicleType;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) cho bảng vehicle_types.
 * Cung cấp các thao tác CRUD: thêm, đọc, cập nhật và xóa loại phương tiện.
 */
public class VehicleTypeDAO {

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    /**
     * Chèn một loại phương tiện mới vào cơ sở dữ liệu.
     *
     * @param vehicleType Thông tin loại phương tiện cần lưu
     * @return true nếu chèn thành công, ngược lại là false
     */
    public boolean insert(VehicleType vehicleType) {
        String sql = "INSERT INTO vehicle_types (name, description) VALUES (?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, vehicleType.getName().toUpperCase());
            pstmt.setString(2, vehicleType.getDescription());

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        vehicleType.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("[VehicleTypeDAO] Lỗi khi thêm loại phương tiện mới: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // READ
    // -------------------------------------------------------------------------

    /**
     * Lấy toàn bộ danh sách loại phương tiện từ cơ sở dữ liệu.
     *
     * @return Danh sách các VehicleType, hoặc danh sách rỗng nếu không có dữ liệu
     */
    public List<VehicleType> findAll() {
        List<VehicleType> list = new ArrayList<>();
        String sql = "SELECT * FROM vehicle_types ORDER BY id ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[VehicleTypeDAO] Lỗi khi lấy danh sách loại phương tiện: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Tìm kiếm một loại phương tiện theo ID.
     *
     * @param id ID của loại phương tiện cần tìm
     * @return Đối tượng VehicleType nếu tìm thấy, ngược lại là null
     */
    public VehicleType findById(int id) {
        String sql = "SELECT * FROM vehicle_types WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[VehicleTypeDAO] Lỗi khi tìm loại phương tiện theo ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Kiểm tra xem tên loại phương tiện đã tồn tại chưa (không phân biệt hoa thường).
     *
     * @param name Tên loại phương tiện cần kiểm tra
     * @return true nếu tên đã tồn tại, ngược lại là false
     */
    public boolean nameExists(String name) {
        String sql = "SELECT 1 FROM vehicle_types WHERE UPPER(name) = UPPER(?) LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.err.println("[VehicleTypeDAO] Lỗi khi kiểm tra tên loại phương tiện: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Kiểm tra tên tồn tại nhưng loại trừ bản ghi hiện tại (dùng khi cập nhật).
     *
     * @param name Tên cần kiểm tra
     * @param excludeId ID của bản ghi hiện tại cần loại trừ
     * @return true nếu tên đã được sử dụng bởi bản ghi khác, ngược lại là false
     */
    public boolean nameExistsExcludingId(String name, int excludeId) {
        String sql = "SELECT 1 FROM vehicle_types WHERE UPPER(name) = UPPER(?) AND id != ? LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            pstmt.setInt(2, excludeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (Exception e) {
            System.err.println("[VehicleTypeDAO] Lỗi khi kiểm tra tên loại phương tiện (loại trừ ID): " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    /**
     * Cập nhật thông tin của một loại phương tiện đã tồn tại.
     *
     * @param vehicleType Thông tin mới của loại phương tiện (phải có ID hợp lệ)
     * @return true nếu cập nhật thành công, ngược lại là false
     */
    public boolean update(VehicleType vehicleType) {
        String sql = "UPDATE vehicle_types SET name = ?, description = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, vehicleType.getName().toUpperCase());
            pstmt.setString(2, vehicleType.getDescription());
            pstmt.setInt(3, vehicleType.getId());

            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            System.err.println("[VehicleTypeDAO] Lỗi khi cập nhật loại phương tiện ID=" + vehicleType.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    /**
     * Xóa một loại phương tiện khỏi cơ sở dữ liệu theo ID.
     *
     * @param id ID của loại phương tiện cần xóa
     * @return true nếu xóa thành công, ngược lại là false
     */
    public boolean delete(int id) {
        String sql = "DELETE FROM vehicle_types WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        } catch (Exception e) {
            System.err.println("[VehicleTypeDAO] Lỗi khi xóa loại phương tiện ID=" + id + ": " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    /**
     * Ánh xạ một hàng dữ liệu từ ResultSet sang đối tượng VehicleType.
     *
     * @param rs ResultSet đang trỏ vào hàng cần đọc
     * @return Đối tượng VehicleType được khởi tạo từ dữ liệu trong ResultSet
     */
    private VehicleType mapResultSet(ResultSet rs) throws Exception {
        VehicleType vt = new VehicleType();
        vt.setId(rs.getInt("id"));
        vt.setName(rs.getString("name"));
        vt.setDescription(rs.getString("description"));
        vt.setCreatedAt(rs.getTimestamp("created_at"));
        return vt;
    }
}
