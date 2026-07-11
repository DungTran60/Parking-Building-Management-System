package com.parking.controller;

import com.parking.dto.AuditLogResponseDto;
import com.parking.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    @PreAuthorize("hasAuthority('audit:view')")
    public ResponseEntity<Page<AuditLogResponseDto>> getAuditLogs(
            @RequestParam(required = false) String resource,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String actorUsername,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        if (resource != null && resourceId != null) {
            List<AuditLogResponseDto> logs = auditService.getAuditLogs(resource, resourceId);
            Pageable pageable = PageRequest.of(0, Math.max(logs.size(), 1));
            return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(logs, pageable, logs.size()));
        }
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200));
        return ResponseEntity.ok(auditService.getAuditLogsFiltered(resource, action, actorUsername, pageable));
    }
}
