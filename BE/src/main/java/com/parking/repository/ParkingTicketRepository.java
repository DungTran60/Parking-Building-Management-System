package com.parking.repository;

import com.parking.entity.ParkingTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParkingTicketRepository
        extends JpaRepository<ParkingTicket, Long> {

    Optional<ParkingTicket> findByVehicle_LicensePlateAndStatus(
            String licensePlate,
            String status
    );
}