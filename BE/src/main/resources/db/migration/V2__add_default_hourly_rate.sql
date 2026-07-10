-- Thêm đơn giá giờ mặc định vào cấu hình hệ thống (nullable để không vỡ seed singleton).
-- Được dùng làm fallback cuối cùng khi tính phí nếu loại xe chưa có bảng giá/hourlyRate.
alter table system_settings add column default_hourly_rate decimal(12,2);
