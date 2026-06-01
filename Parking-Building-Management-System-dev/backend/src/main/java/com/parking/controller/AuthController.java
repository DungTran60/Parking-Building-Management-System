package com.parking.controller;

import com.parking.dao.UserDAO;
import com.parking.model.User;
import com.parking.util.PasswordUtil;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Cho phép các yêu cầu từ bất kỳ nguồn gốc nào (ví dụ: máy chủ dev của React FE)
public class AuthController {
    
    private final UserDAO userDAO = new UserDAO();

    /**
     * Xác thực người dùng đăng nhập và trả về một token kèm thông tin người dùng.
     * Endpoint: POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Vui lòng điền đầy đủ tên đăng nhập và mật khẩu."));
        }

        User user = userDAO.findByUsername(username.trim());
        if (user == null || !PasswordUtil.checkPassword(password, user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tên đăng nhập hoặc mật khẩu không chính xác."));
        }

        // Tạo một mã token giả lập Bearer (sử dụng UUID để đảm bảo tính tin cậy và dễ dùng trong dự án sinh viên)
        String token = UUID.randomUUID().toString();

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        System.out.println("[AuthController] Người dùng đăng nhập thành công: " + username + " với vai trò: " + user.getRole());
        return ResponseEntity.ok(response);
    }

    /**
     * Đăng ký một tài khoản người dùng mới.
     * Endpoint: POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty() ||
            user.getPassword() == null || user.getPassword().trim().isEmpty() ||
            user.getFullName() == null || user.getFullName().trim().isEmpty() ||
            user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty() ||
            user.getRole() == null) {
            
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Vui lòng nhập đầy đủ tất cả các trường thông tin."));
        }

        String username = user.getUsername().trim();
        String role = user.getRole().trim().toLowerCase();

        // Kiểm tra tính hợp lệ của vai trò
        if (!role.equals("user") && !role.equals("staff") && !role.equals("admin")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Vai trò không hợp lệ. Chỉ chấp nhận: user, staff, admin."));
        }

        // Kiểm tra xem tên đăng nhập đã được sử dụng chưa
        if (userDAO.usernameExists(username)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác."));
        }

        // Mã hóa mật khẩu một cách an toàn bằng BCrypt
        String hashedPassword = PasswordUtil.hashPassword(user.getPassword());
        
        // Lưu thông tin người dùng mới
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(hashedPassword);
        newUser.setFullName(user.getFullName().trim());
        newUser.setPhoneNumber(user.getPhoneNumber().trim());
        newUser.setRole(role);

        boolean success = userDAO.insert(newUser);
        if (success) {
            System.out.println("[AuthController] Người dùng mới đăng ký thành công: " + username + " (" + role + ")");
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Đăng ký tài khoản thành công!",
                    "user", newUser
            ));
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau."));
        }
    }

    /**
     * Giả lập chức năng đăng xuất ở phía backend (quản lý token chủ yếu diễn ra ở phía client).
     * Endpoint: POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công!"));
    }
}
