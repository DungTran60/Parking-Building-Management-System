package com.parking.dto;

import com.parking.entity.ParkingArea;
import com.parking.entity.VehicleType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VehicleTrafficEntry {
    private Long ticketId;
    private String licensePlate;
    private String vehicleType;
    private ParkingArea parkingArea;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String status; // e.g., "CHECKED_IN", "CHECKED_OUT"
}