package com.parking.controller;

import com.parking.dto.OccupancyReportDto;
import com.parking.dto.RevenueReportDto;
import com.parking.dto.TrafficEventDto;
import com.parking.dto.TrafficReportDto;
import com.parking.exception.BadRequestException;
import com.parking.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('reports:view')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportDto> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        validateDateRange(startDate, endDate);
        
        return ResponseEntity.ok(reportService.getRevenueReport(startDate, endDate));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<OccupancyReportDto> getOccupancyReport() {
        return ResponseEntity.ok(reportService.getOccupancyReport());
    }

    @GetMapping("/traffic")
    public ResponseEntity<TrafficReportDto> getTrafficReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        validateDateRange(startDate, endDate);
        
        return ResponseEntity.ok(reportService.getTrafficReport(startDate, endDate));
    }

    @GetMapping("/traffic-events")
    public ResponseEntity<Page<TrafficEventDto>> getTrafficEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        validateDateRange(startDate, endDate);
        validateEventType(eventType);

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return ResponseEntity.ok(reportService.getTrafficEvents(startDate, endDate, eventType, pageable));
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("startDate must not be after endDate");
        }
    }

    private void validateEventType(String eventType) {
        if (eventType != null) {
            String upper = eventType.trim().toUpperCase();
            if (!"ALL".equals(upper) && !"CHECK_IN".equals(upper) && !"CHECK_OUT".equals(upper)) {
                throw new BadRequestException("Invalid eventType. Allowed values: ALL, CHECK_IN, CHECK_OUT");
            }
        }
    }
}
