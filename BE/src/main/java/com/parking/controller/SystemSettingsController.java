package com.parking.controller;

import com.parking.dto.SystemSettingsRequestDto;
import com.parking.dto.SystemSettingsResponseDto;
import com.parking.service.SystemSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    /**
     * Lấy cấu hình hệ thống hiện tại.
     * Quyền: ADMIN hoặc MANAGER
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('settings:manage', 'parkingInfo:view')")
    public ResponseEntity<SystemSettingsResponseDto> getSettings() {
        return ResponseEntity.ok(systemSettingsService.getSettings());
    }

    /**
     * Cập nhật cấu hình hệ thống.
     * Quyền: chỉ ADMIN
     */
    @PutMapping
    @PreAuthorize("hasAuthority('settings:manage')")
    public ResponseEntity<SystemSettingsResponseDto> updateSettings(
            @Valid @RequestBody SystemSettingsRequestDto request) {
        return ResponseEntity.ok(systemSettingsService.updateSettings(request));
    }
}
