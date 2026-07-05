package com.parking.service;

import com.parking.dto.OvernightFeeResponseDto;
import com.parking.dto.PricingRequestDto;
import com.parking.dto.PricingResponseDto;
import com.parking.entity.Pricing;
import com.parking.entity.PricingTimeUnit;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.PricingRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private final PricingRepository pricingRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final FeeCalculationService feeCalculationService;

    /* ─────────────────────────────────────────────────────
       Tạo bảng giá mới
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public PricingResponseDto createPricing(PricingRequestDto dto) {
        VehicleType vehicleType = findVehicleTypeOrThrow(dto.getVehicleTypeId());

        // Mỗi cặp (vehicleType, timeUnit) phải là duy nhất
        if (pricingRepository.existsByVehicleTypeIdAndTimeUnit(dto.getVehicleTypeId(), dto.getTimeUnit())) {
            throw new IllegalArgumentException(
                    "Pricing already exists for vehicle type '" + dto.getVehicleTypeId()
                    + "' with time unit '" + dto.getTimeUnit() + "'");
        }

        Pricing pricing = Pricing.builder()
                .vehicleType(vehicleType)
                .timeUnit(dto.getTimeUnit())
                .price(dto.getPrice())
                .overnightFee(dto.getOvernightFee() != null ? dto.getOvernightFee() : BigDecimal.ZERO)
                .description(dto.getDescription())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return mapToResponse(pricingRepository.save(pricing));
    }

    /* ─────────────────────────────────────────────────────
       Lấy theo ID
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public PricingResponseDto getPricingById(Long id) {
        return mapToResponse(findOrThrow(id));
    }

    /* ─────────────────────────────────────────────────────
       Lấy tất cả
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<PricingResponseDto> getAllPricings() {
        return pricingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Lấy bảng giá đang áp dụng
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<PricingResponseDto> getActivePricings() {
        return pricingRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Lấy theo loại phương tiện
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<PricingResponseDto> getPricingsByVehicleType(String vehicleTypeId) {
        findVehicleTypeOrThrow(vehicleTypeId);
        return pricingRepository.findByVehicleTypeId(vehicleTypeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Lấy bảng giá đang áp dụng theo loại phương tiện
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<PricingResponseDto> getActivePricingsByVehicleType(String vehicleTypeId) {
        findVehicleTypeOrThrow(vehicleTypeId);
        return pricingRepository.findByVehicleTypeIdAndActiveTrue(vehicleTypeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Cập nhật bảng giá
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public PricingResponseDto updatePricing(Long id, PricingRequestDto dto) {
        Pricing pricing = findOrThrow(id);
        VehicleType vehicleType = findVehicleTypeOrThrow(dto.getVehicleTypeId());

        // Kiểm tra trùng lặp với bản ghi KHÁC (loại trừ chính bản ghi đang sửa)
        if (pricingRepository.existsByVehicleTypeIdAndTimeUnitAndIdNot(
                dto.getVehicleTypeId(), dto.getTimeUnit(), id)) {
            throw new IllegalArgumentException(
                    "Pricing already exists for vehicle type '" + dto.getVehicleTypeId()
                    + "' with time unit '" + dto.getTimeUnit() + "'");
        }

        pricing.setVehicleType(vehicleType);
        pricing.setTimeUnit(dto.getTimeUnit());
        pricing.setPrice(dto.getPrice());
        pricing.setOvernightFee(dto.getOvernightFee() != null ? dto.getOvernightFee() : BigDecimal.ZERO);
        pricing.setDescription(dto.getDescription());
        if (dto.getActive() != null) {
            pricing.setActive(dto.getActive());
        }

        return mapToResponse(pricingRepository.save(pricing));
    }

    /* ─────────────────────────────────────────────────────
       Xóa bảng giá
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public void deletePricing(Long id) {
        if (!pricingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pricing not found with ID: " + id);
        }
        pricingRepository.deleteById(id);
    }

    /* ─────────────────────────────────────────────────────
       Kích hoạt / vô hiệu hóa
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public PricingResponseDto togglePricingStatus(Long id) {
        Pricing pricing = findOrThrow(id);
        pricing.setActive(!pricing.getActive());
        return mapToResponse(pricingRepository.save(pricing));
    }

    /* ─────────────────────────────────────────────────────
       Tính phí đỗ xe qua đêm
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public OvernightFeeResponseDto calculateOvernightFee(
            java.time.LocalDateTime checkIn,
            java.time.LocalDateTime checkOut,
            String vehicleTypeId) {

        // 1. Validation
        if (checkIn == null) {
            throw new IllegalArgumentException("Check-in time is required");
        }
        if (checkOut == null) {
            throw new IllegalArgumentException("Check-out time is required");
        }
        if (vehicleTypeId == null || vehicleTypeId.trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle type is required");
        }

        // Validate vehicleType must exist
        if (!vehicleTypeRepository.existsById(vehicleTypeId)) {
            throw new ResourceNotFoundException("Vehicle type not found: " + vehicleTypeId);
        }

        // Validate checkOut > checkIn
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new IllegalArgumentException("Check-out time must be after check-in time");
        }

        // 2. Resolve Pricing and Overnight Fee
        BigDecimal overnightFeeVal = BigDecimal.ZERO;
        Optional<Pricing> pricingOpt = pricingRepository.findByVehicleTypeIdAndTimeUnit(vehicleTypeId, PricingTimeUnit.HOURLY);
        if (pricingOpt.isPresent() && Boolean.TRUE.equals(pricingOpt.get().getActive())) {
            overnightFeeVal = pricingOpt.get().getOvernightFee();
            if (overnightFeeVal == null) {
                overnightFeeVal = BigDecimal.ZERO;
            }
        }

        // Validate overnightFee >= 0
        if (overnightFeeVal.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Overnight fee cannot be negative");
        }

        // 3. Calculate Base Parking Fee
        BigDecimal basePrice = feeCalculationService.calculateFee(vehicleTypeId, checkIn, checkOut);

        // 4. Calculate Overnight Fee and Number of Nights
        long numberOfNights = 0;
        java.time.LocalDate checkInDate = checkIn.toLocalDate();
        java.time.LocalDate checkOutDate = checkOut.toLocalDate();
        if (!checkInDate.equals(checkOutDate)) {
            numberOfNights = java.time.temporal.ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        }

        BigDecimal totalOvernightFee = overnightFeeVal.multiply(BigDecimal.valueOf(numberOfNights));
        BigDecimal total = basePrice.add(totalOvernightFee);

        return OvernightFeeResponseDto.builder()
                .basePrice(basePrice)
                .overnightFee(overnightFeeVal)
                .numberOfNights((int) numberOfNights)
                .total(total)
                .build();
    }

    /* ─────────────────────────────────────────────────────
       Helper methods
    ───────────────────────────────────────────────────── */
    private Pricing findOrThrow(Long id) {
        return pricingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing not found with ID: " + id));
    }

    private VehicleType findVehicleTypeOrThrow(String vehicleTypeId) {
        return vehicleTypeRepository.findById(vehicleTypeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle type not found: " + vehicleTypeId));
    }

    private PricingResponseDto mapToResponse(Pricing p) {
        return PricingResponseDto.builder()
                .id(p.getId())
                .vehicleTypeId(p.getVehicleType().getId())
                .vehicleTypeName(p.getVehicleType().getName())
                .timeUnit(p.getTimeUnit())
                .price(p.getPrice())
                .overnightFee(p.getOvernightFee() != null ? p.getOvernightFee() : BigDecimal.ZERO)
                .description(p.getDescription())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
