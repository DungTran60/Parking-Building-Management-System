-- Phase 6: hoàn thiện Database (MySQL / Flyway).
-- Bao gồm: enum hóa status/method, liên kết tài khoản Driver (user_id),
-- các bảng optional (vehicles, feedbacks, slot_recommendations), index hiệu năng và CHECK constraint.
-- Môi trường dev/test (H2 + create-drop) KHÔNG chạy file này; schema sinh trực tiếp từ entity.

-- 1) Enum hóa cột status/method để khớp kiểu Hibernate sinh cho @Enumerated(STRING) trên MySQL (native ENUM).
--    Dữ liệu cũ ('ACTIVE','COMPLETED','LOST_TICKET','UNPAID',...) đều nằm trong tập enum nên không mất dữ liệu.
alter table parking_sessions
    modify column status enum('ACTIVE','COMPLETED','UNPAID','LOST_TICKET','EXPIRED') not null;
alter table payments
    modify column method enum('CASH','QR_CODE','BANK_CARD') not null;

-- 2) Liên kết tài khoản Driver cho lượt gửi xe & đặt chỗ (nullable — dữ liệu do Staff tạo có thể không gắn tài khoản).
alter table parking_sessions add column user_id bigint;
alter table reservations     add column user_id bigint;
alter table parking_sessions add constraint FK_sessions_user     foreign key (user_id) references users (id);
alter table reservations     add constraint FK_reservations_user foreign key (user_id) references users (id);

-- 3) Bảng vehicles — chuẩn hóa biển số (độc lập, không ép session/reservation tham chiếu).
create table vehicles (
    id              bigint      not null auto_increment,
    plate_number    varchar(20) not null,
    vehicle_type_id bigint      not null,
    owner_user_id   bigint,
    color           varchar(20),
    created_at      datetime(6) not null,
    updated_at      datetime(6),
    primary key (id)
) engine=InnoDB;
alter table vehicles add constraint uq_vehicle_plate_number unique (plate_number);
alter table vehicles add constraint FK_vehicles_vehicle_type foreign key (vehicle_type_id) references vehicle_types (id);
alter table vehicles add constraint FK_vehicles_owner        foreign key (owner_user_id)   references users (id);

-- 4) Bảng feedbacks — phản hồi của Driver.
create table feedbacks (
    id                   bigint       not null auto_increment,
    user_id              bigint       not null,
    session_id           bigint,
    type                 enum('LOST_TICKET','WRONG_FEE','HARD_TO_FIND','SLOT_OCCUPIED','OTHER') not null,
    content              TEXT         not null,
    status               enum('NEW','REVIEWED','RESOLVED') not null,
    response             varchar(1000),
    responded_by_user_id bigint,
    created_at           datetime(6)  not null,
    resolved_at          datetime(6),
    primary key (id)
) engine=InnoDB;
alter table feedbacks add constraint FK_feedbacks_user         foreign key (user_id)              references users (id);
alter table feedbacks add constraint FK_feedbacks_session      foreign key (session_id)           references parking_sessions (id);
alter table feedbacks add constraint FK_feedbacks_responded_by foreign key (responded_by_user_id) references users (id);

-- 5) Bảng slot_recommendations — nhật ký gợi ý phân bổ slot (heuristic).
create table slot_recommendations (
    id                  bigint      not null auto_increment,
    vehicle_type_id     bigint      not null,
    recommended_slot_id bigint,
    score               float(53),
    strategy            varchar(50),
    created_at          datetime(6) not null,
    primary key (id)
) engine=InnoDB;
alter table slot_recommendations add constraint FK_slotrec_vehicle_type foreign key (vehicle_type_id)     references vehicle_types (id);
alter table slot_recommendations add constraint FK_slotrec_slot         foreign key (recommended_slot_id) references parking_slots (id);

-- 6) Index hiệu năng cho các cột tra cứu/báo cáo tần suất cao.
create index idx_sessions_status     on parking_sessions (status);
create index idx_sessions_plate      on parking_sessions (plate_number);
create index idx_sessions_check_in   on parking_sessions (check_in_at);
create index idx_sessions_check_out  on parking_sessions (check_out_at);
create index idx_sessions_user       on parking_sessions (user_id);
create index idx_reservations_status on reservations (status);
create index idx_reservations_start  on reservations (start_at);
create index idx_reservations_end    on reservations (end_at);
create index idx_reservations_plate  on reservations (plate_number);
create index idx_reservations_user   on reservations (user_id);
create index idx_slots_status        on parking_slots (status);
create index idx_payments_time       on payments (payment_time);
create index idx_incidents_status    on incidents (status);
create index idx_incidents_type      on incidents (incident_type);
create index idx_audit_resource      on audit_logs (resource, resource_id);

-- 7) CHECK constraint bảo đảm toàn vẹn (MySQL 8.0.16+ thực thi; Hibernate validate bỏ qua).
alter table parking_sessions add constraint chk_sessions_fee_nonneg
    check (fee is null or fee >= 0);
alter table parking_sessions add constraint chk_sessions_checkout_after_checkin
    check (check_out_at is null or check_out_at >= check_in_at);
alter table payments add constraint chk_payments_amount_nonneg
    check (amount >= 0);
alter table reservations add constraint chk_reservations_time
    check (end_at > start_at);
alter table pricing add constraint chk_pricing_price_nonneg
    check (price >= 0);
