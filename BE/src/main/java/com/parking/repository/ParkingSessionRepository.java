package com.parking.repository;

import com.parking.entity.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long> {
    Optional<ParkingSession> findByTicketCodeAndStatus(String ticketCode, String status);
    Optional<ParkingSession> findByPlateNumberAndStatus(String plateNumber, String status);
    Optional<ParkingSession> findFirstByTicketCodeOrPlateNumberAndStatusOrderByIdDesc(String ticketCode, String plateNumber, String status);
}
