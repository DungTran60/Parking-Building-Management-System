package com.parking.dao;

import com.parking.model.PricingPolicy;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) cho bảng pricing_policies.
 */
public class PricingPolicyDAO {

    /**
     * Lấy toàn bộ chính sách giá.
     */
    public List<PricingPolicy> findAll() {
        List<PricingPolicy> list = new ArrayList<>();
        String sql = "SELECT * FROM pricing_policies ORDER BY id ASC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[PricingPolicyDAO] Lỗi khi lấy danh sách chính sách giá: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Nếu DB chưa có chính sách giá nào, tự động khởi tạo mặc định
        if (list.isEmpty()) {
            initDefaultPolicies();
            return findAll();
        }
        return list;
    }

    /**
     * Tìm chính sách giá theo loại xe.
     */
    public PricingPolicy findByVehicleType(String vehicleType) {
        String sql = "SELECT * FROM pricing_policies WHERE vehicle_type = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, vehicleType.trim().toUpperCase());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[PricingPolicyDAO] Lỗi khi tìm chính sách giá theo loại xe: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Trả về chính sách mặc định nếu không có trong DB
        return getDefaultPolicy(vehicleType);
    }

    /**
     * Cập nhật chính sách giá.
     */
    public boolean update(PricingPolicy policy) {
        String sql = "UPDATE pricing_policies SET base_rate = ?, hourly_rate = ?, last_updated = CURRENT_TIMESTAMP WHERE vehicle_type = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDouble(1, policy.getBaseRate());
            pstmt.setDouble(2, policy.getHourlyRate());
            pstmt.setString(3, policy.getVehicleType().trim().toUpperCase());

            int rows = pstmt.executeUpdate();
            if (rows > 0) {
                return true;
            }
            
            // Nếu chưa có thì chèn mới
            return insert(policy);
        } catch (Exception e) {
            System.err.println("[PricingPolicyDAO] Lỗi khi cập nhật chính sách giá: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Chèn chính sách giá mới.
     */
    public boolean insert(PricingPolicy policy) {
        String sql = "INSERT INTO pricing_policies (vehicle_type, base_rate, hourly_rate) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, policy.getVehicleType().trim().toUpperCase());
            pstmt.setDouble(2, policy.getBaseRate());
            pstmt.setDouble(3, policy.getHourlyRate());

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        policy.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("[PricingPolicyDAO] Lỗi khi chèn chính sách giá: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Khởi tạo dữ liệu giá mặc định cho bãi xe.
     */
    private void initDefaultPolicies() {
        insert(new PricingPolicy(null, "CAR", 20000, 10000, null));
        insert(new PricingPolicy(null, "MOTORBIKE", 5000, 2000, null));
        insert(new PricingPolicy(null, "TRUCK", 50000, 20000, null));
        System.out.println("[PricingPolicyDAO] Đã khởi tạo chính sách giá mặc định thành công.");
    }

    /**
     * Lấy chính sách giá mặc định trong bộ nhớ (phòng hờ DB lỗi).
     */
    private PricingPolicy getDefaultPolicy(String vehicleType) {
        String type = vehicleType.toUpperCase();
        if (type.contains("MOTORBIKE")) {
            return new PricingPolicy(null, "MOTORBIKE", 5000, 2000, null);
        } else if (type.contains("TRUCK")) {
            return new PricingPolicy(null, "TRUCK", 50000, 20000, null);
        } else {
            return new PricingPolicy(null, "CAR", 20000, 10000, null);
        }
    }

    /**
     * Ánh xạ ResultSet sang PricingPolicy.
     */
    private PricingPolicy mapResultSet(ResultSet rs) throws Exception {
        return new PricingPolicy(
                rs.getInt("id"),
                rs.getString("vehicle_type"),
                rs.getDouble("base_rate"),
                rs.getDouble("hourly_rate"),
                rs.getTimestamp("last_updated")
        );
    }
}
