package com.parking.service;

import com.parking.dto.ParkingSlotResponseDto;
import com.parking.dto.SlotStatusUpdateRequestDto;
import java.util.List;

public interface ParkingSlotService {
    List<ParkingSlotResponseDto> getAllSlots();
    List<ParkingSlotResponseDto> getAvailableSlots(String vehicleTypeId);
    ParkingSlotResponseDto updateSlotStatus(Long id, SlotStatusUpdateRequestDto request);
}
