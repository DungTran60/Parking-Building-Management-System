package com.parking.repository;

import com.parking.entity.Pricing;
import com.parking.entity.PricingTimeUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, Long> {

    /** Tìm tất cả bảng giá theo loại phương tiện */
    List<Pricing> findByVehicleTypeId(Long vehicleTypeId);

    /** Tìm tất cả bảng giá đang áp dụng */
    List<Pricing> findByActiveTrue();

    /** Tìm tất cả bảng giá đang áp dụng theo loại phương tiện */
    List<Pricing> findByVehicleTypeIdAndActiveTrue(Long vehicleTypeId);

    /** Kiểm tra tồn tại bảng giá cho cặp (loại xe, đơn vị thời gian) */
    boolean existsByVehicleTypeIdAndTimeUnit(Long vehicleTypeId, PricingTimeUnit timeUnit);

    /** Kiểm tra trùng lặp khi update – loại trừ bản ghi đang chỉnh sửa */
    boolean existsByVehicleTypeIdAndTimeUnitAndIdNot(Long vehicleTypeId, PricingTimeUnit timeUnit, Long id);

    /** Tìm bảng giá cụ thể theo loại xe và đơn vị thời gian */
    Optional<Pricing> findByVehicleTypeIdAndTimeUnit(Long vehicleTypeId, PricingTimeUnit timeUnit);

    /** Kiểm tra VehicleType có đang được dùng bởi bảng giá không */
    boolean existsByVehicleTypeId(Long vehicleTypeId);
}
