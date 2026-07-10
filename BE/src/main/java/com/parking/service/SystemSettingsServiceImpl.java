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
        // Validate: openingTime và closingTime không được giống nhau
        if (request.getOpeningTime().equals(request.getClosingTime())) {
            throw new BadRequestException("Opening time and closing time must not be the same");
        }

        SystemSettings settings = systemSettingsRepository.findById(SINGLETON_ID)
                .orElse(SystemSettings.builder().id(SINGLETON_ID).build());

        settings.setSystemName(request.getSystemName());
        settings.setOpeningTime(request.getOpeningTime());
        settings.setClosingTime(request.getClosingTime());
        settings.setPaymentMode(request.getPaymentMode());
        settings.setAutoBlockOverdueSlots(request.getAutoBlockOverdueSlots());
        settings.setDefaultHourlyRate(request.getDefaultHourlyRate());

        SystemSettings saved = systemSettingsRepository.save(settings);
        return toDto(saved);
    }

    private SystemSettingsResponseDto toDto(SystemSettings s) {
        return SystemSettingsResponseDto.builder()
                .systemName(s.getSystemName())
                .openingTime(s.getOpeningTime())
                .closingTime(s.getClosingTime())
                .paymentMode(s.getPaymentMode())
                .autoBlockOverdueSlots(s.isAutoBlockOverdueSlots())
                .defaultHourlyRate(s.getDefaultHourlyRate())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
