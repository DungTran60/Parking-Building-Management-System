package com.parking.service;

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

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void log(String action, String resource, Long resourceId, Long actorId, String actorUsername) {
        log(action, resource, resourceId, actorId, actorUsername, null, null);
    }

    @Override
    @Transactional
    public void log(String action, String resource, Long resourceId, Long actorId, String actorUsername, String ipAddress, String userAgent) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .resource(resource)
                .resourceId(resourceId)
                .actorId(actorId)
                .actorUsername(actorUsername)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> getAuditLogs(String resource, Long resourceId) {
        return auditLogRepository.findByResourceAndResourceId(resource, resourceId);
    }

    @Override
    public Page<AuditLog> findPaginated(String action, String actorUsername, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (action != null && !action.isEmpty()) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (actorUsername != null && !actorUsername.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("actorUsername")), "%" + actorUsername.toLowerCase() + "%"));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return auditLogRepository.findAll(spec, pageable);
    }
}