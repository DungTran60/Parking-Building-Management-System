package com.parking.service;

import com.parking.dto.FeeCalculationResponseDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.Pricing;
import com.parking.entity.PricingTimeUnit;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.PricingRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FeeCalculationServiceImpl implements FeeCalculationService {

    private static final BigDecimal DEFAULT_HOURLY_RATE = BigDecimal.valueOf(5000);
    private static final double    MIN_HOURS            = 1.0;

    private final ParkingSessionRepository parkingSessionRepository;
    private final PricingRepository        pricingRepository;
    private final VehicleTypeRepository    vehicleTypeRepository;

    /* ─────────────────────────────────────────────────────
       Preview phí tạm tính cho session đang ACTIVE
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public FeeCalculationResponseDto previewFee(String query) {
        // Tìm session ACTIVE theo ticketCode hoặc plateNumber
        ParkingSession session = parkingSessionRepository
                .findByTicketCodeAndStatus(query, "ACTIVE")
                .or(() -> parkingSessionRepository.findByPlateNumberAndStatus(query, "ACTIVE"))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lượt gửi xe đang hoạt động với mã: " + query));

        LocalDateTime now = LocalDateTime.now();
        VehicleType vehicleType = session.getVehicleType();

        // Lấy đơn giá theo giờ
        RateResult rate = resolveHourlyRate(vehicleType.getId(), vehicleType);

        // Tính số giờ
        double hours = computeHours(session.getCheckInAt(), now);

        // Tổng phí
        BigDecimal totalFee = rate.hourlyRate
                .multiply(BigDecimal.valueOf(hours))
                .setScale(0, RoundingMode.HALF_UP);

        return FeeCalculationResponseDto.builder()
                .ticketCode(session.getTicketCode())
                .plateNumber(session.getPlateNumber())
                .vehicleTypeId(vehicleType.getId())
                .vehicleTypeName(vehicleType.getName())
                .checkInAt(session.getCheckInAt())
                .calculatedAt(now)
                .hours(hours)
                .hourlyRate(rate.hourlyRate)
                .totalFee(totalFee)
                .rateSource(rate.source)
                .build();
    }

    /* ─────────────────────────────────────────────────────
       Tính phí thực tế — dùng nội bộ khi checkout
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateFee(String vehicleTypeRef,
                                   LocalDateTime checkInAt,
                                   LocalDateTime checkOutAt) {
        VehicleType vehicleType = resolveVehicleType(vehicleTypeRef);
        RateResult rate = resolveHourlyRate(vehicleType.getId(), vehicleType);
        double hours = computeHours(checkInAt, checkOutAt);

        return rate.hourlyRate
                .multiply(BigDecimal.valueOf(hours))
                .setScale(0, RoundingMode.HALF_UP);
    }

    /* ─────────────────────────────────────────────────────
       Helpers
    ───────────────────────────────────────────────────── */

    /**
     * Lấy đơn giá theo giờ.
     * Ưu tiên: bảng Pricing (HOURLY, active=true) → hourlyRate của VehicleType → mặc định 5.000 VND
     */
    private RateResult resolveHourlyRate(Long vehicleTypeId, VehicleType vehicleType) {
        // 1. Bảng Pricing
        Optional<Pricing> pricingOpt = pricingRepository
                .findByVehicleTypeIdAndTimeUnit(vehicleTypeId, PricingTimeUnit.HOURLY);

        if (pricingOpt.isPresent() && Boolean.TRUE.equals(pricingOpt.get().getActive())) {
            return new RateResult(pricingOpt.get().getPrice(), "PRICING_TABLE");
        }

        // 2. hourlyRate trên VehicleType
        if (vehicleType.getHourlyRate() != null && vehicleType.getHourlyRate() > 0) {
            return new RateResult(
                    BigDecimal.valueOf(vehicleType.getHourlyRate()),
                    "VEHICLE_TYPE_DEFAULT");
        }

        // 3. Fallback cứng
        return new RateResult(DEFAULT_HOURLY_RATE, "SYSTEM_DEFAULT");
    }

    /**
     * Resolve VehicleType từ string reference (ID số hoặc code).
     * Fallback về Nếu là code (ví dụ "car", "CAR").
     */
    private VehicleType resolveVehicleType(String vehicleTypeRef) {
        try {
            Long numericId = Long.parseLong(vehicleTypeRef.trim());
            return vehicleTypeRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle type not found: " + numericId));
        } catch (NumberFormatException e) {
            return vehicleTypeRepository.findByCode(vehicleTypeRef.trim().toUpperCase())
                    .or(() -> vehicleTypeRepository.findByCode(vehicleTypeRef.trim()))
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle type not found: " + vehicleTypeRef));
        }
    }

    /**
     * Tính số giờ gửi xe, làm tròn lên, tối thiểu 1 giờ.
     */
    private double computeHours(LocalDateTime from, LocalDateTime to) {
        long seconds = Duration.between(from, to).getSeconds();
        return Math.max(MIN_HOURS, Math.ceil(seconds / 3600.0));
    }

    /** Value object nội bộ chứa đơn giá và nguồn */
    private record RateResult(BigDecimal hourlyRate, String source) {}
}
