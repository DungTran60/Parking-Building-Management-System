package com.parking.service;

import com.parking.dto.IncidentAssignDto;
import com.parking.dto.IncidentRequestDto;
import com.parking.dto.IncidentResolveDto;
import com.parking.dto.IncidentResponseDto;
import com.parking.entity.*;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;
import com.parking.repository.spec.IncidentSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
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
    public List<IncidentResponseDto> findIncidents(IncidentStatus status, IncidentType type, String assignee, Principal principal) {
        Long assigneeId = null;
        if (assignee != null) {
            if ("me".equalsIgnoreCase(assignee)) {
                User currentUser = findUserOrThrow(principal.getName());
                assigneeId = currentUser.getId();
            } else {
                try {
                    assigneeId = Long.parseLong(assignee);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Invalid assignee ID format: " + assignee);
                }
            }
        }

        Specification<Incident> spec = Specification
                .allOf(
                        IncidentSpecification.hasStatus(status),
                        IncidentSpecification.hasType(type),
                        IncidentSpecification.hasAssignee(assigneeId)
                );

        return incidentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "reportedAt"))
                .stream()
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
       Phân công: OPEN/IN_PROGRESS → IN_PROGRESS
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public IncidentResponseDto assignIncident(Long id, IncidentAssignDto dto) {
        Incident incident = findOrThrow(id);

        // Chỉ cho phép phân công khi sự cố đang mở hoặc đang xử lý
        if (incident.getStatus() != IncidentStatus.OPEN && incident.getStatus() != IncidentStatus.IN_PROGRESS) {
            throw new ConflictException("Only OPEN or IN_PROGRESS incidents can be assigned. Current status: " + incident.getStatus());
        }

        User assignee = userRepository.findById(dto.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found with ID: " + dto.getAssigneeId()));

        // Kiểm tra người được gán có phải STAFF và đang hoạt động không
        if (!"ROLE_STAFF".equals(assignee.getRole().getName())) {
            throw new IllegalArgumentException("User " + assignee.getUsername() + " is not a STAFF member.");
        }
        if (assignee.getStatus() != Status.ACTIVE) {
            throw new IllegalArgumentException("User " + assignee.getUsername() + " is not active.");
        }

        incident.setAssignee(assignee);
        incident.setProcessingAt(LocalDateTime.now());
        incident.setStatus(IncidentStatus.IN_PROGRESS); // Đảm bảo trạng thái là IN_PROGRESS

        return mapToResponse(incidentRepository.save(incident));
    }

    /* ─────────────────────────────────────────────────────
       Bắt đầu xử lý: OPEN → IN_PROGRESS
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public IncidentResponseDto startProcessing(Long id, Principal principal) {
        Incident incident = findOrThrow(id);
        User assignee = findUserOrThrow(principal.getName());

        // Chỉ xử lý sự cố đang ở trạng thái OPEN
        if (incident.getStatus() != IncidentStatus.OPEN) {
            throw new ConflictException("Only OPEN incidents can be processed. Current status: " + incident.getStatus());
        }

        // Kiểm tra xem đã có người xử lý chưa
        if (incident.getAssignee() != null) {
            throw new ConflictException("Incident is already being processed by " + incident.getAssignee().getUsername());
        }

        incident.setAssignee(assignee);
        incident.setProcessingAt(LocalDateTime.now());
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
        
        // Chỉ cho phép giải quyết khi sự cố đang được xử lý
        if (incident.getStatus() != IncidentStatus.IN_PROGRESS) {
            throw new ConflictException(
                    "Incident must be IN_PROGRESS to be resolved. Current status: " + incident.getStatus());
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
            throw new ConflictException(
                    "Only RESOLVED incidents can be closed. Current status: " + incident.getStatus());
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
                .assigneeId(i.getAssignee() != null ? i.getAssignee().getId() : null)
                .assigneeName(i.getAssignee() != null ? i.getAssignee().getUsername() : null)
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
                .processingAt(i.getProcessingAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}
