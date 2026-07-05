package com.parking.service;

import com.parking.dto.RevenueReportRequest;
import com.parking.dto.RevenueReportResponse;

public interface RevenueReportService {
    RevenueReportResponse generateRevenueReport(RevenueReportRequest request);
}