package com.parking.service;

import com.parking.dto.OvernightFeeResponseDto;
import com.parking.entity.Pricing;
import com.parking.entity.PricingTimeUnit;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.PricingRepository;
import com.parking.repository.VehicleTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PricingServiceImplTest {

    @Mock
    private PricingRepository pricingRepository;

    @Mock
    private VehicleTypeRepository vehicleTypeRepository;

    @Mock
    private FeeCalculationService feeCalculationService;

    @InjectMocks
    private PricingServiceImpl pricingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCalculateOvernightFee_VehicleTypeNotFound() {
        String vehicleTypeId = "invalid-car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 1, 20, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 2, 8, 0);

        when(vehicleTypeRepository.existsById(vehicleTypeId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> {
            pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);
        });
    }

    @Test
    void testCalculateOvernightFee_InvalidCheckOutTime() {
        String vehicleTypeId = "car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 2, 8, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 1, 20, 0); // before checkIn

        when(vehicleTypeRepository.existsById(vehicleTypeId)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);
        });
    }

    @Test
    void testCalculateOvernightFee_SameDayStay_0Nights() {
        String vehicleTypeId = "car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 1, 8, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 1, 18, 0); // same day

        when(vehicleTypeRepository.existsById(vehicleTypeId)).thenReturn(true);

        Pricing pricing = Pricing.builder()
                .overnightFee(BigDecimal.valueOf(20000))
                .active(true)
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(vehicleTypeId, PricingTimeUnit.HOURLY))
                .thenReturn(Optional.of(pricing));

        // Mock base fee calculation (e.g. 10 hours stay * hourly rate)
        when(feeCalculationService.calculateFee(vehicleTypeId, checkIn, checkOut))
                .thenReturn(BigDecimal.valueOf(30000));

        OvernightFeeResponseDto result = pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(30000), result.getBasePrice());
        assertEquals(BigDecimal.valueOf(20000), result.getOvernightFee());
        assertEquals(0, result.getNumberOfNights());
        assertEquals(BigDecimal.valueOf(30000), result.getTotal()); // 30000 + 0 * 20000
    }

    @Test
    void testCalculateOvernightFee_1NightStay() {
        String vehicleTypeId = "car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 1, 20, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 2, 8, 0); // 1 night

        when(vehicleTypeRepository.existsById(vehicleTypeId)).thenReturn(true);

        Pricing pricing = Pricing.builder()
                .overnightFee(BigDecimal.valueOf(20000))
                .active(true)
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(vehicleTypeId, PricingTimeUnit.HOURLY))
                .thenReturn(Optional.of(pricing));

        when(feeCalculationService.calculateFee(vehicleTypeId, checkIn, checkOut))
                .thenReturn(BigDecimal.valueOf(30000));

        OvernightFeeResponseDto result = pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(30000), result.getBasePrice());
        assertEquals(BigDecimal.valueOf(20000), result.getOvernightFee());
        assertEquals(1, result.getNumberOfNights());
        assertEquals(BigDecimal.valueOf(50000), result.getTotal()); // 30000 + 1 * 20000
    }

    @Test
    void testCalculateOvernightFee_2NightsStay() {
        String vehicleTypeId = "car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 1, 18, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 3, 9, 0); // 2 nights

        when(vehicleTypeRepository.existsById(vehicleTypeId)).thenReturn(true);

        Pricing pricing = Pricing.builder()
                .overnightFee(BigDecimal.valueOf(20000))
                .active(true)
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(vehicleTypeId, PricingTimeUnit.HOURLY))
                .thenReturn(Optional.of(pricing));

        when(feeCalculationService.calculateFee(vehicleTypeId, checkIn, checkOut))
                .thenReturn(BigDecimal.valueOf(30000));

        OvernightFeeResponseDto result = pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(30000), result.getBasePrice());
        assertEquals(BigDecimal.valueOf(20000), result.getOvernightFee());
        assertEquals(2, result.getNumberOfNights());
        assertEquals(BigDecimal.valueOf(70000), result.getTotal()); // 30000 + 2 * 20000
    }
}
