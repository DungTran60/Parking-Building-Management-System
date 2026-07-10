package com.parking.service;

import com.parking.dto.AuditLogResponseDto;
import com.parking.entity.AuditLog;
import com.parking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void log(String action, String resource, Long resourceId, Long actorId, String actorUsername) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .resource(resource)
                .resourceId(resourceId)
                .actorId(actorId)
                .actorUsername(actorUsername)
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDto> getAuditLogs(String resource, Long resourceId) {
        return auditLogRepository.findByResourceAndResourceId(resource, resourceId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private AuditLogResponseDto mapToResponseDto(AuditLog auditLog) {
        return AuditLogResponseDto.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .resource(auditLog.getResource())
                .resourceId(auditLog.getResourceId())
                .actorId(auditLog.getActorId())
                .actorUsername(auditLog.getActorUsername())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}