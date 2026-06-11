package com.parking.controller;

import com.parking.dao.VehicleTypeDAO;
import com.parking.model.VehicleType;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller xử lý các yêu cầu CRUD cho loại phương tiện (Vehicle Type).
 *
 * <p>Base URL: /api/vehicle-types</p>
 * <ul>
 *   <li>GET    /api/vehicle-types        - Lấy toàn bộ danh sách loại phương tiện</li>
 *   <li>GET    /api/vehicle-types/{id}   - Lấy một loại phương tiện theo ID</li>
 *   <li>POST   /api/vehicle-types        - Tạo mới một loại phương tiện</li>
 *   <li>PUT    /api/vehicle-types/{id}   - Cập nhật một loại phương tiện theo ID</li>
 *   <li>DELETE /api/vehicle-types/{id}   - Xóa một loại phương tiện theo ID</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/vehicle-types")
@CrossOrigin(origins = "*") // Cho phép các yêu cầu từ bất kỳ nguồn gốc nào (ví dụ: máy chủ dev của React FE)
public class VehicleTypeController {

    private final VehicleTypeDAO vehicleTypeDAO = new VehicleTypeDAO();

    // -------------------------------------------------------------------------
    // GET ALL
    // -------------------------------------------------------------------------

    /**
     * Lấy toàn bộ danh sách loại phương tiện.
     * Endpoint: GET /api/vehicle-types
     *
     * @return Danh sách VehicleType (HTTP 200)
     */
    @GetMapping
    public ResponseEntity<List<VehicleType>> getAllVehicleTypes() {
        List<VehicleType> list = vehicleTypeDAO.findAll();
        System.out.println("[VehicleTypeController] Lấy danh sách loại phương tiện. Tổng số: " + list.size());
        return ResponseEntity.ok(list);
    }

    // -------------------------------------------------------------------------
    // GET BY ID
    // -------------------------------------------------------------------------

    /**
     * Lấy thông tin một loại phương tiện theo ID.
     * Endpoint: GET /api/vehicle-types/{id}
     *
     * @param id ID của loại phương tiện
     * @return VehicleType (HTTP 200) hoặc thông báo lỗi (HTTP 404)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleTypeById(@PathVariable int id) {
        VehicleType vehicleType = vehicleTypeDAO.findById(id);
        if (vehicleType == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy loại phương tiện với ID: " + id));
        }
        return ResponseEntity.ok(vehicleType);
    }

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    /**
     * Tạo mới một loại phương tiện.
     * Endpoint: POST /api/vehicle-types
     *
     * @param vehicleType Thông tin loại phương tiện cần tạo (body JSON)
     * @return VehicleType vừa tạo (HTTP 201) hoặc thông báo lỗi
     */
    @PostMapping
    public ResponseEntity<?> createVehicleType(@RequestBody VehicleType vehicleType) {
        // Kiểm tra dữ liệu đầu vào bắt buộc
        if (vehicleType.getName() == null || vehicleType.getName().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tên loại phương tiện không được để trống."));
        }

        String name = vehicleType.getName().trim();

        // Kiểm tra trùng tên
        if (vehicleTypeDAO.nameExists(name)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Loại phương tiện '" + name.toUpperCase() + "' đã tồn tại trong hệ thống."));
        }

        vehicleType.setName(name);
        boolean success = vehicleTypeDAO.insert(vehicleType);

        if (success) {
            System.out.println("[VehicleTypeController] Tạo mới loại phương tiện thành công: " + vehicleType.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(vehicleType);
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra khi tạo loại phương tiện. Vui lòng thử lại sau."));
        }
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    /**
     * Cập nhật thông tin một loại phương tiện theo ID.
     * Endpoint: PUT /api/vehicle-types/{id}
     *
     * @param id          ID của loại phương tiện cần cập nhật
     * @param vehicleType Dữ liệu mới (body JSON)
     * @return VehicleType sau khi cập nhật (HTTP 200) hoặc thông báo lỗi
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicleType(@PathVariable int id, @RequestBody VehicleType vehicleType) {
        // Kiểm tra bản ghi tồn tại
        VehicleType existing = vehicleTypeDAO.findById(id);
        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy loại phương tiện với ID: " + id));
        }

        // Kiểm tra dữ liệu đầu vào bắt buộc
        if (vehicleType.getName() == null || vehicleType.getName().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tên loại phương tiện không được để trống."));
        }

        String name = vehicleType.getName().trim();

        // Kiểm tra trùng tên (loại trừ bản ghi hiện tại)
        if (vehicleTypeDAO.nameExistsExcludingId(name, id)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Loại phương tiện '" + name.toUpperCase() + "' đã tồn tại trong hệ thống."));
        }

        vehicleType.setId(id);
        vehicleType.setName(name);
        boolean success = vehicleTypeDAO.update(vehicleType);

        if (success) {
            // Trả về bản ghi sau cập nhật để đảm bảo dữ liệu nhất quán
            VehicleType updated = vehicleTypeDAO.findById(id);
            System.out.println("[VehicleTypeController] Cập nhật loại phương tiện thành công, ID: " + id);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra khi cập nhật loại phương tiện. Vui lòng thử lại sau."));
        }
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    /**
     * Xóa một loại phương tiện theo ID.
     * Endpoint: DELETE /api/vehicle-types/{id}
     *
     * @param id ID của loại phương tiện cần xóa
     * @return Thông báo thành công (HTTP 200) hoặc thông báo lỗi
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicleType(@PathVariable int id) {
        // Kiểm tra bản ghi tồn tại trước khi xóa
        VehicleType existing = vehicleTypeDAO.findById(id);
        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy loại phương tiện với ID: " + id));
        }

        boolean success = vehicleTypeDAO.delete(id);
        if (success) {
            System.out.println("[VehicleTypeController] Xóa loại phương tiện thành công, ID: " + id);
            return ResponseEntity.ok(Map.of("message", "Xóa loại phương tiện '" + existing.getName() + "' thành công!"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra khi xóa loại phương tiện. Vui lòng thử lại sau."));
        }
    }
}
