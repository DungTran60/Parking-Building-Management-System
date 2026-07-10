package com.parking.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSessionResponseDto {
    private Long id;
    private String ticketCode;
    private String plateNumber;
    private Long vehicleTypeId;
    private String vehicleTypeName;
    private Long slotId;
    private String slotCode;
    private Long floorId;
    private String floorName;
    private Long reservationId;
    private String entryGate;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
    private BigDecimal fee;
    private String status;
    private String notes;
    private String createdByUsername;
    private Long userId;
    private String ownerUsername;
}
