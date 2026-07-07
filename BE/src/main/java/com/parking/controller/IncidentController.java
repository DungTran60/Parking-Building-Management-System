package com.parking.controller;

import com.parking.dto.IncidentAssignDto;
import com.parking.dto.IncidentRequestDto;
import com.parking.dto.IncidentResolveDto;
import com.parking.dto.IncidentResponseDto;
import com.parking.entity.IncidentStatus;
import com.parking.entity.IncidentType;
import com.parking.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    /**
     * POST /api/incidents
     * Nhân viên hoặc Manager tạo sự cố mới.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<IncidentResponseDto> createIncident(
            @Valid @RequestBody IncidentRequestDto dto,
            Principal principal) {
        return new ResponseEntity<>(incidentService.createIncident(dto, principal.getName()), HttpStatus.CREATED);
    }

    /**
     * GET /api/incidents/{id}
     * Lấy chi tiết sự cố.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<IncidentResponseDto> getIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncident(id));
    }

    /**
     * GET /api/incidents
     * Lấy danh sách sự cố. Lọc tuỳ chọn: ?status=OPEN&type=LOST_TICKET
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<IncidentResponseDto>> findIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) IncidentType type,
            @RequestParam(required = false) String assignee,
            Principal principal) {
        return ResponseEntity.ok(incidentService.findIncidents(status, type, assignee, principal));
    }

    /**
     * PUT /api/incidents/{id}
     * Cập nhật thông tin sự cố.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<IncidentResponseDto> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentRequestDto dto) {
        return ResponseEntity.ok(incidentService.updateIncident(id, dto));
    }

    /**
     * PATCH /api/incidents/{id}/assign
     * Manager phân công sự cố cho nhân viên.
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<IncidentResponseDto> assignIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentAssignDto dto) {
        return ResponseEntity.ok(incidentService.assignIncident(id, dto));
    }

    /**
     * PATCH /api/incidents/{id}/process
     * Bắt đầu xử lý: OPEN → IN_PROGRESS.
     */
    @PatchMapping("/{id}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<IncidentResponseDto> startProcessing(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(incidentService.startProcessing(id, principal));
    }

    /**
     * PATCH /api/incidents/{id}/resolve
     * Giải quyết sự cố: → RESOLVED.
     */
    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<IncidentResponseDto> resolveIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentResolveDto dto) {
        return ResponseEntity.ok(incidentService.resolveIncident(id, dto));
    }

    /**
     * PATCH /api/incidents/{id}/close
     * Đóng sự cố: RESOLVED → CLOSED.
     */
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<IncidentResponseDto> closeIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.closeIncident(id));
    }

    /**
     * DELETE /api/incidents/{id}
     * Xóa sự cố. Chỉ ADMIN.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}
