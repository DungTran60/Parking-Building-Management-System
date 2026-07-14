package com.parking.service;

import com.parking.dto.SystemSettingsRequestDto;
import com.parking.dto.SystemSettingsResponseDto;

public interface SystemSettingsService {
    SystemSettingsResponseDto getSettings();
    SystemSettingsResponseDto updateSettings(SystemSettingsRequestDto request);
}
