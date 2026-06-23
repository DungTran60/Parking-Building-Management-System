package com.parking.service;

import com.parking.dto.TicketGenerationRequest;
import com.parking.dto.TicketGenerationResponse;
import com.parking.entity.ParkingArea;
import com.parking.entity.ParkingTicket;
import com.parking.entity.Vehicle;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingAreaRepository;
import com.parking.repository.ParkingTicketRepository;
import com.parking.repository.VehicleRepository;
import com.parking.service.ParkingTicketService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingTicketServiceImpl
        implements ParkingTicketService {

    private final ParkingTicketRepository ticketRepository;
    private final VehicleRepository vehicleRepository;
    private final ParkingAreaRepository parkingAreaRepository;

    @Override
    public TicketGenerationResponse generateTicket(
            TicketGenerationRequest request) {

        Vehicle vehicle = vehicleRepository
                .findByLicensePlate(request.getLicensePlate());

        if (vehicle == null) {
            throw new ResourceNotFoundException(
                    "Vehicle not found");
        }

        ParkingArea area = parkingAreaRepository
                .findById(request.getParkingAreaId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Parking area not found"));

        String ticketCode =
                "PK-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();

        ParkingTicket ticket = new ParkingTicket();

        ticket.setTicketCode(ticketCode);
        ticket.setVehicle(vehicle);
        ticket.setParkingArea(area);
        ticket.setCheckInTime(LocalDateTime.now());
        ticket.setStatus("ACTIVE");

        ticket = ticketRepository.save(ticket);

        return TicketGenerationResponse.builder()
                .ticketId(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .licensePlate(vehicle.getLicensePlate())
                .parkingArea(area.getAreaName())
                .checkInTime(ticket.getCheckInTime())
                .status(ticket.getStatus())
                .build();
    }
}