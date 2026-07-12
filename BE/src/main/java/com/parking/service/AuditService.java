package com.parking.service;

import com.parking.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditService {
    void log(String action, String resource, Long resourceId, Long actorId, String actorUsername);
    void log(String action, String resource, Long resourceId, Long actorId, String actorUsername, String ipAddress, String userAgent);
    List<AuditLog> getAuditLogs(String resource, Long resourceId);
    Page<AuditLog> findPaginated(String action, String actorUsername, LocalDateTime from, LocalDateTime to, Pageable pageable);
}