package com.parking.repository;

import com.parking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByOrderByPaymentTimeDesc();
    List<Payment> findBySessionDriverIdOrderByPaymentTimeDesc(Long driverId);
    List<Payment> findByPaymentTimeGreaterThanEqualAndPaymentTimeLessThan(
            LocalDateTime startInclusive, LocalDateTime endExclusive);
}

