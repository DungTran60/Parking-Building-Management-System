package com.parking.scheduler;

import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.ReservationStatus;
import com.parking.entity.SlotStatus;
import com.parking.entity.SystemSettings;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tự động hết hạn reservation quá giờ (no-show) — workflow §5.2 bước 5c.
 *
 * Khi SystemSettings.autoBlockOverdueSlots = true: các reservation PENDING/CONFIRMED
 * có startAt đã quá GRACE_PERIOD_MINUTES mà chưa check-in sẽ bị chuyển sang EXPIRED
 * và slot (nếu đang RESERVED) được giải phóng về AVAILABLE.
 *
 * Chạy mặc định mỗi 5 phút (có thể override bằng property app.reservation-expire-interval-ms).
 */
@Component
@RequiredArgsConstructor
public class ReservationExpirationScheduler {

    private static final long GRACE_PERIOD_MINUTES = 30;
    private static final Long SETTINGS_SINGLETON_ID = 1L;

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final SystemSettingsRepository systemSettingsRepository;

    @Scheduled(fixedDelayString = "${app.reservation-expire-interval-ms:300000}")
    @Transactional
    public void expireOverdueReservations() {
        boolean autoBlock = systemSettingsRepository.findById(SETTINGS_SINGLETON_ID)
                .map(SystemSettings::isAutoBlockOverdueSlots)
                .orElse(false);
        if (!autoBlock) {
            return;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(GRACE_PERIOD_MINUTES);
        List<Reservation> overdue = reservationRepository.findByStatusInAndStartAtBefore(
                List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED), cutoff);

        for (Reservation reservation : overdue) {
            reservation.setStatus(ReservationStatus.EXPIRED);
            ParkingSlot slot = reservation.getSlot();
            if (slot != null && slot.getStatus() == SlotStatus.RESERVED) {
                slot.setStatus(SlotStatus.AVAILABLE);
                parkingSlotRepository.save(slot);
            }
            reservationRepository.save(reservation);
        }
    }
}
