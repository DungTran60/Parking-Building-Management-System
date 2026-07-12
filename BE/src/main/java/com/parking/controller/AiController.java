package com.parking.controller;

import com.parking.dto.AiOptimizeRequestDto;
import com.parking.dto.AiOptimizeResponseDto;
import com.parking.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/optimize")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AiOptimizeResponseDto> optimize(@Valid @RequestBody AiOptimizeRequestDto request) {
        return ResponseEntity.ok(aiService.optimize(request));
    }
}
