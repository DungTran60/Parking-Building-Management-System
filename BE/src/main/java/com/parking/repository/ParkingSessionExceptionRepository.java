package com.parking.repository;

import com.parking.entity.ParkingSessionException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParkingSessionExceptionRepository extends JpaRepository<ParkingSessionException, Long> {
}