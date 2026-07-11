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

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<IncidentResponseDto> createIncident(
            @Valid @RequestBody IncidentRequestDto dto,
            Principal principal) {
        return new ResponseEntity<>(incidentService.createIncident(dto, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('incidents:handle', 'exceptions:manage')")
    public ResponseEntity<IncidentResponseDto> getIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncident(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('incidents:handle', 'exceptions:manage')")
    public ResponseEntity<List<IncidentResponseDto>> findIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) IncidentType type,
            @RequestParam(required = false) String assignee,
            Principal principal) {
        return ResponseEntity.ok(incidentService.findIncidents(status, type, assignee, principal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('incidents:handle', 'exceptions:manage')")
    public ResponseEntity<IncidentResponseDto> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentRequestDto dto) {
        return ResponseEntity.ok(incidentService.updateIncident(id, dto));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('incidents:manage', 'exceptions:manage')")
    public ResponseEntity<IncidentResponseDto> assignIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentAssignDto dto) {
        return ResponseEntity.ok(incidentService.assignIncident(id, dto));
    }

    @PatchMapping("/{id}/process")
    @PreAuthorize("hasAnyAuthority('incidents:handle', 'exceptions:manage')")
    public ResponseEntity<IncidentResponseDto> startProcessing(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(incidentService.startProcessing(id, principal));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyAuthority('incidents:handle', 'exceptions:manage')")
    public ResponseEntity<IncidentResponseDto> resolveIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentResolveDto dto) {
        return ResponseEntity.ok(incidentService.resolveIncident(id, dto));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyAuthority('incidents:manage', 'exceptions:manage')")
    public ResponseEntity<IncidentResponseDto> closeIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.closeIncident(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('incidents:manage', 'exceptions:manage')")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}
