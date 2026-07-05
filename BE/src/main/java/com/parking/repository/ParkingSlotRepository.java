package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByStatus(SlotStatus status);
    List<ParkingSlot> findByStatusAndVehicleTypeId(SlotStatus status, Long vehicleTypeId);

    /** Kiểm tra VehicleType có đang được dùng trong ParkingSlot không */
    boolean existsByVehicleTypeId(Long vehicleTypeId);
}
