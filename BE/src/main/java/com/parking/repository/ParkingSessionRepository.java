package com.parking.repository;

import com.parking.entity.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long> {

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

    Optional<ParkingSession> findFirstByTicketCodeOrPlateNumberAndStatusOrderByIdDesc(String ticketCode, String plateNumber, String status);

    /** Kiểm tra VehicleType có đang được dùng trong ParkingSession không */
    boolean existsByVehicleTypeId(Long vehicleTypeId);
}
