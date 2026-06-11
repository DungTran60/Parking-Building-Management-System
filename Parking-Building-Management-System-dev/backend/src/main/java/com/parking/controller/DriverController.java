package com.parking.controller;

import com.parking.dao.SessionDAO;
import com.parking.dao.SlotDAO;
import com.parking.model.ParkingSession;
import com.parking.model.ParkingSlot;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/driver")
@CrossOrigin(origins = "*")
public class DriverController {

    private final SessionDAO sessionDAO = new SessionDAO();
    private final SlotDAO slotDAO = new SlotDAO();

    /**
     * Lấy lịch sử gửi xe của một khách hàng cụ thể.
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ParkingSession>> getHistoryByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(sessionDAO.findByUserId(userId));
    }

    /**
     * Xem các chỗ đỗ xe đang còn trống trong bãi.
     */
    @GetMapping("/slots/available")
    public ResponseEntity<List<ParkingSlot>> getAvailableSlots() {
        List<ParkingSlot> list = slotDAO.findAll().stream()
                .filter(slot -> "AVAILABLE".equalsIgnoreCase(slot.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * Đặt chỗ đỗ xe trước (đổi trạng thái slot thành RESERVED).
     */
    @PostMapping("/reserve")
    public ResponseEntity<?> reserveSlot(@RequestBody Map<String, Object> payload) {
        Integer slotId = (Integer) payload.get("slotId");
        if (slotId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng cung cấp mã chỗ đỗ xe."));
        }

        ParkingSlot slot = slotDAO.findById(slotId);
        if (slot == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy chỗ đỗ xe."));
        }
        if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỗ đỗ xe hiện tại không khả dụng để đặt."));
        }

        // Đổi trạng thái slot thành RESERVED
        boolean success = slotDAO.updateStatus(slotId, "RESERVED");
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Đặt chỗ thành công! Chỗ đỗ xe đã được giữ riêng cho bạn.", "slotId", slotId));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Không thể thực hiện đặt chỗ."));
    }
}
