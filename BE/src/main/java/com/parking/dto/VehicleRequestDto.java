package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO tạo/cập nhật phương tiện đã đăng ký.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequestDto {

    @NotBlank(message = "Plate number is required")
    @Size(max = 20, message = "Plate number must not exceed 20 characters")
    private String plateNumber;

    @NotNull(message = "Vehicle type ID is required")
    private Long vehicleTypeId;

    @Size(max = 20, message = "Color must not exceed 20 characters")
    private String color;

    /** Chủ xe (tùy chọn). Nếu null → gắn cho người dùng đang đăng nhập. */
    private Long ownerUserId;
}
