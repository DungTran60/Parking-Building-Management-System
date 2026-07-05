package com.parking.repository;

import com.parking.entity.ParkingArea;
import com.parking.entity.ParkingTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ParkingTicketRepository
        extends JpaRepository<ParkingTicket, Long> {

    ParkingTicket findByTicketCode(String ticketCode);

    boolean existsByTicketCode(String ticketCode);

    List<ParkingTicket> findByCheckOutTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<ParkingTicket> findByCheckOutTimeBetweenAndParkingArea(LocalDateTime startDate, LocalDateTime endDate, ParkingArea parkingArea);

    Long countByStatus(String status);

    Long countByCheckOutTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<ParkingTicket> findByCheckInTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<ParkingTicket> findByCheckInTimeBetweenAndParkingArea_Id(LocalDateTime startDate, LocalDateTime endDate, Long parkingAreaId);
}
