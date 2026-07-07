package com.parking.controller;

import com.parking.entity.AuditLog;
import com.parking.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam String resource,
            @RequestParam Long resourceId
    ) {
        List<AuditLog> auditLogs = auditService.getAuditLogs(resource, resourceId);
        return ResponseEntity.ok(auditLogs);
    }
}