package com.parking.repository;

import com.parking.entity.ParkingSessionException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ParkingSessionExceptionRepository extends JpaRepository<ParkingSessionException, Long> {

    @Query("SELECT COALESCE(SUM(e.extraFee), 0) FROM ParkingSessionException e WHERE e.session.id = :sessionId")
    BigDecimal sumExtraFeeBySessionId(@Param("sessionId") Long sessionId);
}
