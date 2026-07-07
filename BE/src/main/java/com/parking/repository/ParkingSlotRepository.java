package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByStatus(SlotStatus status);
    List<ParkingSlot> findByStatusAndVehicleTypeId(SlotStatus status, Long vehicleTypeId);

    /**
     * Finds the first available parking slot for a given vehicle type, ordering by floor and then slot code,
     * and applies a pessimistic write lock to prevent race conditions during check-in.
     *
     * @param status The desired status of the slot (e.g., AVAILABLE).
     * @param vehicleTypeId The ID of the vehicle type.
     * @return An Optional containing the locked ParkingSlot if found, otherwise empty.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ParkingSlot> findFirstByStatusAndVehicleTypeIdOrderByFloorIdAscCodeAsc(SlotStatus status, Long vehicleTypeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ps FROM ParkingSlot ps WHERE ps.id = :id")
    Optional<ParkingSlot> findByIdWithLock(@Param("id") Long id);

    ParkingSlot findByCode(String code);
    boolean existsByCode(String code);

    /** Kiểm tra VehicleType có đang được dùng trong ParkingSlot không */
    boolean existsByVehicleTypeId(Long vehicleTypeId);

    long countByFloorIdAndStatus(Long floorId, SlotStatus status);
}
