package com.parking.controller;

import com.parking.dao.InvoiceDAO;
import com.parking.dao.PricingPolicyDAO;
import com.parking.dao.SessionDAO;
import com.parking.dao.SlotDAO;
import com.parking.model.Invoice;
import com.parking.model.ParkingSession;
import com.parking.model.ParkingSlot;
import com.parking.model.PricingPolicy;
import com.parking.util.DateTimeUtil;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    private final SessionDAO sessionDAO = new SessionDAO();
    private final SlotDAO slotDAO = new SlotDAO();
    private final InvoiceDAO invoiceDAO = new InvoiceDAO();
    private final PricingPolicyDAO pricingDAO = new PricingPolicyDAO();

    /**
     * Lấy toàn bộ lượt đỗ xe đang hoạt động (ACTIVE).
     */
    @GetMapping("/sessions/active")
    public ResponseEntity<List<ParkingSession>> getActiveSessions() {
        return ResponseEntity.ok(sessionDAO.findAllActive());
    }

    /**
     * Lấy danh sách tất cả các chỗ đỗ xe còn trống (AVAILABLE).
     */
    @GetMapping("/slots/available")
    public ResponseEntity<List<ParkingSlot>> getAvailableSlots() {
        List<ParkingSlot> list = slotDAO.findAll().stream()
                .filter(slot -> "AVAILABLE".equalsIgnoreCase(slot.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * Lấy danh sách toàn bộ chỗ đỗ xe.
     */
    @GetMapping("/slots")
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        return ResponseEntity.ok(slotDAO.findAll());
    }

    /**
     * Lấy danh sách chỗ đỗ xe theo tầng.
     */
    @GetMapping("/slots/floor/{floorId}")
    public ResponseEntity<List<ParkingSlot>> getSlotsByFloor(@PathVariable int floorId) {
        return ResponseEntity.ok(slotDAO.findByFloorId(floorId));
    }

    /**
     * Cho xe vào bãi (Check-in).
     */
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, Object> payload) {
        String licensePlate = (String) payload.get("licensePlate");
        Integer slotId = (Integer) payload.get("slotId");
        Integer userId = (Integer) payload.get("userId");

        if (licensePlate == null || licensePlate.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Biển số xe không được để trống."));
        }
        if (slotId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn chỗ đỗ xe."));
        }

        // 1. Kiểm tra xe này đã có trong bãi chưa
        ParkingSession activeSession = sessionDAO.findActiveByLicensePlate(licensePlate);
        if (activeSession != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xe này đã có trong bãi và chưa được check-out."));
        }

        // 2. Kiểm tra slot có hợp lệ và còn trống không
        ParkingSlot slot = slotDAO.findById(slotId);
        if (slot == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy chỗ đỗ xe tương ứng."));
        }
        if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỗ đỗ xe này hiện không còn trống."));
        }

        // 3. Thực hiện check-in
        ParkingSession session = new ParkingSession();
        session.setLicensePlate(licensePlate);
        session.setSlotId(slotId);
        session.setUserId(userId);
        session.setCheckInTime(new Timestamp(System.currentTimeMillis()));
        session.setStatus("ACTIVE");

        boolean success = sessionDAO.checkIn(session);
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Thực hiện check-in thất bại. Vui lòng thử lại."));
    }

    /**
     * Cho xe ra khỏi bãi (Check-out) và tính hóa đơn.
     */
    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestBody Map<String, Object> payload) {
        String licensePlate = (String) payload.get("licensePlate");
        Integer sessionId = (Integer) payload.get("sessionId");
        String paymentMethod = (String) payload.get("paymentMethod");

        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            paymentMethod = "CASH";
        }

        ParkingSession session = null;
        if (sessionId != null) {
            session = sessionDAO.findById(sessionId);
        } else if (licensePlate != null && !licensePlate.trim().isEmpty()) {
            session = sessionDAO.findActiveByLicensePlate(licensePlate);
        }

        if (session == null || !"ACTIVE".equalsIgnoreCase(session.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Không tìm thấy lượt gửi xe đang hoạt động phù hợp."));
        }

        // 1. Lấy thông tin loại xe để tính phí
        ParkingSlot slot = slotDAO.findById(session.getSlotId());
        String vehicleType = (slot != null) ? slot.getSlotType() : "CAR";

        // 2. Lấy chính sách giá tương ứng
        PricingPolicy policy = pricingDAO.findByVehicleType(vehicleType);

        // 3. Tính tiền gửi xe
        Timestamp checkOutTime = new Timestamp(System.currentTimeMillis());
        int hours = DateTimeUtil.calculateHoursRoundedUp(session.getCheckInTime(), checkOutTime);
        
        double amount = policy.getBaseRate();
        if (hours > 1) {
            amount += policy.getHourlyRate() * (hours - 1);
        }

        // 4. Lưu checkout và giải phóng slot trong Transaction
        boolean success = sessionDAO.checkOut(session.getId(), checkOutTime);
        if (!success) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Thực hiện check-out thất bại."));
        }

        // 5. Tạo hóa đơn
        Invoice invoice = new Invoice();
        invoice.setSessionId(session.getId());
        invoice.setAmount(amount);
        invoice.setPaymentTime(checkOutTime);
        invoice.setPaymentMethod(paymentMethod);
        invoice.setStatus("PAID");
        
        invoiceDAO.insert(invoice);

        // 6. Trả về kết quả thanh toán
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Check-out thành công!");
        response.put("licensePlate", session.getLicensePlate());
        response.put("checkInTime", session.getCheckInTime());
        response.put("checkOutTime", checkOutTime);
        response.put("hours", hours);
        response.put("amount", amount);
        response.put("paymentMethod", paymentMethod);
        response.put("invoiceId", invoice.getId());

        return ResponseEntity.ok(response);
    }
}
