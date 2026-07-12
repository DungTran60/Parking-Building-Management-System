package com.parking.controller;

import com.parking.dto.PublicStatsDto;
import com.parking.service.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/stats")
    public ResponseEntity<PublicStatsDto> getStats() {
        return ResponseEntity.ok(publicService.getStats());
    }
}
