package com.parking.service;

import com.parking.dto.SlotRecommendationResponseDto;
import com.parking.entity.Floor;
import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotRecommendation;
import com.parking.entity.SlotStatus;
import com.parking.entity.VehicleType;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.SlotRecommendationRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Gợi ý phân bổ slot bằng heuristic "tầng thấp trước, mã slot nhỏ trước"
 * (giảm thời gian tìm chỗ — RQ2/RQ3). Đây là heuristic, KHÔNG phải mô hình ML.
 */
@Service
@RequiredArgsConstructor
public class SlotRecommendationServiceImpl implements SlotRecommendationService {

    private static final String STRATEGY = "LOWEST_FLOOR_FIRST";

    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final SlotRecommendationRepository slotRecommendationRepository;

    @Override
    @Transactional
    public SlotRecommendationResponseDto recommend(Long vehicleTypeId) {
        VehicleType vehicleType = vehicleTypeRepository.findById(vehicleTypeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy loại xe với ID: " + vehicleTypeId));

        List<ParkingSlot> availableSlots =
                parkingSlotRepository.findByStatusAndVehicleTypeId(SlotStatus.AVAILABLE, vehicleTypeId);

        // Heuristic: ưu tiên tầng thấp nhất (floor id nhỏ), sau đó mã slot nhỏ nhất.
        Optional<ParkingSlot> best = availableSlots.stream()
                .sorted(Comparator
                        .comparing((ParkingSlot s) -> s.getFloor().getId())
                        .thenComparing(ParkingSlot::getCode))
                .findFirst();

        // Điểm ưu tiên: càng nhiều slot trống cùng loại thì độ tin cậy càng cao.
        double score = availableSlots.size();

        // Ghi nhật ký gợi ý (kể cả khi không còn slot trống).
        SlotRecommendation log = SlotRecommendation.builder()
                .vehicleType(vehicleType)
                .recommendedSlot(best.orElse(null))
                .score(score)
                .strategy(STRATEGY)
                .build();
        slotRecommendationRepository.save(log);

        if (best.isEmpty()) {
            return SlotRecommendationResponseDto.builder()
                    .vehicleTypeId(vehicleType.getId())
                    .vehicleTypeName(vehicleType.getName())
                    .score(score)
                    .strategy(STRATEGY)
                    .available(false)
                    .message("Không còn slot trống phù hợp cho loại xe này.")
                    .build();
        }

        ParkingSlot slot = best.get();
        Floor floor = slot.getFloor();
        return SlotRecommendationResponseDto.builder()
                .vehicleTypeId(vehicleType.getId())
                .vehicleTypeName(vehicleType.getName())
                .recommendedSlotId(slot.getId())
                .recommendedSlotCode(slot.getCode())
                .floorId(floor.getId())
                .floorName(floor.getName())
                .score(score)
                .strategy(STRATEGY)
                .available(true)
                .message("Gợi ý slot " + slot.getCode() + " tại tầng " + floor.getName())
                .build();
    }
}
