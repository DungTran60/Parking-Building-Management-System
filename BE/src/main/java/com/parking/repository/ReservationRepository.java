package com.parking.repository;

import com.parking.entity.Reservation;
import com.parking.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /** Lấy tất cả đặt chỗ theo trạng thái */
    List<Reservation> findByStatus(ReservationStatus status);

    /** Lấy tất cả đặt chỗ của một slot cụ thể */
    List<Reservation> findBySlotId(Long slotId);

    /** Tìm các reservation chưa check-in và đã quá giờ dự kiến (startAt < cutoff) — phục vụ no-show expiry */
    List<Reservation> findByStatusInAndStartAtBefore(List<ReservationStatus> statuses, LocalDateTime cutoff);

    /**
     * Kiểm tra xem slot có bị đặt chồng thời gian không.
     * Điều kiện: trạng thái chưa hủy VÀ khoảng thời gian mới giao với khoảng hiện có.
     */
    @Query("""
        SELECT COUNT(r) > 0
        FROM Reservation r
        WHERE r.slot.id = :slotId
          AND r.status NOT IN (com.parking.entity.ReservationStatus.CANCELLED, com.parking.entity.ReservationStatus.EXPIRED)
          AND r.startAt < :endAt
          AND r.endAt   > :startAt
    """)
    boolean existsOverlappingReservation(
            @Param("slotId")  Long slotId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt")   LocalDateTime endAt
    );

    /**
     * Kiểm tra xem slot có bị đặt chồng thời gian không, loại trừ một reservation cụ thể.
     * Dùng khi cập nhật.
     */
    @Query("""
        SELECT COUNT(r) > 0
        FROM Reservation r
        WHERE r.slot.id = :slotId
          AND r.id <> :excludeId
          AND r.status NOT IN (com.parking.entity.ReservationStatus.CANCELLED, com.parking.entity.ReservationStatus.EXPIRED)
          AND r.startAt < :endAt
          AND r.endAt   > :startAt
    """)
    boolean existsOverlappingReservationExcluding(
            @Param("slotId")     Long slotId,
            @Param("excludeId")  Long excludeId,
            @Param("startAt")    LocalDateTime startAt,
            @Param("endAt")      LocalDateTime endAt
    );

    /** Kiểm tra VehicleType có đang được dùng trong Reservation không */
    boolean existsByVehicleTypeId(Long vehicleTypeId);
}
