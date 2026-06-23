package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParkingAreaRequest {

    @NotBlank(message = "Area code is required")
    private String areaCode;

    @NotBlank(message = "Area name is required")
    private String areaName;

    private String description;

    private String status;
}