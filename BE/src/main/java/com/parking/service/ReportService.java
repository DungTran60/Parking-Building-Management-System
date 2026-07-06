package com.parking.service;

import com.parking.dto.OccupancyReportDto;
import com.parking.dto.RevenueReportDto;
import com.parking.dto.TrafficReportDto;
import java.time.LocalDate;

public interface ReportService {
    RevenueReportDto getRevenueReport(LocalDate startDate, LocalDate endDate);
    OccupancyReportDto getOccupancyReport();
    TrafficReportDto getTrafficReport(LocalDate startDate, LocalDate endDate);
}
