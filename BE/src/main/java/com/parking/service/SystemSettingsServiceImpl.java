package com.parking.service;

import com.parking.dto.SystemSettingsRequestDto;
import com.parking.dto.SystemSettingsResponseDto;
import com.parking.entity.SystemSettings;
import com.parking.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemSettingsServiceImpl implements SystemSettingsService {

    private static final Long SINGLETON_ID = 1L;
    private static final List<String> VALID_POLICIES = List.of("low", "medium", "high");

    private final SystemSettingsRepository systemSettingsRepository;

    @Override
    public SystemSettingsResponseDto getSettings() {
        SystemSettings settings = systemSettingsRepository.findById(SINGLETON_ID)
                .orElseThrow(() -> new RuntimeException("System settings not initialized"));
        return toDto(settings);
    }

    @Override
    @Transactional
    public SystemSettingsResponseDto updateSettings(SystemSettingsRequestDto request) {
        if (request.getPasswordPolicy() != null
                && !VALID_POLICIES.contains(request.getPasswordPolicy().toLowerCase())) {
            throw new IllegalArgumentException("Chính sách mật khẩu không hợp lệ. Chấp nhận: low, medium, high.");
        }
        if (request.getSessionTimeout() != null
                && (request.getSessionTimeout() < 5 || request.getSessionTimeout() > 480)) {
            throw new IllegalArgumentException("Thời gian timeout phải từ 5 đến 480 phút.");
        }

        SystemSettings settings = systemSettingsRepository.findById(SINGLETON_ID)
                .orElse(SystemSettings.builder().id(SINGLETON_ID).build());

        settings.setSystemName(request.getSystemName());
        settings.setPasswordPolicy(request.getPasswordPolicy() != null ? request.getPasswordPolicy().toLowerCase() : null);
        settings.setSessionTimeout(request.getSessionTimeout());
        settings.setLogoUrl(request.getLogoUrl());
        settings.setVersion(request.getVersion());
        settings.setThemeColor(request.getThemeColor());
        settings.setTimezone(request.getTimezone());
        settings.setDateFormat(request.getDateFormat());

        SystemSettings saved = systemSettingsRepository.save(settings);
        return toDto(saved);
    }

    private SystemSettingsResponseDto toDto(SystemSettings s) {
        return SystemSettingsResponseDto.builder()
                .systemName(s.getSystemName())
                .passwordPolicy(s.getPasswordPolicy())
                .sessionTimeout(s.getSessionTimeout())
                .logoUrl(s.getLogoUrl())
                .version(s.getVersion())
                .themeColor(s.getThemeColor())
                .timezone(s.getTimezone())
                .dateFormat(s.getDateFormat())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
