package com.parking.controller;

import com.parking.dto.VehicleCheckInRequest;
import com.parking.dto.VehicleCheckInResponse;
import com.parking.service.VehicleCheckInService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
public class VehicleCheckInController {

    private final VehicleCheckInService service;

    @PostMapping
    public VehicleCheckInResponse checkIn(
            @RequestBody VehicleCheckInRequest request) {

        return service.checkIn(request);
    }
}