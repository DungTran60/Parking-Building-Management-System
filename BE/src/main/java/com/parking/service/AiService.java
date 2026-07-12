package com.parking.service;

import com.parking.dto.AiOptimizeRequestDto;
import com.parking.dto.AiOptimizeResponseDto;

public interface AiService {
    AiOptimizeResponseDto optimize(AiOptimizeRequestDto request);
}
