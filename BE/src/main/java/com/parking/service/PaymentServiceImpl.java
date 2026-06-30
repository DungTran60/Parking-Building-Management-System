package com.parking.service;

import com.parking.dto.PaymentRequestDto;
import com.parking.dto.PaymentResponseDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.entity.SlotStatus;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    @Override
    @Transactional
    public PaymentResponseDto createPayment(PaymentRequestDto request) {
        ParkingSession session = parkingSessionRepository.findById(Long.valueOf(request.getSessionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + request.getSessionId()));

        if ("ACTIVE".equals(session.getStatus())) {
            LocalDateTime checkOutTime = LocalDateTime.now();
            long seconds = Duration.between(session.getCheckInAt(), checkOutTime).getSeconds();
            double hours = Math.max(1.0, Math.ceil(seconds / 3600.0));
            double hourlyRate = session.getVehicleType().getHourlyRate() != null ? session.getVehicleType().getHourlyRate() : 5000.0;
            double fee = hours * hourlyRate;

            session.setCheckOutAt(checkOutTime);
            session.setFee(fee);
            session.setStatus("COMPLETED");
            parkingSessionRepository.save(session);

            ParkingSlot slot = session.getSlot();
            slot.setStatus(SlotStatus.AVAILABLE);
            parkingSlotRepository.save(slot);
        }

        Payment payment = Payment.builder()
                .session(session)
                .amount(session.getFee())
                .method(request.getMethod())
                .paymentTime(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);
        return convertToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentHistory() {
        return paymentRepository.findAllByOrderByPaymentTimeDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private PaymentResponseDto convertToDto(Payment payment) {
        return PaymentResponseDto.builder()
                .id(String.valueOf(payment.getId()))
                .sessionId(payment.getSession().getTicketCode() != null ? payment.getSession().getTicketCode() : String.valueOf(payment.getSession().getId()))
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .paidAt(payment.getPaymentTime())
                .build();
    }
}
