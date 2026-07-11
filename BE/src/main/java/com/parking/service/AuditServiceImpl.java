package com.parking.service;

import com.parking.dto.AuditLogResponseDto;
import com.parking.entity.AuditLog;
import com.parking.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDto> getAllAuditLogs() {
        return auditLogRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponseDto> getAuditLogsFiltered(String resource, String action, String actorUsername, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (resource != null && !resource.isBlank()) {
                predicates.add(cb.equal(root.get("resource"), resource));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (actorUsername != null && !actorUsername.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("actorUsername")), "%" + actorUsername.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return auditLogRepository.findAll(spec, pageable).map(this::mapToResponseDto);
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
