package com.parking.service;

import com.parking.dto.TicketGenerationRequest;
import com.parking.dto.TicketGenerationResponse;
import com.parking.entity.*;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingTicketServiceImpl
        implements ParkingTicketService {

    private final ParkingTicketRepository ticketRepository;
    private final VehicleRepository vehicleRepository;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional
    public TicketGenerationResponse generateTicket(
            TicketGenerationRequest request) {

        // 1. Validate request
        if (request.getLicensePlate() == null || request.getLicensePlate().isBlank()) {
            throw new BadRequestException("Biển số xe không được để trống");
        }
        if (request.getParkingAreaId() == null) {
            throw new BadRequestException("Vui lòng chọn khu vực đỗ xe");
        }
        if (request.getVehicleType() == null || request.getVehicleType().isBlank()) {
            throw new BadRequestException("Loại xe không được để trống");
        }

        // 2. Find or create Vehicle
        Vehicle vehicle = vehicleRepository
                .findByLicensePlate(request.getLicensePlate());

        if (vehicle == null) {
            vehicle = new Vehicle();
            vehicle.setLicensePlate(request.getLicensePlate());
            vehicle.setVehicleType(request.getVehicleType());
            vehicle = vehicleRepository.save(vehicle);
        }

        // 3. Find ParkingArea
        ParkingArea area = parkingAreaRepository
                .findById(request.getParkingAreaId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy khu vực đỗ xe với ID: " + request.getParkingAreaId()));

        // 4. Check vehicle type is valid
        VehicleType vehicleType = vehicleTypeRepository
                .findById(request.getVehicleType().toLowerCase())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Loại xe không hợp lệ: " + request.getVehicleType()));

        // 5. Find available slot for this vehicle type
        List<ParkingSlot> availableSlots = parkingSlotRepository
                .findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, vehicleType.getId());

        if (availableSlots.isEmpty()) {
            throw new BadRequestException(
                    "Xin lỗi, hiện không còn chỗ trống nào cho loại xe " + vehicleType.getName());
        }

        ParkingSlot selectedSlot = availableSlots.get(0);
        selectedSlot.setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(selectedSlot);

        // 6. Generate ticket code
        String dateStr = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyMMdd-HHmmss"));
        String ticketCode = "PK-" + dateStr + "-"
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // 7. Create ParkingTicket
        ParkingTicket ticket = new ParkingTicket();
        ticket.setTicketCode(ticketCode);
        ticket.setVehicle(vehicle);
        ticket.setParkingArea(area);
        ticket.setSlot(selectedSlot);
        ticket.setEntryGate(request.getEntryGate());
        ticket.setCheckInTime(LocalDateTime.now());
        ticket.setStatus("ACTIVE");
        ticket.setFee(0.0);

        ticket = ticketRepository.save(ticket);

        // 8. Build response
        return TicketGenerationResponse.builder()
                .ticketId(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .licensePlate(vehicle.getLicensePlate())
                .vehicleType(vehicleType.getName())
                .parkingArea(area.getAreaName())
                .slotCode(selectedSlot.getCode())
                .entryGate(ticket.getEntryGate())
                .checkInTime(ticket.getCheckInTime())
                .status(ticket.getStatus())
                .fee(ticket.getFee())
                .build();
    }
}