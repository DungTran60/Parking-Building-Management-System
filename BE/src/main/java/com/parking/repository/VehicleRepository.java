package com.parking.repository;

import com.parking.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByPlateNumber(String plateNumber);

    boolean existsByPlateNumber(String plateNumber);

    List<Vehicle> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    /** Kiểm tra VehicleType có đang được dùng bởi Vehicle không (chặn xóa loại xe). */
    boolean existsByVehicleTypeId(Long vehicleTypeId);
}
