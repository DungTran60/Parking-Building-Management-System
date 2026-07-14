package com.parking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSessionResponseDto {
    private String id;
    private String ticketCode;
    private String plateNumber;
    private String vehicleTypeId;
    private String vehicleTypeName;
    private String slotId;
    private String slotCode;
    private Long floorId;
    private String floorName;
    private Long reservationId;
    private String entryGate;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
    private Double fee;
    private String status;
    private String notes;
}
