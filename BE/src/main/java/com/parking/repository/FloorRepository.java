package com.parking.repository;

import com.parking.entity.Floor;
import com.parking.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    List<Floor> findByBuildingId(Long buildingId);

    boolean existsByNameAndBuildingId(String name, Long buildingId);
    boolean existsByBuildingId(Long buildingId);
    long countByBuildingId(Long buildingId);

    @Query("SELECT ps FROM ParkingSlot ps WHERE ps.floor.id = :floorId")
    List<ParkingSlot> findParkingSlotsByFloorId(@Param("floorId") Long floorId);
}
