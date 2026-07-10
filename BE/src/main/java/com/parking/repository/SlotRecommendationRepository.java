package com.parking.repository;

import com.parking.entity.SlotRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SlotRecommendationRepository extends JpaRepository<SlotRecommendation, Long> {
}
