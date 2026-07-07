package com.parking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficEventDto {
    private Long sessionId;
    private String ticketCode;
    private String plateNumber;
    private String vehicleTypeName;
    private String slotCode;
    private String eventType; // "CHECK_IN" or "CHECK_OUT"
    private LocalDateTime eventTime;
}
