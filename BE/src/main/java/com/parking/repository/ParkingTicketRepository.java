package com.parking.repository;

import com.parking.entity.ParkingTicket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParkingTicketRepository
        extends JpaRepository<ParkingTicket, Long> {

    ParkingTicket findByTicketCode(String ticketCode);

    boolean existsByTicketCode(String ticketCode);
}