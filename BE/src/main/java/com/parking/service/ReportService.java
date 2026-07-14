package com.parking.service;

import com.parking.dto.OccupancyReportDto;
import com.parking.dto.RevenueReportDto;
import com.parking.dto.TrafficReportDto;
import com.parking.dto.TrafficEventDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;

public interface ReportService {
    RevenueReportDto getRevenueReport(LocalDate startDate, LocalDate endDate);
    OccupancyReportDto getOccupancyReport();
    TrafficReportDto getTrafficReport(LocalDate startDate, LocalDate endDate);
    Page<TrafficEventDto> getTrafficEvents(LocalDate startDate, LocalDate endDate, String eventType, Pageable pageable);
}
