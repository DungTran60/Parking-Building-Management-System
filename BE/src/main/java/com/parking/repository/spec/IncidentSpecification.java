package com.parking.repository.spec;

import com.parking.entity.Incident;
import com.parking.entity.IncidentStatus;
import com.parking.entity.IncidentType;
import com.parking.entity.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class IncidentSpecification {

    public static Specification<Incident> hasStatus(IncidentStatus status) {
        return (root, query, criteriaBuilder) ->
                status == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Incident> hasType(IncidentType type) {
        return (root, query, criteriaBuilder) ->
                type == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("type"), type);
    }

    public static Specification<Incident> hasAssignee(Long assigneeId) {
        return (root, query, criteriaBuilder) -> {
            if (assigneeId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Incident, User> assigneeJoin = root.join("assignee");
            return criteriaBuilder.equal(assigneeJoin.get("id"), assigneeId);
        };
    }
}