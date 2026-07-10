package com.parking.dto;

import com.parking.entity.FeedbackStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO xử lý/phản hồi lại một feedback (dành cho Manager/Admin).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResolveDto {

    @NotBlank(message = "Response is required")
    private String response;

    /** Trạng thái mới (tùy chọn — mặc định RESOLVED nếu để trống). */
    private FeedbackStatus status;
}
