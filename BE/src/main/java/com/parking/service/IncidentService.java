package com.parking.service;

import com.parking.dto.IncidentRequestDto;
import com.parking.dto.IncidentResolveDto;
import com.parking.dto.IncidentResponseDto;
import com.parking.entity.IncidentStatus;
import com.parking.entity.IncidentType;

import java.util.List;

public interface IncidentService {

    /** Nhân viên / Manager tạo sự cố mới */
    IncidentResponseDto createIncident(IncidentRequestDto dto, String username);

    /** Lấy sự cố theo ID */
    IncidentResponseDto getIncident(Long id);

    /** Lấy tất cả sự cố */
    List<IncidentResponseDto> getAllIncidents();

    /** Lọc theo trạng thái */
    List<IncidentResponseDto> getIncidentsByStatus(IncidentStatus status);

    /** Lọc theo loại */
    List<IncidentResponseDto> getIncidentsByType(IncidentType type);

    /** Cập nhật thông tin sự cố */
    IncidentResponseDto updateIncident(Long id, IncidentRequestDto dto);

    /** Chuyển trạng thái sang IN_PROGRESS */
    IncidentResponseDto startProcessing(Long id);

    /** Giải quyết sự cố: → RESOLVED */
    IncidentResponseDto resolveIncident(Long id, IncidentResolveDto dto);

    /** Đóng sự cố: → CLOSED */
    IncidentResponseDto closeIncident(Long id);

    /** Xóa sự cố */
    void deleteIncident(Long id);
}
