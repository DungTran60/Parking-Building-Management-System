package com.parking.specification;

import com.parking.entity.ParkingSession;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class ParkingSessionSpecification {

    public Specification<ParkingSession> filterBy(
            String status,
            String query,
            Long vehicleTypeId,
            LocalDateTime from,
            LocalDateTime to) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (vehicleTypeId != null) {
                predicates.add(criteriaBuilder.equal(root.get("vehicleType").get("id"), vehicleTypeId));
            }

            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("checkInAt"), from));
            }

            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("checkInAt"), to));
            }

            if (query != null && !query.isBlank()) {
                String likePattern = "%" + query.toUpperCase() + "%";
                Predicate plateNumberPredicate = criteriaBuilder.like(criteriaBuilder.upper(root.get("plateNumber")), likePattern);
                Predicate ticketCodePredicate = criteriaBuilder.like(criteriaBuilder.upper(root.get("ticketCode")), likePattern);
                predicates.add(criteriaBuilder.or(plateNumberPredicate, ticketCodePredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}