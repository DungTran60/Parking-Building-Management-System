package com.parking.controller;

import com.parking.dto.FeedbackRequestDto;
import com.parking.dto.FeedbackResponseDto;
import com.parking.entity.FeedbackStatus;
import com.parking.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * POST /api/feedback
     * Khách hàng tạo feedback cho lượt gửi xe đã hoàn thành.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeedbackResponseDto> createFeedback(
            @Valid @RequestBody FeedbackRequestDto dto,
            Principal principal) {
        FeedbackResponseDto created = feedbackService.createFeedback(dto, principal.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * GET /api/feedback/{id}
     * Lấy chi tiết một feedback theo ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeedbackResponseDto> getFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedback(id));
    }

    /**
     * GET /api/feedback
     * Admin xem toàn bộ feedback. Query param ?status=PENDING|APPROVED|REJECTED để lọc.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponseDto>> getAllFeedback(
            @RequestParam(required = false) FeedbackStatus status) {
        List<FeedbackResponseDto> result = status != null
                ? feedbackService.getFeedbackByStatus(status)
                : feedbackService.getAllFeedback();
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/feedback/my
     * Khách hàng xem feedback của chính mình.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FeedbackResponseDto>> getMyFeedback(Principal principal) {
        return ResponseEntity.ok(feedbackService.getCustomerFeedback(principal.getName()));
    }

    /**
     * PUT /api/feedback/{id}
     * Admin cập nhật nội dung feedback.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponseDto> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequestDto dto) {
        return ResponseEntity.ok(feedbackService.updateFeedback(id, dto));
    }

    /**
     * PATCH /api/feedback/{id}/approve
     * Admin duyệt feedback.
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponseDto> approveFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.approveFeedback(id));
    }

    /**
     * PATCH /api/feedback/{id}/reject
     * Admin từ chối feedback.
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponseDto> rejectFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.rejectFeedback(id));
    }

    /**
     * DELETE /api/feedback/{id}
     * Admin xóa feedback không phù hợp.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
