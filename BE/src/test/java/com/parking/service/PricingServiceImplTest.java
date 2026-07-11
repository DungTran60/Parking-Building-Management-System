package com.parking.service;

import com.parking.dto.LostTicketFeeResponseDto;
import com.parking.dto.OvernightFeeResponseDto;
import com.parking.dto.PricingRequestDto;
import com.parking.entity.Pricing;
import com.parking.entity.PricingTimeUnit;
import com.parking.entity.VehicleType;
import com.parking.entity.VehicleTypeStatus;
import com.parking.exception.ResourceConflictException;
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

    private VehicleType mockCar;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockCar = VehicleType.builder()
                .id(1L)
                .code("CAR")
                .name("Ô tô")
                .status(VehicleTypeStatus.ACTIVE)
                .build();
    }

    @Test
    void testCalculateOvernightFee_VehicleTypeNotFound() {
        String vehicleTypeId = "invalid-car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 1, 20, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 2, 8, 0);

        when(vehicleTypeRepository.findByCode("INVALID-CAR")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);
        });
    }

    @Test
    void testCalculateOvernightFee_InvalidCheckOutTime() {
        String vehicleTypeId = "car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 2, 8, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 1, 20, 0); // before checkIn

        when(vehicleTypeRepository.findByCode("CAR")).thenReturn(Optional.of(mockCar));

        assertThrows(IllegalArgumentException.class, () -> {
            pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);
        });
    }

    @Test
    void testCalculateOvernightFee_SameDayStay_0Nights() {
        String vehicleTypeId = "car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 1, 8, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 1, 18, 0); // same day

        when(vehicleTypeRepository.findByCode("CAR")).thenReturn(Optional.of(mockCar));

        Pricing pricing = Pricing.builder()
                .overnightFee(BigDecimal.valueOf(20000))
                .active(true)
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(1L, PricingTimeUnit.HOURLY))
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

        when(vehicleTypeRepository.findByCode("CAR")).thenReturn(Optional.of(mockCar));

        Pricing pricing = Pricing.builder()
                .overnightFee(BigDecimal.valueOf(20000))
                .active(true)
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(1L, PricingTimeUnit.HOURLY))
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

        when(vehicleTypeRepository.findByCode("CAR")).thenReturn(Optional.of(mockCar));

        Pricing pricing = Pricing.builder()
                .overnightFee(BigDecimal.valueOf(20000))
                .active(true)
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(1L, PricingTimeUnit.HOURLY))
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

    @Test
    void testCalculateLostTicketFee_VehicleTypeNotFound() {
        String vehicleTypeId = "invalid-car";
        when(vehicleTypeRepository.findByCode("INVALID-CAR")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            pricingService.calculateLostTicketFee(vehicleTypeId);
        });
    }

    @Test
    void testCalculateLostTicketFee_Success() {
        String vehicleTypeId = "car";
        when(vehicleTypeRepository.findByCode("CAR")).thenReturn(Optional.of(mockCar));

        Pricing pricing = Pricing.builder()
                .lostTicketFee(BigDecimal.valueOf(100000))
                .active(true)
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(1L, PricingTimeUnit.HOURLY))
                .thenReturn(Optional.of(pricing));

        LostTicketFeeResponseDto result = pricingService.calculateLostTicketFee(vehicleTypeId);

        assertNotNull(result);
        assertEquals(mockCar.getCode(), result.getVehicleType());
        assertEquals(BigDecimal.valueOf(100000), result.getLostTicketFee());
        assertEquals(BigDecimal.valueOf(100000), result.getTotal());
    }

    @Test
    void testCreatePricing_ThrowsConflictOnDuplicate() {
        PricingRequestDto dto = PricingRequestDto.builder()
                .vehicleTypeId("1")
                .timeUnit(PricingTimeUnit.HOURLY)
                .price(BigDecimal.TEN)
                .build();

        when(vehicleTypeRepository.findById(1L)).thenReturn(Optional.of(mockCar));
        when(pricingRepository.existsByVehicleTypeIdAndTimeUnit(1L, PricingTimeUnit.HOURLY)).thenReturn(true);

        assertThrows(ResourceConflictException.class, () -> {
            pricingService.createPricing(dto);
        });
    }

    @Test
    void testCreatePricing_AllowsOnlyHourlyPolicy() {
        PricingRequestDto dto = PricingRequestDto.builder()
                .vehicleTypeId("1")
                .timeUnit(PricingTimeUnit.DAILY) // Not allowed
                .price(BigDecimal.TEN)
                .build();

        assertThrows(IllegalArgumentException.class, () -> {
            pricingService.createPricing(dto);
        }, "Only HOURLY pricing policies are supported at the moment.");
    }

    @Test
    void testCreatePricing_ThrowsOnNegativePrice() {
        PricingRequestDto dto = PricingRequestDto.builder()
                .vehicleTypeId("1")
                .timeUnit(PricingTimeUnit.HOURLY)
                .price(BigDecimal.valueOf(-100)) // Negative price
                .build();

        assertThrows(IllegalArgumentException.class, () -> {
            pricingService.createPricing(dto);
        }, "Price and fees cannot be negative.");
    }

    @Test
    void testCreatePricing_AllowsZeroPrice() {
        PricingRequestDto dto = PricingRequestDto.builder()
                .vehicleTypeId("1")
                .timeUnit(PricingTimeUnit.HOURLY)
                .price(BigDecimal.ZERO) // Zero price
                .active(true)
                .build();
        
        when(vehicleTypeRepository.findById(1L)).thenReturn(Optional.of(mockCar));
        when(pricingRepository.existsByVehicleTypeIdAndTimeUnit(1L, PricingTimeUnit.HOURLY)).thenReturn(false);
        // Mock the save operation
        when(pricingRepository.save(any(Pricing.class))).thenAnswer(invocation -> invocation.getArgument(0));


        assertDoesNotThrow(() -> {
            pricingService.createPricing(dto);
        });
        
        verify(pricingRepository, times(1)).save(argThat(p -> p.getPrice().compareTo(BigDecimal.ZERO) == 0));
    }

    @Test
    void testCalculateOvernightFee_InactivePolicy() {
        String vehicleTypeId = "car";
        LocalDateTime checkIn = LocalDateTime.of(2026, 7, 1, 20, 0);
        LocalDateTime checkOut = LocalDateTime.of(2026, 7, 2, 8, 0); // 1 night

        when(vehicleTypeRepository.findByCode("CAR")).thenReturn(Optional.of(mockCar));

        // Mock an inactive pricing policy
        Pricing inactivePricing = Pricing.builder()
                .overnightFee(BigDecimal.valueOf(20000))
                .active(false) // Inactive
                .build();
        when(pricingRepository.findByVehicleTypeIdAndTimeUnit(1L, PricingTimeUnit.HOURLY))
                .thenReturn(Optional.of(inactivePricing));

        when(feeCalculationService.calculateFee(vehicleTypeId, checkIn, checkOut))
                .thenReturn(BigDecimal.valueOf(30000));
        
        OvernightFeeResponseDto result = pricingService.calculateOvernightFee(checkIn, checkOut, vehicleTypeId);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(30000), result.getBasePrice());
        assertEquals(BigDecimal.ZERO, result.getOvernightFee()); // Should be 0 as policy is inactive
        assertEquals(1, result.getNumberOfNights());
        assertEquals(BigDecimal.valueOf(30000), result.getTotal()); // 30000 + 1 * 0
    }
}
