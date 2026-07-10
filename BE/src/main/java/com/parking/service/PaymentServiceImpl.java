package com.parking.service;

import com.parking.dto.PaymentRequestDto;
import com.parking.dto.PaymentResponseDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.entity.SessionStatus;
import com.parking.entity.SlotStatus;
import com.parking.entity.User;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final AuthenticationService authenticationService;
    private final FeeCalculationService feeCalculationService;

    @Override
    @Transactional
    public PaymentResponseDto createPayment(PaymentRequestDto request) {
        ParkingSession session = parkingSessionRepository.findById(Long.valueOf(request.getSessionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + request.getSessionId()));

        // Idempotency: mỗi lượt gửi xe chỉ được thu phí một lần (chống tạo Payment trùng).
        if (paymentRepository.existsBySessionId(session.getId())) {
            throw new ConflictException("Lượt gửi xe này đã được thanh toán.");
        }

        if (session.getStatus() == SessionStatus.ACTIVE) {
            LocalDateTime checkOutTime = LocalDateTime.now();
            // Dùng chung logic tính phí với checkout (Pricing → hourlyRate → SystemSettings default → mặc định)
            BigDecimal fee = feeCalculationService.calculateFee(
                    String.valueOf(session.getVehicleType().getId()),
                    session.getCheckInAt(),
                    checkOutTime);

            session.setCheckOutAt(checkOutTime);
            session.setFee(fee);
            session.setStatus(SessionStatus.COMPLETED);
            parkingSessionRepository.save(session);

            ParkingSlot slot = session.getSlot();
            slot.setStatus(SlotStatus.AVAILABLE);
            parkingSlotRepository.save(slot);
        } else if (session.getStatus() == SessionStatus.UNPAID) {
            // Session đã check-out nhưng còn nợ phí: thu phí xong thì đóng thành COMPLETED.
            session.setStatus(SessionStatus.COMPLETED);
            parkingSessionRepository.save(session);
        }

        User collectedBy = authenticationService.getCurrentUser();

        Payment payment = Payment.builder()
                .session(session)
                .amount(session.getFee() != null ? session.getFee() : BigDecimal.ZERO)
                .method(request.getMethod())
                .paymentTime(LocalDateTime.now())
                .collectedBy(collectedBy)
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
                .id(payment.getId())
                .sessionId(payment.getSession().getTicketCode() != null ? payment.getSession().getTicketCode() : String.valueOf(payment.getSession().getId()))
                .amount(payment.getAmount())
                .method(payment.getMethod() != null ? payment.getMethod().name() : null)
                .paidAt(payment.getPaymentTime())
                .collectedByUsername(payment.getCollectedBy() != null ? payment.getCollectedBy().getUsername() : null)
                .build();
    }
}
