package com.parking.controller;

import com.parking.dto.FeedbackRequestDto;
import com.parking.dto.FeedbackResolveDto;
import com.parking.dto.FeedbackResponseDto;
import com.parking.entity.FeedbackStatus;
import com.parking.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller cho phản hồi của Driver (Feedback Module).
 */
@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    /** Driver gửi phản hồi mới. */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeedbackResponseDto> create(@Valid @RequestBody FeedbackRequestDto dto) {
        return new ResponseEntity<>(feedbackService.createFeedback(dto), HttpStatus.CREATED);
    }

    /** Phản hồi của chính tài khoản đang đăng nhập. */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FeedbackResponseDto>> getMine() {
        return ResponseEntity.ok(feedbackService.getMyFeedbacks());
    }

    /** Manager/Admin xem toàn bộ phản hồi (tùy chọn lọc theo trạng thái). */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<FeedbackResponseDto>> getAll(
            @RequestParam(required = false) FeedbackStatus status) {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks(status));
    }

    /** Manager/Admin xử lý & phản hồi lại. */
    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<FeedbackResponseDto> resolve(
            @PathVariable Long id, @Valid @RequestBody FeedbackResolveDto dto) {
        return ResponseEntity.ok(feedbackService.resolveFeedback(id, dto));
    }
}
