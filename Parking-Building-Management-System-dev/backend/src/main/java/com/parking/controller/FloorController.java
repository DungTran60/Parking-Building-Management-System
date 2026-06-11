package com.parking.controller;

import com.parking.dao.FloorDAO;
import com.parking.model.Floor;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller xử lý các yêu cầu CRUD cho tầng gửi xe (Floor).
 *
 * <p>Base URL: /api/floors</p>
 * <ul>
 *   <li>GET    /api/floors        - Lấy toàn bộ danh sách tầng</li>
 *   <li>GET    /api/floors/{id}   - Lấy một tầng theo ID</li>
 *   <li>POST   /api/floors        - Tạo mới một tầng</li>
 *   <li>PUT    /api/floors/{id}   - Cập nhật một tầng theo ID</li>
 *   <li>DELETE /api/floors/{id}   - Xóa một tầng theo ID</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/floors")
@CrossOrigin(origins = "*") // Cho phép các yêu cầu từ bất kỳ nguồn gốc nào (ví dụ: máy chủ dev của React FE)
public class FloorController {

    private final FloorDAO floorDAO = new FloorDAO();

    // -------------------------------------------------------------------------
    // GET ALL
    // -------------------------------------------------------------------------

    /**
     * Lấy toàn bộ danh sách tầng gửi xe.
     * Endpoint: GET /api/floors
     *
     * @return Danh sách Floor (HTTP 200)
     */
    @GetMapping
    public ResponseEntity<List<Floor>> getAllFloors() {
        List<Floor> list = floorDAO.findAll();
        System.out.println("[FloorController] Lấy danh sách tầng. Tổng số: " + list.size());
        return ResponseEntity.ok(list);
    }

    // -------------------------------------------------------------------------
    // GET BY ID
    // -------------------------------------------------------------------------

    /**
     * Lấy thông tin một tầng theo ID.
     * Endpoint: GET /api/floors/{id}
     *
     * @param id ID của tầng
     * @return Floor (HTTP 200) hoặc thông báo lỗi (HTTP 404)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFloorById(@PathVariable int id) {
        Floor floor = floorDAO.findById(id);
        if (floor == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy tầng với ID: " + id));
        }
        return ResponseEntity.ok(floor);
    }

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    /**
     * Tạo mới một tầng gửi xe.
     * Endpoint: POST /api/floors
     *
     * @param floor Thông tin tầng cần tạo (body JSON)
     * @return Floor vừa tạo (HTTP 201) hoặc thông báo lỗi
     */
    @PostMapping
    public ResponseEntity<?> createFloor(@RequestBody Floor floor) {
        // Kiểm tra tên tầng
        if (floor.getFloorName() == null || floor.getFloorName().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tên tầng không được để trống."));
        }

        // Kiểm tra tổng số chỗ
        if (floor.getTotalSlots() <= 0) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tổng số chỗ đỗ xe phải lớn hơn 0."));
        }

        String floorName = floor.getFloorName().trim();

        // Kiểm tra trùng tên tầng
        if (floorDAO.floorNameExists(floorName)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Tầng '" + floorName + "' đã tồn tại trong hệ thống."));
        }

        floor.setFloorName(floorName);
        boolean success = floorDAO.insert(floor);

        if (success) {
            System.out.println("[FloorController] Tạo mới tầng thành công: " + floor.getFloorName());
            return ResponseEntity.status(HttpStatus.CREATED).body(floor);
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra khi tạo tầng. Vui lòng thử lại sau."));
        }
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    /**
     * Cập nhật thông tin một tầng theo ID.
     * Endpoint: PUT /api/floors/{id}
     *
     * @param id    ID của tầng cần cập nhật
     * @param floor Dữ liệu mới (body JSON)
     * @return Floor sau khi cập nhật (HTTP 200) hoặc thông báo lỗi
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFloor(@PathVariable int id, @RequestBody Floor floor) {
        // Kiểm tra bản ghi tồn tại
        Floor existing = floorDAO.findById(id);
        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy tầng với ID: " + id));
        }

        // Kiểm tra tên tầng
        if (floor.getFloorName() == null || floor.getFloorName().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tên tầng không được để trống."));
        }

        // Kiểm tra tổng số chỗ
        if (floor.getTotalSlots() <= 0) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tổng số chỗ đỗ xe phải lớn hơn 0."));
        }

        String floorName = floor.getFloorName().trim();

        // Kiểm tra trùng tên (loại trừ bản ghi hiện tại)
        if (floorDAO.floorNameExistsExcludingId(floorName, id)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Tầng '" + floorName + "' đã tồn tại trong hệ thống."));
        }

        floor.setId(id);
        floor.setFloorName(floorName);
        boolean success = floorDAO.update(floor);

        if (success) {
            Floor updated = floorDAO.findById(id);
            System.out.println("[FloorController] Cập nhật tầng thành công, ID: " + id);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra khi cập nhật tầng. Vui lòng thử lại sau."));
        }
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    /**
     * Xóa một tầng theo ID.
     * Lưu ý: các chỗ đỗ xe (parking_slots) thuộc tầng này cũng bị xóa theo (ON DELETE CASCADE).
     * Endpoint: DELETE /api/floors/{id}
     *
     * @param id ID của tầng cần xóa
     * @return Thông báo thành công (HTTP 200) hoặc thông báo lỗi
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFloor(@PathVariable int id) {
        // Kiểm tra bản ghi tồn tại trước khi xóa
        Floor existing = floorDAO.findById(id);
        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy tầng với ID: " + id));
        }

        boolean success = floorDAO.delete(id);
        if (success) {
            System.out.println("[FloorController] Xóa tầng thành công, ID: " + id);
            return ResponseEntity.ok(Map.of("message", "Xóa tầng '" + existing.getFloorName() + "' thành công!"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra khi xóa tầng. Vui lòng thử lại sau."));
        }
    }
}
