package com.parking.service;

import com.parking.entity.AuditLog;
import com.parking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditRetentionService {

    private final AuditLogRepository auditLogRepository;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredAuditLogs() {
        cleanupByAge("LOGIN", 1);
        cleanupByAge("LOGIN_FAILED", 7);
        cleanupByAge("LOGOUT", 30);
        cleanupByAge("CHECK_IN", 30);
        cleanupByAge("CHECK_OUT", 30);
        cleanupByAge("USER_CREATED", 30);
        cleanupByAge("USER_UPDATED", 30);
        cleanupByAge("USER_DELETED", 30);
        cleanupByAge("USER_LOCKED", 30);
        cleanupByAge("USER_UNLOCKED", 30);
        cleanupByAge("UPDATE_SETTINGS", 30);

        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<AuditLog> oldLogs = auditLogRepository.findByCreatedAtBefore(cutoff);
        if (!oldLogs.isEmpty()) {
            auditLogRepository.deleteAll(oldLogs);
        }
    }

    private void cleanupByAge(String action, int retentionDays) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        List<AuditLog> oldLogs = auditLogRepository.findByActionAndCreatedAtBefore(action, cutoff);
        if (!oldLogs.isEmpty()) {
            auditLogRepository.deleteAll(oldLogs);
        }
    }
}
