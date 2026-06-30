package com.parking.controller;

import com.parking.dto.CheckInRequestDto;
import com.parking.dto.ParkingSessionResponseDto;
import com.parking.service.ParkingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ParkingSessionController {

    private final ParkingSessionService parkingSessionService;

    @PostMapping("/checkin")
    public ResponseEntity<ParkingSessionResponseDto> checkIn(@RequestBody CheckInRequestDto request) {
        return ResponseEntity.ok(parkingSessionService.checkIn(request));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ParkingSessionResponseDto> checkOut(@RequestParam String query) {
        return ResponseEntity.ok(parkingSessionService.checkOut(query));
    }

    @GetMapping("/active")
    public ResponseEntity<ParkingSessionResponseDto> getActiveSession() {
        return ResponseEntity.ok(parkingSessionService.getActiveSession());
    }
}
