package com.parking.service;

import com.parking.dto.PaymentRequestDto;
import com.parking.dto.PaymentResponseDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.entity.SlotStatus;
import com.parking.entity.User;
import com.parking.exception.ConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSessionExceptionRepository;
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
    private final AuditService auditService;
    private final ParkingSessionExceptionRepository parkingSessionExceptionRepository;

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

        // Driver chỉ thanh toán được lượt của chính mình (session phải có driver_id khớp).
        // Session walk-in (driver=null) chỉ Staff/Manager/Admin mới thu phí được.
        User currentUser = getCurrentUser(principal);
        if (isDriver(currentUser)) {
            if (session.getDriver() == null) {
                throw new AccessDeniedException(
                        "Lượt gửi xe này được check-in tại quầy (walk-in) và chưa liên kết tài khoản. " +
                        "Vui lòng thanh toán tại quầy hoặc nhờ nhân viên hỗ trợ.");
            }
            if (!session.getDriver().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Bạn không có quyền thanh toán lượt gửi này.");
            }
        }

        // Guard: chỉ cho phép thanh toán khi session ở trạng thái có thể thu phí
        String status = session.getStatus();
        if ("COMPLETED".equals(status)) {
            throw new ConflictException("Lượt gửi xe này đã hoàn thành thanh toán, không thể thu phí lại.");
        }
        if (!"ACTIVE".equals(status) && !"PENDING_PAYMENT".equals(status) && !"UNPAID".equals(status)) {
            throw new ConflictException("Lượt gửi xe không ở trạng thái có thể thanh toán: " + status);
        }

        // Tính phí: phí giờ + tổng phụ phí từ các ngoại lệ đã ghi nhận (workflow §5.1 step 8-9)
        LocalDateTime checkOutTime = LocalDateTime.now();
        double baseFee = pricingService.calculateOvernightFee(
                session.getCheckInAt(),
                checkOutTime,
                String.valueOf(session.getVehicleType().getId())
        ).getTotal().doubleValue();
        double exceptionFees = parkingSessionExceptionRepository
                .sumExtraFeeBySessionId(session.getId())
                .doubleValue();
        double fee = baseFee + exceptionFees;

        session.setCheckOutAt(checkOutTime);
        session.setFee(fee);
        session.setStatus("COMPLETED");
        parkingSessionRepository.save(session);

        ParkingSlot slot = session.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);

        Payment payment = Payment.builder()
                .session(session)
                .amount(BigDecimal.valueOf(session.getFee()))
                .method(request.getMethod())
                .paymentTime(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);
        auditService.log("PAYMENT", "SESSION", session.getId(), currentUser.getId(), currentUser.getUsername());
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
        ParkingSession session = payment.getSession();
        return PaymentResponseDto.builder()
                .id(String.valueOf(payment.getId()))
                .sessionId(session.getTicketCode() != null ? session.getTicketCode() : String.valueOf(session.getId()))
                .plateNumber(session.getPlateNumber())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .paidAt(payment.getPaymentTime())
                .build();
    }
}
