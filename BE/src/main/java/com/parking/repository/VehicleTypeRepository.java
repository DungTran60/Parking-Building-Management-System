package com.parking.repository;

import com.parking.entity.VehicleType;
import com.parking.entity.VehicleTypeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, Long> {

    boolean existsByCode(String code);

    boolean existsByName(String name);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsByNameAndIdNot(String name, Long id);

    Optional<VehicleType> findByCode(String code);

    List<VehicleType> findByStatus(VehicleTypeStatus status);
}
