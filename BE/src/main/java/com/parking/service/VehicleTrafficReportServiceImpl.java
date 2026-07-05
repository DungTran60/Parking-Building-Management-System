package com.parking.service;

import com.parking.dto.VehicleTrafficEntry;
import com.parking.dto.VehicleTrafficReportRequest;
import com.parking.dto.VehicleTrafficReportResponse;
import com.parking.entity.ParkingArea;
import com.parking.entity.ParkingTicket;
import com.parking.repository.ParkingAreaRepository;
import com.parking.repository.ParkingTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleTrafficReportServiceImpl implements VehicleTrafficReportService {

    private final ParkingTicketRepository parkingTicketRepository;
    private final ParkingAreaRepository parkingAreaRepository;

    @Override
    public VehicleTrafficReportResponse generateVehicleTrafficReport(VehicleTrafficReportRequest request) {
        LocalDateTime startDate = request.getStartDate();
        LocalDateTime endDate = request.getEndDate();
        Long parkingAreaId = request.getParkingAreaId();

        List<ParkingTicket> tickets;

        if (parkingAreaId != null) {
            ParkingArea parkingArea = parkingAreaRepository.findById(parkingAreaId)
                    .orElseThrow(() -> new IllegalArgumentException("Parking area not found with ID: " + parkingAreaId));
            tickets = parkingTicketRepository.findByCheckInTimeBetweenAndParkingAreaId(startDate, endDate, parkingAreaId);
        } else {
            tickets = parkingTicketRepository.findByCheckInTimeBetween(startDate, endDate);
        }

        List<VehicleTrafficEntry> entries = tickets.stream()
                .map(ticket -> VehicleTrafficEntry.builder()
                        .ticketId(ticket.getId())
                        .licensePlate(ticket.getVehicle() != null ? ticket.getVehicle().getLicensePlate() : null)
                        .vehicleType(ticket.getVehicle() != null ? ticket.getVehicle().getVehicleType() : null)
                        .parkingArea(ticket.getParkingArea())
                        .checkInTime(ticket.getCheckInTime())
                        .checkOutTime(ticket.getCheckOutTime())
                        .status(ticket.getStatus())
                        .build())
                .collect(Collectors.toList());

        Long totalVehiclesEntered = (long) tickets.size();
        Long totalVehiclesExited = tickets.stream()
                .filter(ticket -> ticket.getCheckOutTime() != null)
                .count();
        Long currentVehiclesInParking = parkingTicketRepository.countByStatus("ACTIVE");


        return VehicleTrafficReportResponse.builder()
                .entries(entries)
                .totalVehiclesEntered(totalVehiclesEntered)
                .totalVehiclesExited(totalVehiclesExited)
                .currentVehiclesInParking(currentVehiclesInParking)
                .build();
    }
}