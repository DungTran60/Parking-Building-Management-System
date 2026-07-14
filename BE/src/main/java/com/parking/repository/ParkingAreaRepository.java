package com.parking.repository;

import com.parking.entity.ParkingArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingAreaRepository
        extends JpaRepository<ParkingArea, Long> {
    ParkingArea findByAreaCode(String areaCode);

    boolean existsByAreaCode(String areaCode);

    List<ParkingArea> findByStatus(String status);

    List<ParkingArea> findByAreaNameContaining(String keyword);
}