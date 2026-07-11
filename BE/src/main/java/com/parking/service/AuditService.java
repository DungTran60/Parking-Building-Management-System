package com.parking.service;

import com.parking.dto.AuditLogResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditService {
    void log(String action, String resource, Long resourceId, Long actorId, String actorUsername);
    List<AuditLogResponseDto> getAuditLogs(String resource, Long resourceId);
    List<AuditLogResponseDto> getAllAuditLogs();
    Page<AuditLogResponseDto> getAuditLogsFiltered(String resource, String action, String actorUsername, Pageable pageable);
}
