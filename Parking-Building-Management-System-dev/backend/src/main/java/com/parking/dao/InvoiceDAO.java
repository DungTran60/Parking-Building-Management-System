package com.parking.dao;

import com.parking.model.Invoice;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) cho bảng invoices.
 */
public class InvoiceDAO {

    /**
     * Tạo một hóa đơn mới.
     */
    public boolean insert(Invoice invoice) {
        String sql = "INSERT INTO invoices (session_id, amount, payment_time, payment_method, status) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setInt(1, invoice.getSessionId());
            pstmt.setDouble(2, invoice.getAmount());
            Timestamp now = invoice.getPaymentTime() != null ? invoice.getPaymentTime() : new Timestamp(System.currentTimeMillis());
            pstmt.setTimestamp(3, now);
            invoice.setPaymentTime(now);
            pstmt.setString(4, invoice.getPaymentMethod() != null ? invoice.getPaymentMethod() : "CASH");
            pstmt.setString(5, invoice.getStatus() != null ? invoice.getStatus() : "PAID");

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        invoice.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (Exception e) {
            System.err.println("[InvoiceDAO] Lỗi khi tạo hóa đơn: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Lấy danh sách toàn bộ hóa đơn.
     */
    public List<Invoice> findAll() {
        List<Invoice> list = new ArrayList<>();
        String sql = "SELECT * FROM invoices ORDER BY id DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (Exception e) {
            System.err.println("[InvoiceDAO] Lỗi khi lấy danh sách hóa đơn: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /**
     * Tìm hóa đơn theo ID.
     */
    public Invoice findById(int id) {
        String sql = "SELECT * FROM invoices WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[InvoiceDAO] Lỗi khi tìm hóa đơn theo ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Tìm hóa đơn theo Session ID.
     */
    public Invoice findBySessionId(int sessionId) {
        String sql = "SELECT * FROM invoices WHERE session_id = ? LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, sessionId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSet(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[InvoiceDAO] Lỗi khi tìm hóa đơn theo Session ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Ánh xạ từ ResultSet sang model Invoice.
     */
    private Invoice mapResultSet(ResultSet rs) throws Exception {
        return new Invoice(
                rs.getInt("id"),
                rs.getInt("session_id"),
                rs.getDouble("amount"),
                rs.getTimestamp("payment_time"),
                rs.getString("payment_method"),
                rs.getString("status")
        );
    }
}
