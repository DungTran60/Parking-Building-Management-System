package com.parking.service;

import com.parking.dto.VehicleCheckInRequest;
import com.parking.dto.VehicleCheckInResponse;
import com.parking.entity.*;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VehicleCheckInServiceImpl
        implements VehicleCheckInService {

    private final VehicleRepository vehicleRepository;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingTicketRepository ticketRepository;

    @Override
    public VehicleCheckInResponse checkIn(
            VehicleCheckInRequest request) {

        ParkingArea area = parkingAreaRepository
                .findById(request.getParkingAreaId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Parking area not found"));

        Vehicle vehicle =
                vehicleRepository.findByLicensePlate(
                        request.getLicensePlate());

        if (vehicle == null) {

            vehicle = new Vehicle();

            vehicle.setLicensePlate(
                    request.getLicensePlate());

            vehicle.setVehicleType(
                    request.getVehicleType());

            vehicle = vehicleRepository.save(vehicle);
        }

        ParkingTicket ticket = new ParkingTicket();

        ticket.setVehicle(vehicle);
        ticket.setParkingArea(area);
        ticket.setCheckInTime(LocalDateTime.now());
        ticket.setStatus("PARKING");

        ticketRepository.save(ticket);

        return VehicleCheckInResponse.builder()
                .ticketId(ticket.getId())
                .licensePlate(vehicle.getLicensePlate())
                .areaName(area.getAreaName())
                .checkInTime(ticket.getCheckInTime())
                .status(ticket.getStatus())
                .build();
    }
}