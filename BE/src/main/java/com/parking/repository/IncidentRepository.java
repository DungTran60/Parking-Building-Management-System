package com.parking.repository;

import com.parking.entity.Incident;
import com.parking.entity.IncidentStatus;
import com.parking.entity.IncidentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    /** Tất cả sự cố theo trạng thái */
    List<Incident> findByStatus(IncidentStatus status);

    /** Tất cả sự cố theo loại */
    List<Incident> findByType(IncidentType type);

    /** Sự cố theo người báo cáo */
    List<Incident> findByReporterId(Long reporterId);

    /** Sự cố theo session */
    List<Incident> findBySessionId(Long sessionId);

    /** Tất cả sắp xếp mới nhất trước */
    List<Incident> findAllByOrderByReportedAtDesc();
}
