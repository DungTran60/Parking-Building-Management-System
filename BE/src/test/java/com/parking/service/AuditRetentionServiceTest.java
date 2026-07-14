package com.parking.service;

import com.parking.entity.AuditLog;
import com.parking.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditRetentionServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditRetentionService auditRetentionService;

    @Test
    void cleanupShouldDeleteOldAuditLogsOlderThanRetentionPeriod() {
        AuditLog oldLog = AuditLog.builder().id(1L).action("LOGIN").resource("AUTH").resourceId(1L).actorId(1L).actorUsername("admin").createdAt(LocalDateTime.now().minusDays(31)).build();
        when(auditLogRepository.findByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(java.util.List.of(oldLog));

        auditRetentionService.cleanupExpiredAuditLogs();

        verify(auditLogRepository).deleteAll(java.util.List.of(oldLog));
    }
}
