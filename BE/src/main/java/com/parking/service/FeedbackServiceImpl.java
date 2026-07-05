package com.parking.service;

import com.parking.dto.FeedbackRequestDto;
import com.parking.dto.FeedbackResponseDto;
import com.parking.entity.*;
import com.parking.exception.ResourceConflictException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository    feedbackRepository;
    private final UserRepository        userRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final PaymentRepository     paymentRepository;

    /* ─────────────────────────────────────────────────────
       Khách hàng tạo feedback
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public FeedbackResponseDto createFeedback(FeedbackRequestDto dto, String username) {
        // 1. Lấy thông tin khách hàng từ username
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // 2. Lấy ParkingSession
        ParkingSession session = parkingSessionRepository.findById(dto.getParkingSessionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parking session not found with ID: " + dto.getParkingSessionId()));

        // 3. Session phải COMPLETED
        if (!"COMPLETED".equals(session.getStatus())) {
            throw new IllegalArgumentException(
                    "Feedback can only be submitted for COMPLETED parking sessions");
        }

        // 4. Không cho phép feedback trùng lặp
        if (feedbackRepository.existsBySessionId(session.getId())) {
            throw new ResourceConflictException(
                    "Feedback already exists for parking session ID: " + session.getId());
        }

        // 5. Payment (optional)
        Payment payment = null;
        if (dto.getPaymentId() != null) {
            payment = paymentRepository.findById(dto.getPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Payment not found with ID: " + dto.getPaymentId()));
        }

        // 6. Tạo và lưu
        Feedback feedback = Feedback.builder()
                .customer(customer)
                .session(session)
                .payment(payment)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .status(FeedbackStatus.PENDING)
                .build();

        return mapToResponse(feedbackRepository.save(feedback));
    }

    /* ─────────────────────────────────────────────────────
       Lấy theo ID
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public FeedbackResponseDto getFeedback(Long id) {
        return mapToResponse(findOrThrow(id));
    }

    /* ─────────────────────────────────────────────────────
       Admin lấy tất cả
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Admin lọc theo status
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getFeedbackByStatus(FeedbackStatus status) {
        return feedbackRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Khách hàng xem feedback của mình
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getCustomerFeedback(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return feedbackRepository.findByCustomerId(customer.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────
       Admin cập nhật feedback
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public FeedbackResponseDto updateFeedback(Long id, FeedbackRequestDto dto) {
        Feedback feedback = findOrThrow(id);
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        return mapToResponse(feedbackRepository.save(feedback));
    }

    /* ─────────────────────────────────────────────────────
       Admin duyệt
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public FeedbackResponseDto approveFeedback(Long id) {
        Feedback feedback = findOrThrow(id);
        if (feedback.getStatus() == FeedbackStatus.APPROVED) {
            throw new IllegalArgumentException("Feedback is already APPROVED");
        }
        feedback.setStatus(FeedbackStatus.APPROVED);
        return mapToResponse(feedbackRepository.save(feedback));
    }

    /* ─────────────────────────────────────────────────────
       Admin từ chối
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public FeedbackResponseDto rejectFeedback(Long id) {
        Feedback feedback = findOrThrow(id);
        if (feedback.getStatus() == FeedbackStatus.REJECTED) {
            throw new IllegalArgumentException("Feedback is already REJECTED");
        }
        feedback.setStatus(FeedbackStatus.REJECTED);
        return mapToResponse(feedbackRepository.save(feedback));
    }

    /* ─────────────────────────────────────────────────────
       Admin xóa
    ───────────────────────────────────────────────────── */
    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback not found with ID: " + id);
        }
        feedbackRepository.deleteById(id);
    }

    /* ─────────────────────────────────────────────────────
       Helpers
    ───────────────────────────────────────────────────── */
    private Feedback findOrThrow(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + id));
    }

    private FeedbackResponseDto mapToResponse(Feedback f) {
        return FeedbackResponseDto.builder()
                .id(f.getId())
                .customerId(f.getCustomer().getId())
                .customerName(f.getCustomer().getUsername())
                .parkingSessionId(f.getSession().getId())
                .ticketCode(f.getSession().getTicketCode())
                .paymentId(f.getPayment() != null ? f.getPayment().getId() : null)
                .rating(f.getRating())
                .comment(f.getComment())
                .status(f.getStatus())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
