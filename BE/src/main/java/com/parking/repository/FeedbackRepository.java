package com.parking.repository;

import com.parking.entity.Feedback;
import com.parking.entity.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Feedback> findByStatusOrderByCreatedAtDesc(FeedbackStatus status);
}
