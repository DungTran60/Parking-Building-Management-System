package com.parking.service;

import com.parking.dto.IncidentRequestDto;
import com.parking.dto.IncidentResolveDto;
import com.parking.dto.IncidentResponseDto;
import com.parking.entity.IncidentStatus;
import com.parking.entity.IncidentType;

import java.security.Principal;
import java.util.List;

public interface IncidentService {

    /** Nhân viên / Manager tạo sự cố mới */
    IncidentResponseDto createIncident(IncidentRequestDto dto, String username);

    /** Lấy sự cố theo ID */
    IncidentResponseDto getIncident(Long id);

    /** Lấy và lọc danh sách sự cố */
    List<IncidentResponseDto> findIncidents(
            IncidentStatus status,
            IncidentType type,
            String assignee,
            Principal principal
    );

    /** Cập nhật thông tin sự cố */
    IncidentResponseDto updateIncident(Long id, IncidentRequestDto dto);

    /** Manager phân công sự cố cho nhân viên */
    IncidentResponseDto assignIncident(Long id, com.parking.dto.IncidentAssignDto dto);

    /** Chuyển trạng thái sang IN_PROGRESS */
    IncidentResponseDto startProcessing(Long id, java.security.Principal principal);

    /** Giải quyết sự cố: → RESOLVED */
    IncidentResponseDto resolveIncident(Long id, IncidentResolveDto dto);

    /** Đóng sự cố: → CLOSED */
    IncidentResponseDto closeIncident(Long id);

    /** Xóa sự cố */
    void deleteIncident(Long id);
}
