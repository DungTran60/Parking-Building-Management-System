package com.parking.dto;

import com.parking.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusResponseDto {
    private Long id;
    private Status status;
    private LocalDateTime updatedAt;
}