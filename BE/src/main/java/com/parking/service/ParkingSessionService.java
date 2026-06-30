package com.parking.service;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.ParkingSessionResponseDto;

public interface ParkingSessionService {
    ParkingSessionResponseDto checkIn(CheckInRequestDto request);
    ParkingSessionResponseDto checkOut(String query);
    ParkingSessionResponseDto getActiveSession();
}
