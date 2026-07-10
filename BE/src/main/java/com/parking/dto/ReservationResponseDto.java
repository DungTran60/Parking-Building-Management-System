package com.parking.dto;

import com.parking.entity.ReservationStatus;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO trả về thông tin đặt chỗ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponseDto {

    private Long id;
    private String plateNumber;

    // Vehicle type info
    private Long vehicleTypeId;
    private String vehicleTypeName;

    // Slot info
    private Long slotId;
    private String slotCode;

    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private ReservationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Chủ sở hữu (tài khoản Driver) của đặt chỗ
    private Long userId;
    private String ownerUsername;
}
