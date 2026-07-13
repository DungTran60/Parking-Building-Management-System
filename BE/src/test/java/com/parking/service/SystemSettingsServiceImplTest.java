package com.parking.service;

import com.parking.dto.SystemSettingsRequestDto;
import com.parking.dto.SystemSettingsResponseDto;
import com.parking.entity.SystemSettings;
import com.parking.repository.SystemSettingsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SystemSettingsServiceImplTest {

    @Mock
    private SystemSettingsRepository systemSettingsRepository;

    @InjectMocks
    private SystemSettingsServiceImpl systemSettingsService;

    @Test
    void updateSettingsShouldNormalizePasswordPolicyAndPersistTimeout() {
        SystemSettings existing = SystemSettings.builder()
                .id(1L)
                .systemName("Parking")
                .passwordPolicy("medium")
                .sessionTimeout(30)
                .build();
        when(systemSettingsRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(systemSettingsRepository.save(any(SystemSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SystemSettingsRequestDto request = SystemSettingsRequestDto.builder()
                .systemName("Parking")
                .passwordPolicy("HIGH")
                .sessionTimeout(60)
                .build();

        SystemSettingsResponseDto response = systemSettingsService.updateSettings(request);

        assertEquals("high", response.getPasswordPolicy());
        assertEquals(60, response.getSessionTimeout());
    }

    @Test
    void updateSettingsShouldRejectOutOfRangeSessionTimeout() {
        SystemSettings existing = SystemSettings.builder()
                .id(1L)
                .systemName("Parking")
                .passwordPolicy("medium")
                .sessionTimeout(30)
                .build();
        SystemSettingsRequestDto request = SystemSettingsRequestDto.builder()
                .systemName("Parking")
                .passwordPolicy("medium")
                .sessionTimeout(4)
                .build();

        assertThrows(IllegalArgumentException.class, () -> systemSettingsService.updateSettings(request));
        verify(systemSettingsRepository, never()).save(any(SystemSettings.class));
    }
}
