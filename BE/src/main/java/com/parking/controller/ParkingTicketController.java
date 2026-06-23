package com.parking.controller;

import com.parking.dto.TicketGenerationRequest;
import com.parking.dto.TicketGenerationResponse;
import com.parking.service.ParkingTicketService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class ParkingTicketController {

    private final ParkingTicketService parkingTicketService;

    @PostMapping("/generate")
    public TicketGenerationResponse generateTicket(
            @RequestBody TicketGenerationRequest request) {

        return parkingTicketService
                .generateTicket(request);
    }
}