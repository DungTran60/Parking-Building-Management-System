package com.parking.controller;

import com.parking.dao.InvoiceDAO;
import com.parking.dao.SessionDAO;
import com.parking.dao.SlotDAO;
import com.parking.model.Invoice;
import com.parking.model.ParkingSlot;
import com.parking.util.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin(origins = "*")
public class ManagerController {

    private final InvoiceDAO invoiceDAO = new InvoiceDAO();
    private final SessionDAO sessionDAO = new SessionDAO();
    private final SlotDAO slotDAO = new SlotDAO();

    /**
     * Báo cáo tổng quan về bãi đỗ xe (doanh thu, số xe đang gửi, tỷ lệ lấp đầy).
     */
    @GetMapping("/reports/summary")
    public ResponseEntity<?> getSummaryReport() {
        // 1. Tính tổng doanh thu
        double totalRevenue = invoiceDAO.findAll().stream()
                .mapToDouble(Invoice::getAmount)
                .sum();

        // 2. Số xe đang đỗ
        int activeVehicles = sessionDAO.findAllActive().size();

        // 3. Tổng số chỗ đỗ xe và số chỗ đang hoạt động
        List<ParkingSlot> slots = slotDAO.findAll();
        int totalSlots = slots.size();
        long occupiedSlots = slots.stream()
                .filter(s -> "OCCUPIED".equalsIgnoreCase(s.getStatus()))
                .count();

        double occupancyRate = 0.0;
        if (totalSlots > 0) {
            occupancyRate = ((double) occupiedSlots / totalSlots) * 100.0;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("activeVehicles", activeVehicles);
        summary.put("totalSlots", totalSlots);
        summary.put("occupiedSlots", occupiedSlots);
        summary.put("occupancyRate", Math.round(occupancyRate * 10.0) / 10.0); // Làm tròn 1 chữ số thập phân

        return ResponseEntity.ok(summary);
    }

    /**
     * Thống kê doanh thu theo ngày từ cơ sở dữ liệu.
     */
    @GetMapping("/reports/by-date")
    public ResponseEntity<?> getRevenueByDate() {
        String sql = "SELECT date(payment_time) as pay_date, SUM(amount) as daily_revenue, COUNT(id) as total_invoices "
                   + "FROM invoices "
                   + "GROUP BY pay_date "
                   + "ORDER BY pay_date DESC";
                   
        List<Map<String, Object>> report = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("date", rs.getString("pay_date"));
                row.put("revenue", rs.getDouble("daily_revenue"));
                row.put("count", rs.getInt("total_invoices"));
                report.add(row);
            }
        } catch (Exception e) {
            System.err.println("[ManagerController] Lỗi khi tạo báo cáo doanh thu theo ngày: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi máy chủ khi lấy báo cáo doanh thu."));
        }
        return ResponseEntity.ok(report);
    }
}
