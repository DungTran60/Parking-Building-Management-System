package com.parking.repository;

import com.parking.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository thao tác với bảng roles
 * Kế thừa JpaRepository để sử dụng sẵn các hàm CRUD
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long>
{
    /**
     * Tìm Role theo tên
     * Trả về Optional<Role> để tránh lỗi null
     */
    Optional<Role> findByName(String name);
}