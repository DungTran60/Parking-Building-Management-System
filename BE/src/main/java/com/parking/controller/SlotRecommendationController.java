package com.parking.controller;

import com.parking.dto.SlotRecommendationResponseDto;
import com.parking.service.SlotRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Gợi ý phân bổ slot (hỗ trợ tối ưu chỗ đỗ).
 * GET /api/slots/recommendation?vehicleTypeId=...
 * (Path cụ thể hơn /api/slots/{id} nên Spring ưu tiên khớp endpoint này.)
 */
@RestController
@RequestMapping("/api/slots/recommendation")
@RequiredArgsConstructor
public class SlotRecommendationController {

    private final SlotRecommendationService slotRecommendationService;

    @GetMapping
    @PreAuthorize("hasAuthority('ai:view')")
    public ResponseEntity<SlotRecommendationResponseDto> recommend(
            @RequestParam Long vehicleTypeId) {
        return ResponseEntity.ok(slotRecommendationService.recommend(vehicleTypeId));
    }
}
