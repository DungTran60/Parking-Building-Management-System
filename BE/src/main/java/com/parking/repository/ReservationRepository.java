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

  /**
   * Kiểm tra xem slot có bị đặt chồng thời gian không.
   * Điều kiện: trạng thái chưa hủy VÀ khoảng thời gian mới giao với khoảng hiện
   * có.
   */
  @Query("""
          SELECT COUNT(r) > 0
          FROM Reservation r
          WHERE r.slot.id = :slotId
            AND r.status <> com.parking.entity.ReservationStatus.CANCELLED
            AND r.startAt < :endAt
            AND r.endAt   > :startAt
      """)
  boolean existsOverlappingReservation(
      @Param("slotId") Long slotId,
      @Param("startAt") LocalDateTime startAt,
      @Param("endAt") LocalDateTime endAt);

  /**
   * Kiểm tra xem slot có bị đặt chồng thời gian không, loại trừ một reservation
   * cụ thể.
   * Dùng khi cập nhật.
   */
  @Query("""
          SELECT COUNT(r) > 0
          FROM Reservation r
          WHERE r.slot.id = :slotId
            AND r.id <> :excludeId
            AND r.status <> com.parking.entity.ReservationStatus.CANCELLED
            AND r.startAt < :endAt
            AND r.endAt   > :startAt
      """)
  boolean existsOverlappingReservationExcluding(
      @Param("slotId") Long slotId,
      @Param("excludeId") Long excludeId,
      @Param("startAt") LocalDateTime startAt,
      @Param("endAt") LocalDateTime endAt);

  /**
   * Tìm tất cả đặt chỗ CONFIRMED đã hết hạn (end_at < now).
   * Dùng cho Auto Slot Update – giải phóng slot khi đặt chỗ hết hạn.
   */
  @Query("SELECT r FROM Reservation r WHERE r.status = com.parking.entity.ReservationStatus.CONFIRMED AND r.endAt < :now")
  List<Reservation> findExpiredConfirmedReservations(@Param("now") LocalDateTime now);

  /**
   * Tìm tất cả đặt chỗ PENDING đã hết hạn (end_at < now).
   * Dùng cho Auto Slot Update – tự động hủy các đặt chờ hết hạn.
   */
  @Query("SELECT r FROM Reservation r WHERE r.status = com.parking.entity.ReservationStatus.PENDING AND r.endAt < :now")
  List<Reservation> findExpiredPendingReservations(@Param("now") LocalDateTime now);
}
