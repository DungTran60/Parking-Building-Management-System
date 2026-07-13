package com.parking.service;

import com.parking.dto.PaymentRequestDto;
import com.parking.dto.PaymentResponseDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.entity.SlotStatus;
import com.parking.entity.User;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import com.parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final PricingService pricingService;
    private final UserRepository userRepository;

    /** Resolve User hiện tại từ Principal */
    private User getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getName()));
    }

    private boolean isDriver(User user) {
        return user.getRole() != null && "DRIVER".equalsIgnoreCase(user.getRole().getName());
    }

    @Override
    @Transactional
    public PaymentResponseDto createPayment(PaymentRequestDto request, Principal principal) {
        ParkingSession session = parkingSessionRepository.findById(Long.valueOf(request.getSessionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + request.getSessionId()));

        // Driver chỉ thanh toán được lượt của chính mình; Staff/Manager/Admin thu hộ mọi lượt
        User currentUser = getCurrentUser(principal);
        if (isDriver(currentUser) && (session.getDriver() == null || !session.getDriver().getId().equals(currentUser.getId()))) {
            throw new AccessDeniedException("Bạn không có quyền thanh toán lượt gửi này.");
        }

        // Tính phí và đóng session nếu chưa thanh toán (workflow §5.1 step 8-9)
        if ("ACTIVE".equals(session.getStatus()) || "UNPAID".equals(session.getStatus())) {
            LocalDateTime checkOutTime = LocalDateTime.now();
            double fee = pricingService.calculateOvernightFee(
                    session.getCheckInAt(),
                    checkOutTime,
                    String.valueOf(session.getVehicleType().getId())
            ).getTotal().doubleValue();

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
                .amount(BigDecimal.valueOf(session.getFee()))
                .method(request.getMethod())
                .paymentTime(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);
        return convertToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentHistory(Principal principal) {
        User currentUser = getCurrentUser(principal);
        List<Payment> payments = isDriver(currentUser)
                ? paymentRepository.findBySessionDriverIdOrderByPaymentTimeDesc(currentUser.getId())
                : paymentRepository.findAllByOrderByPaymentTimeDesc();
        return payments.stream()
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
