package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Data Transfer Object (DTO) for requests to create or update a parking area.
 * Includes validation rules for the parking area's properties.
 */
@Data
public class ParkingAreaRequest {

    /**
     * The unique code for the parking area.
     * Must not be blank and its size must not exceed 50 characters.
     */
    @NotBlank(message = "Area code is required")
    @Size(max = 50, message = "Area code must not exceed 50 characters")
    private String areaCode;

    /**
     * The name of the parking area.
     * Must not be blank and its size must not exceed 50 characters.
     */
    @NotBlank(message = "Area name is required")
    @Size(max = 50, message = "Area name must not exceed 50 characters")
    private String areaName;

    /**
     * A description for the parking area.
     * Its size must not exceed 255 characters.
     */
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    /**
     * The current status of the parking area.
     * Must not be blank and must be one of 'AVAILABLE', 'FULL', or 'CLOSED'.
     */
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "AVAILABLE|FULL|CLOSED", message = "Status must be 'AVAILABLE', 'FULL', or 'CLOSED'")
    private String status;
}
