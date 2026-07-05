package com.parking.controller;

import com.parking.dto.VehicleCheckInRequest;
import com.parking.dto.VehicleCheckInResponse;
import com.parking.service.VehicleCheckInService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing vehicle check-in operations.
 * Provides an endpoint for checking in vehicles to a parking slot.
 */
@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
public class VehicleCheckInController {

    private final VehicleCheckInService service;

    /**
     * Handles the check-in of a vehicle into a parking slot.
     *
     * @param request The VehicleCheckInRequest object containing vehicle and slot details.
     * @return A VehicleCheckInResponse object with the result of the check-in operation.
     */
    @PostMapping
    public VehicleCheckInResponse checkIn(
            @RequestBody VehicleCheckInRequest request) {

        return service.checkIn(request);
    }
}
