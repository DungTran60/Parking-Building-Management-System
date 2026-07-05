package com.parking.service;

import com.parking.dto.RevenueByArea;
import com.parking.dto.RevenueReportRequest;
import com.parking.dto.RevenueReportResponse;
import com.parking.entity.ParkingArea;
import com.parking.entity.ParkingTicket;
import com.parking.repository.ParkingAreaRepository;
import com.parking.repository.ParkingTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueReportServiceImpl implements RevenueReportService {

    private final ParkingTicketRepository parkingTicketRepository;
    private final ParkingAreaRepository parkingAreaRepository;

    @Override
    public RevenueReportResponse generateRevenueReport(RevenueReportRequest request) {
        LocalDateTime startDate = request.getStartDate();
        LocalDateTime endDate = request.getEndDate();
        Long parkingAreaId = request.getParkingAreaId();

        List<ParkingTicket> tickets;

        if (parkingAreaId != null) {
            ParkingArea parkingArea = parkingAreaRepository.findById(parkingAreaId)
                    .orElseThrow(() -> new IllegalArgumentException("Parking area not found with ID: " + parkingAreaId));
            tickets = parkingTicketRepository.findByCheckOutTimeBetweenAndParkingArea(startDate, endDate, parkingArea);
        } else {
            tickets = parkingTicketRepository.findByCheckOutTimeBetween(startDate, endDate);
        }

        // Filter out tickets with null or zero fee for revenue calculation
        tickets = tickets.stream()
                .filter(ticket -> ticket.getFee() != null && ticket.getFee() > 0)
                .collect(Collectors.toList());

        Double totalRevenue = tickets.stream()
                .mapToDouble(ParkingTicket::getFee)
                .sum();
        Long totalTickets = (long) tickets.size();
        Double averageRevenuePerTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0.0;

        Map<ParkingArea, List<ParkingTicket>> ticketsByArea = tickets.stream()
                .collect(Collectors.groupingBy(ParkingTicket::getParkingArea));

        List<RevenueByArea> revenueByAreaList = ticketsByArea.entrySet().stream()
                .map(entry -> {
                    ParkingArea area = entry.getKey();
                    List<ParkingTicket> areaTickets = entry.getValue();

                    Double areaRevenue = areaTickets.stream()
                            .mapToDouble(ParkingTicket::getFee)
                            .sum();
                    Long areaTicketCount = (long) areaTickets.size();
                    Double areaAverageRevenue = areaTicketCount > 0 ? areaRevenue / areaTicketCount : 0.0;

                    return RevenueByArea.builder()
                            .parkingAreaId(area.getId())
                            .parkingAreaName(area.getAreaName())
                            .totalRevenue(areaRevenue)
                            .numberOfTickets(areaTicketCount)
                            .averageRevenuePerTicket(areaAverageRevenue)
                            .build();
                })
                .collect(Collectors.toList());

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTickets(totalTickets)
                .averageRevenuePerTicket(averageRevenuePerTicket)
                .revenueByAreaList(revenueByAreaList)
                .build();
    }
}