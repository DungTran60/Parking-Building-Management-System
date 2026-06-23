package com.parking.service;

import com.parking.dto.VehicleCheckInRequest;
import com.parking.dto.VehicleCheckInResponse;

public interface VehicleCheckInService {

    VehicleCheckInResponse checkIn(
            VehicleCheckInRequest request);
}