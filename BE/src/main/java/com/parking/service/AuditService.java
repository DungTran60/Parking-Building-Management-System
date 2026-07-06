package com.parking.service;

import com.parking.entity.AuditLog;
import java.util.List;

public interface AuditService {
    void log(String action, String resource, Long resourceId, Long actorId, String actorUsername);
    List<AuditLog> getAuditLogs(String resource, Long resourceId);
}