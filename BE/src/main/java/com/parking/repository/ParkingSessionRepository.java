package com.parking.repository;

import com.parking.dto.RevenueByVehicleTypeDto;
import com.parking.entity.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long>, JpaSpecificationExecutor<ParkingSession> {

    boolean existsByPlateNumberAndStatus(String plateNumber, String status);

    Optional<ParkingSession> findByTicketCodeAndStatus(String ticketCode, String status);

    Optional<ParkingSession> findByPlateNumberAndStatus(String plateNumber, String status);

    /**
     * Lấy session ACTIVE mới nhất theo biển số (findFirst tránh crash khi có nhiều kết quả).
     */
    Optional<ParkingSession> findFirstByPlateNumberAndStatusOrderByCheckInAtDesc(
            String plateNumber, String status);

    /**
     * Tìm kiếm không phân biệt hoa/thường – dùng cho biển số xe.
     */
    @Query("SELECT s FROM ParkingSession s WHERE UPPER(s.plateNumber) = UPPER(:plateNumber) " +
           "AND s.status = :status ORDER BY s.checkInAt DESC")
    Optional<ParkingSession> findFirstActiveByPlateNumberIgnoreCase(
            @Param("plateNumber") String plateNumber,
            @Param("status") String status);

    /** Kiểm tra VehicleType có đang được dùng trong ParkingSession không */
    boolean existsByVehicleTypeId(Long vehicleTypeId);

    List<ParkingSession> findByCheckInAtBetweenOrCheckOutAtBetween(
            LocalDateTime start1, LocalDateTime end1,
            LocalDateTime start2, LocalDateTime end2);

    List<ParkingSession> findByStatusAndCheckOutAtBetween(String status, LocalDateTime start, LocalDateTime end);

    long countByCheckOutAtIsNull();

    @Query("SELECT new com.parking.dto.RevenueByVehicleTypeDto(ps.vehicleType.id, ps.vehicleType.name, SUM(ps.fee)) " +
           "FROM ParkingSession ps " +
           "WHERE ps.checkOutAt BETWEEN :startDate AND :endDate AND ps.status = 'COMPLETED' " +
           "GROUP BY ps.vehicleType.id, ps.vehicleType.name")
            List<RevenueByVehicleTypeDto> findRevenueByVehicleType(
                    @Param("startDate") LocalDateTime startDate,
                    @Param("endDate") LocalDateTime endDate
            );

    @Query("SELECT ps FROM ParkingSession ps WHERE ps.checkInAt BETWEEN :startTime AND :endTime OR ps.checkOutAt BETWEEN :startTime AND :endTime")
    List<ParkingSession> findTrafficInRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
