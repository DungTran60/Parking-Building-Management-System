package com.parking.repository;

import com.parking.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
    List<AuditLog> findByResourceAndResourceId(String resource, Long resourceId);
    long countByAction(String action);
    List<AuditLog> findByActionAndCreatedAtBefore(String action, LocalDateTime createdAtBefore);
    List<AuditLog> findByCreatedAtBefore(LocalDateTime createdAtBefore);
}