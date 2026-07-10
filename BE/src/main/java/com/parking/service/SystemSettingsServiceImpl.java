package com.parking.service;

import com.parking.dto.SystemSettingsRequestDto;
import com.parking.dto.SystemSettingsResponseDto;
import com.parking.entity.SystemSettings;
import com.parking.exception.BadRequestException;
import com.parking.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemSettingsServiceImpl implements SystemSettingsService {

    private static final Long SINGLETON_ID = 1L;

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

        SystemSettings settings = systemSettingsRepository.findById(SINGLETON_ID)
                .orElse(SystemSettings.builder().id(SINGLETON_ID).build());

        settings.setSystemName(request.getSystemName());
        settings.setPasswordPolicy(request.getPasswordPolicy());
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
