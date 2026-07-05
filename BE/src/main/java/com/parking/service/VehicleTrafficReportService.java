package com.parking.service;

import com.parking.dto.VehicleTrafficReportRequest;
import com.parking.dto.VehicleTrafficReportResponse;

public interface VehicleTrafficReportService {
    VehicleTrafficReportResponse generateVehicleTrafficReport(VehicleTrafficReportRequest request);
}