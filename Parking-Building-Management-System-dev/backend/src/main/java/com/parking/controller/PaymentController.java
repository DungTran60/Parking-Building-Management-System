package com.parking.controller;

import com.parking.dao.InvoiceDAO;
import com.parking.dao.PricingPolicyDAO;
import com.parking.model.Invoice;
import com.parking.model.PricingPolicy;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final InvoiceDAO invoiceDAO = new InvoiceDAO();
    private final PricingPolicyDAO pricingDAO = new PricingPolicyDAO();

    /**
     * Lấy toàn bộ danh sách hóa đơn trong hệ thống.
     */
    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceDAO.findAll());
    }

    /**
     * Lấy bảng giá gửi xe hiện tại của tất cả loại xe.
     */
    @GetMapping("/pricing")
    public ResponseEntity<List<PricingPolicy>> getPricingPolicies() {
        return ResponseEntity.ok(pricingDAO.findAll());
    }

    /**
     * Cập nhật chính sách giá cho một loại xe.
     */
    @PutMapping("/pricing")
    public ResponseEntity<?> updatePricingPolicy(@RequestBody PricingPolicy policy) {
        if (policy.getVehicleType() == null || policy.getVehicleType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Loại xe không được để trống."));
        }
        if (policy.getBaseRate() < 0 || policy.getHourlyRate() < 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Giá cước gửi xe phải lớn hơn hoặc bằng 0."));
        }

        boolean success = pricingDAO.update(policy);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Cập nhật chính sách giá thành công!", "policy", policy));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Không thể cập nhật chính sách giá."));
    }
}
