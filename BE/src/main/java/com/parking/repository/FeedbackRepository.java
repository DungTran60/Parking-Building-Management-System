package com.parking.repository;

import com.parking.entity.Feedback;
import com.parking.entity.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /** Lấy tất cả feedback của một khách hàng */
    List<Feedback> findByCustomerId(Long customerId);

    /** Lấy feedback theo ParkingSession */
    Optional<Feedback> findBySessionId(Long sessionId);

    /** Kiểm tra một session đã có feedback chưa */
    boolean existsBySessionId(Long sessionId);

    /** Lọc feedback theo trạng thái */
    List<Feedback> findByStatus(FeedbackStatus status);

    /** Lấy tất cả, sắp xếp mới nhất trước */
    List<Feedback> findAllByOrderByCreatedAtDesc();
}
