package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByStatus(SlotStatus status);
    List<ParkingSlot> findByStatusAndVehicleTypeId(SlotStatus status, String vehicleTypeId);
}
