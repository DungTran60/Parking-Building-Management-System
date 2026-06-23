package com.parking.service;

import com.parking.dto.TicketGenerationRequest;
import com.parking.dto.TicketGenerationResponse;

public interface ParkingTicketService {

    TicketGenerationResponse generateTicket(
            TicketGenerationRequest request);
}