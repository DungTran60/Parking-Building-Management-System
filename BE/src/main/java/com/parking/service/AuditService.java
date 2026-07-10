package com.parking.service;

import com.parking.dto.AuditLogResponseDto;
import java.util.List;

public interface AuditService {
    void log(String action, String resource, Long resourceId, Long actorId, String actorUsername);
    List<AuditLogResponseDto> getAuditLogs(String resource, Long resourceId);
}