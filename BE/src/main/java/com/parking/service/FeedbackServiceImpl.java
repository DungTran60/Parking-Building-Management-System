package com.parking.service;

import com.parking.dto.FeedbackRequestDto;
import com.parking.dto.FeedbackResolveDto;
import com.parking.dto.FeedbackResponseDto;
import com.parking.entity.Feedback;
import com.parking.entity.FeedbackStatus;
import com.parking.entity.ParkingSession;
import com.parking.entity.User;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.FeedbackRepository;
import com.parking.repository.ParkingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final AuthenticationService authenticationService;

    @Override
    @Transactional
    public FeedbackResponseDto createFeedback(FeedbackRequestDto dto) {
        User currentUser = requireCurrentUser();

        ParkingSession session = null;
        if (dto.getSessionId() != null) {
            session = parkingSessionRepository.findById(dto.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy lượt gửi xe với ID: " + dto.getSessionId()));
        }

        Feedback feedback = Feedback.builder()
                .user(currentUser)
                .session(session)
                .type(dto.getType())
                .content(dto.getContent())
                .status(FeedbackStatus.NEW)
                .build();
        return mapToResponse(feedbackRepository.save(feedback));
    }

    @Override
    public List<FeedbackResponseDto> getMyFeedbacks() {
        User currentUser = requireCurrentUser();
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<FeedbackResponseDto> getAllFeedbacks(FeedbackStatus status) {
        List<Feedback> feedbacks = (status != null)
                ? feedbackRepository.findByStatusOrderByCreatedAtDesc(status)
                : feedbackRepository.findAllByOrderByCreatedAtDesc();
        return feedbacks.stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional
    public FeedbackResponseDto resolveFeedback(Long id, FeedbackResolveDto dto) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phản hồi với ID: " + id));

        feedback.setResponse(dto.getResponse());
        feedback.setRespondedBy(authenticationService.getCurrentUser());
        FeedbackStatus newStatus = dto.getStatus() != null ? dto.getStatus() : FeedbackStatus.RESOLVED;
        feedback.setStatus(newStatus);
        if (newStatus == FeedbackStatus.RESOLVED) {
            feedback.setResolvedAt(LocalDateTime.now());
        }
        return mapToResponse(feedbackRepository.save(feedback));
    }

    /* ───────────────── Helpers ───────────────── */

    private User requireCurrentUser() {
        User currentUser = authenticationService.getCurrentUser();
        if (currentUser == null) {
            throw new BadRequestException("Không xác định được người dùng hiện tại.");
        }
        return currentUser;
    }

    private FeedbackResponseDto mapToResponse(Feedback f) {
        return FeedbackResponseDto.builder()
                .id(f.getId())
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .username(f.getUser() != null ? f.getUser().getUsername() : null)
                .sessionId(f.getSession() != null ? f.getSession().getId() : null)
                .type(f.getType() != null ? f.getType().name() : null)
                .content(f.getContent())
                .status(f.getStatus() != null ? f.getStatus().name() : null)
                .response(f.getResponse())
                .respondedByUsername(f.getRespondedBy() != null ? f.getRespondedBy().getUsername() : null)
                .createdAt(f.getCreatedAt())
                .resolvedAt(f.getResolvedAt())
                .build();
    }
}
