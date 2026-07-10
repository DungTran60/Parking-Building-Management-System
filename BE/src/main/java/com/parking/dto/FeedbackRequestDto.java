package com.parking.dto;

import com.parking.entity.FeedbackType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO gửi phản hồi từ Driver.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRequestDto {

    @NotNull(message = "Feedback type is required")
    private FeedbackType type;

    @NotBlank(message = "Content is required")
    private String content;

    /** Lượt gửi xe liên quan (tùy chọn). */
    private Long sessionId;
}
