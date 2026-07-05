package com.parking.service;

import com.parking.dto.DashboardSummaryResponse;
import com.parking.repository.ParkingAreaRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ParkingTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingTicketRepository parkingTicketRepository;
    private final RevenueReportService revenueReportService; // To reuse revenue calculation logic

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        // Parking Area/Slot Metrics
        Long totalParkingAreas = parkingAreaRepository.count();
        Long totalParkingSlots = parkingSlotRepository.count();
        Long availableParkingSlots = parkingSlotRepository.countByStatus("AVAILABLE");
        Long occupiedParkingSlots = parkingSlotRepository.countByStatus("OCCUPIED");

        // Revenue Summary (today and current month)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.with(LocalTime.MIN);
        LocalDateTime endOfDay = now.with(LocalTime.MAX);

        LocalDateTime startOfMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime endOfMonth = now.withDayOfMonth(now.toLocalDate().lengthOfMonth()).with(LocalTime.MAX);

        Double todayRevenue = revenueReportService.generateRevenueReport(
                new com.parking.dto.RevenueReportRequest(startOfDay, endOfDay, null)
        ).getTotalRevenue();

        Double monthRevenue = revenueReportService.generateRevenueReport(
                new com.parking.dto.RevenueReportRequest(startOfMonth, endOfMonth, null)
        ).getTotalRevenue();

        // Ticket Metrics
        Long totalActiveTickets = parkingTicketRepository.countByStatus("ACTIVE");
        
        // Count tickets checked out today
        Long totalCheckedOutToday = parkingTicketRepository.countByCheckOutTimeBetween(startOfDay, endOfDay);

        return DashboardSummaryResponse.builder()
                .totalParkingAreas(totalParkingAreas)
                .totalParkingSlots(totalParkingSlots)
                .availableParkingSlots(availableParkingSlots)
                .occupiedParkingSlots(occupiedParkingSlots)
                .todayRevenue(todayRevenue)
                .monthRevenue(monthRevenue)
                .totalActiveTickets(totalActiveTickets)
                .totalCheckedOutToday(totalCheckedOutToday)
                .build();
    }
}