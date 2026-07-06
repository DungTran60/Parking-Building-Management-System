package com.parking.service;

import com.parking.dto.IncidentRequestDto;
import com.parking.dto.IncidentResolveDto;
import com.parking.dto.IncidentResponseDto;
import com.parking.entity.*;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository       incidentRepository;
    private final UserRepository           userRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository    parkingSlotRepository;

    /* ─────────────────────────────────────────────────────
       Tạo sự cố mới
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public IncidentResponseDto createIncident(IncidentRequestDto dto, String username) {
        User reporter = findUserOrThrow(username);

        ParkingSession session = null;
        if (dto.getSessionId() != null) {
            session = parkingSessionRepository.findById(dto.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parking session not found with ID: " + dto.getSessionId()));
        }

        ParkingSlot slot = null;
        if (dto.getSlotId() != null) {
            slot = parkingSlotRepository.findById(dto.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parking slot not found with ID: " + dto.getSlotId()));
        }

        Incident incident = Incident.builder()
                .reporter(reporter)
                .session(session)
                .slot(slot)
                .type(dto.getType())
                .description(dto.getDescription())
                .status(IncidentStatus.OPEN)
                .build();

        return mapToResponse(incidentRepository.save(incident));
    }

    /* ─────────────────────────────────────────────────────
       Lấy theo ID
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public IncidentResponseDto getIncident(Long id) {
        return mapToResponse(findOrThrow(id));
    }

    /* ─────────────────────────────────────────────────────
       Lấy tất cả
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponseDto> getAllIncidents() {
        return incidentRepository.findAllByOrderByReportedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Lọc theo trạng thái
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponseDto> getIncidentsByStatus(IncidentStatus status) {
        return incidentRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Lọc theo loại
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponseDto> getIncidentsByType(IncidentType type) {
        return incidentRepository.findByType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Cập nhật sự cố
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public IncidentResponseDto updateIncident(Long id, IncidentRequestDto dto) {
        Incident incident = findOrThrow(id);

        if (incident.getStatus() == IncidentStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot update a CLOSED incident");
        }

        ParkingSession session = null;
        if (dto.getSessionId() != null) {
            session = parkingSessionRepository.findById(dto.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parking session not found with ID: " + dto.getSessionId()));
        }

        ParkingSlot slot = null;
        if (dto.getSlotId() != null) {
            slot = parkingSlotRepository.findById(dto.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parking slot not found with ID: " + dto.getSlotId()));
        }

        incident.setType(dto.getType());
        incident.setDescription(dto.getDescription());
        incident.setSession(session);
        incident.setSlot(slot);

        return mapToResponse(incidentRepository.save(incident));
    }

    /* ─────────────────────────────────────────────────────
       Bắt đầu xử lý: OPEN → IN_PROGRESS
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public IncidentResponseDto startProcessing(Long id) {
        Incident incident = findOrThrow(id);
        if (incident.getStatus() != IncidentStatus.OPEN) {
            throw new IllegalArgumentException(
                    "Only OPEN incidents can be moved to IN_PROGRESS. Current: " + incident.getStatus());
        }
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        return mapToResponse(incidentRepository.save(incident));
    }

    /* ─────────────────────────────────────────────────────
       Giải quyết: IN_PROGRESS → RESOLVED
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public IncidentResponseDto resolveIncident(Long id, IncidentResolveDto dto) {
        Incident incident = findOrThrow(id);
        if (incident.getStatus() != IncidentStatus.IN_PROGRESS
                && incident.getStatus() != IncidentStatus.OPEN) {
            throw new IllegalArgumentException(
                    "Incident must be OPEN or IN_PROGRESS to be resolved. Current: " + incident.getStatus());
        }
        incident.setResolution(dto.getResolution());
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolvedAt(LocalDateTime.now());
        return mapToResponse(incidentRepository.save(incident));
    }

    /* ─────────────────────────────────────────────────────
       Đóng sự cố: RESOLVED → CLOSED
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public IncidentResponseDto closeIncident(Long id) {
        Incident incident = findOrThrow(id);
        if (incident.getStatus() != IncidentStatus.RESOLVED) {
            throw new IllegalArgumentException(
                    "Only RESOLVED incidents can be closed. Current: " + incident.getStatus());
        }
        incident.setStatus(IncidentStatus.CLOSED);
        return mapToResponse(incidentRepository.save(incident));
    }

    /* ─────────────────────────────────────────────────────
       Xóa sự cố
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public void deleteIncident(Long id) {
        if (!incidentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Incident not found with ID: " + id);
        }
        incidentRepository.deleteById(id);
    }

    /* ─────────────────────────────────────────────────────
       Helpers
    ───────────────────────────────────────────────────── */
    private Incident findOrThrow(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with ID: " + id));
    }

    private User findUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private IncidentResponseDto mapToResponse(Incident i) {
        return IncidentResponseDto.builder()
                .id(i.getId())
                .reporterId(i.getReporter().getId())
                .reporterName(i.getReporter().getUsername())
                .sessionId(i.getSession() != null ? i.getSession().getId() : null)
                .ticketCode(i.getSession() != null ? i.getSession().getTicketCode() : null)
                .slotId(i.getSlot() != null ? i.getSlot().getId() : null)
                .slotCode(i.getSlot() != null ? i.getSlot().getCode() : null)
                .type(i.getType())
                .description(i.getDescription())
                .resolution(i.getResolution())
                .status(i.getStatus())
                .reportedAt(i.getReportedAt())
                .resolvedAt(i.getResolvedAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}
