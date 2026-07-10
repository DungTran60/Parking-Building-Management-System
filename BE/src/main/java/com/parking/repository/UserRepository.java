package com.parking.repository;

import com.parking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository thao tác với bảng users
 * Kế thừa JpaRepository để sử dụng các hàm CRUD có sẵn
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long>
{
    /**
     * Tìm User theo username
     * Trả về Optional<User> để tránh lỗi null
     */
    Optional<User> findByUsername(String username);

    /**
     * Kiểm tra username đã tồn tại hay chưa
     * Trả về true nếu tồn tại, false nếu không tồn tại
     */
    boolean existsByUsername(String username);

    /**
     * Kiểm tra email đã tồn tại hay chưa
     * Trả về true nếu tồn tại, false nếu không tồn tại
     */
    boolean existsByEmail(String email);

    /**
     * Kiểm tra có user nào đang được gán role này không (theo role.id).
     * Dùng để chặn xóa role đang được sử dụng.
     */
    boolean existsByRole_Id(Long roleId);
}
