-- Baseline schema cho MySQL, sinh từ Hibernate metadata (khớp chính xác các entity).
-- Dùng cho môi trường thật (profile mặc định / MySQL) qua Flyway.
-- Môi trường dev/test dùng H2 + ddl-auto=create-drop (Flyway tắt), KHÔNG chạy file này.

create table audit_logs (actor_id bigint not null, created_at datetime(6) not null, id bigint not null auto_increment, resource_id bigint not null, action varchar(50) not null, resource varchar(50) not null, actor_username varchar(100) not null, primary key (id)) engine=InnoDB;
create table buildings (created_at datetime(6) not null, id bigint not null auto_increment, building_name varchar(150) not null, address varchar(255) not null, primary key (id)) engine=InnoDB;
create table floor_supported_vehicle_types (floor_id bigint not null, vehicle_type_id bigint not null, primary key (floor_id, vehicle_type_id)) engine=InnoDB;
create table floors (slot_count integer, building_id bigint not null, id bigint not null auto_increment, name varchar(50) not null, zone varchar(100), primary key (id)) engine=InnoDB;
create table incidents (assignee_id bigint, id bigint not null auto_increment, processing_at datetime(6), reported_at datetime(6) not null, reporter_id bigint not null, resolved_at datetime(6), session_id bigint, slot_id bigint, updated_at datetime(6), description varchar(1000) not null, resolution varchar(1000), incident_type enum ('FACILITY_ISSUE','LOST_TICKET','OVERTIME','UNPAID','VEHICLE_DAMAGE','WRONG_PLATE','WRONG_ZONE') not null, status enum ('CLOSED','IN_PROGRESS','OPEN','RESOLVED') not null, primary key (id)) engine=InnoDB;
create table parking_session_exceptions (extra_fee decimal(10,2), created_at datetime(6) not null, created_by_user_id bigint, id bigint not null auto_increment, session_id bigint not null, reason TEXT, type enum ('LOST_TICKET','OVERTIME','UNPAID','WRONG_PLATE','WRONG_ZONE') not null, primary key (id)) engine=InnoDB;
create table parking_sessions (fee decimal(12,2), check_in_at datetime(6) not null, check_out_at datetime(6), created_by_user_id bigint, id bigint not null auto_increment, reservation_id bigint, slot_id bigint not null, vehicle_type_id bigint not null, status varchar(30) not null, entry_gate varchar(50), plate_number varchar(50) not null, ticket_code varchar(100) not null, notes TEXT, primary key (id)) engine=InnoDB;
create table parking_slots (floor_id bigint not null, id bigint not null auto_increment, updated_at datetime(6), vehicle_type_id bigint not null, code varchar(50) not null, status enum ('AVAILABLE','BLOCKED','MAINTENANCE','OCCUPIED','RESERVED') not null, primary key (id)) engine=InnoDB;
create table payments (amount decimal(10,2) not null, collected_by_user_id bigint, id bigint not null auto_increment, payment_time datetime(6) not null, session_id bigint not null, method varchar(50) not null, primary key (id)) engine=InnoDB;
create table permissions (id bigint not null auto_increment, name varchar(255) not null, primary key (id)) engine=InnoDB;
create table pricing (active bit not null, lost_ticket_fee decimal(12,2), overnight_fee decimal(12,2), price decimal(12,2) not null, created_at datetime(6) not null, id bigint not null auto_increment, updated_at datetime(6), vehicle_type_id bigint not null, description varchar(255), time_unit enum ('DAILY','HOURLY','MONTHLY') not null, primary key (id)) engine=InnoDB;
create table reservations (created_at datetime(6), end_at datetime(6) not null, id bigint not null auto_increment, slot_id bigint not null, start_at datetime(6) not null, updated_at datetime(6), vehicle_type_id bigint not null, plate_number varchar(20) not null, status enum ('CANCELLED','CHECKED_IN','COMPLETED','CONFIRMED','PENDING') not null, primary key (id)) engine=InnoDB;
create table role_permissions (permission_id bigint not null, role_id bigint not null, primary key (permission_id, role_id)) engine=InnoDB;
create table roles (id bigint not null auto_increment, name varchar(50) not null, primary key (id)) engine=InnoDB;
create table system_settings (auto_block_overdue_slots bit not null, id bigint not null, updated_at datetime(6) not null, closing_time varchar(10) not null, opening_time varchar(10) not null, system_name varchar(100) not null, payment_mode enum ('CASH','CASHLESS','HYBRID') not null, primary key (id)) engine=InnoDB;
create table users (id bigint not null auto_increment, role_id bigint not null, updated_at datetime(6), phone_number varchar(20), email varchar(100) not null, username varchar(100) not null, password varchar(255) not null, status enum ('ACTIVE','INACTIVE') not null, primary key (id)) engine=InnoDB;
create table vehicle_types (capacity_unit integer, hourly_rate float(53), created_at datetime(6) not null, id bigint not null auto_increment, updated_at datetime(6), code varchar(20) not null, color varchar(20), size varchar(50), name varchar(100) not null, description varchar(255), status enum ('ACTIVE','INACTIVE') not null, primary key (id)) engine=InnoDB;

alter table buildings add constraint UKhcd3qy6ts3k9rk96p5so9koi0 unique (building_name);
alter table parking_sessions add constraint UK651lbkom35b56ygxlmk5hh3r9 unique (reservation_id);
alter table parking_sessions add constraint UK8my1m564pij0r0i0sr2dutq7x unique (ticket_code);
alter table parking_slots add constraint UK4flca1rqa7j7y4gs3fls2u76x unique (code);
alter table permissions add constraint UKpnvtwliis6p05pn6i3ndjrqt2 unique (name);
alter table pricing add constraint uq_pricing_vehicle_type_unit unique (vehicle_type_id, time_unit);
alter table roles add constraint UKofx66keruapi6vyqpv6f2or37 unique (name);
alter table users add constraint UK6dotkott2kjsp8vw4d0m25fb7 unique (email);
alter table users add constraint UKr43af9ap4edm43mmtq01oddj6 unique (username);
alter table vehicle_types add constraint uq_vehicle_type_code unique (code);
alter table vehicle_types add constraint uq_vehicle_type_name unique (name);

alter table floor_supported_vehicle_types add constraint FK3tehjt79fj9qc0jb9lgyjv5sc foreign key (vehicle_type_id) references vehicle_types (id);
alter table floor_supported_vehicle_types add constraint FK26jdysyb82a7vrxwpgiby17io foreign key (floor_id) references floors (id);
alter table floors add constraint FKdhibx5frs3cwiltccr79uks37 foreign key (building_id) references buildings (id);
alter table incidents add constraint FKhmiq51fx3iuwlvn28o2vyq4du foreign key (assignee_id) references users (id);
alter table incidents add constraint FKofcijy0t7vqdfsq7o5nmk59w1 foreign key (reporter_id) references users (id);
alter table incidents add constraint FKm9rvpkg4tl7atgd0gldlnxrp foreign key (session_id) references parking_sessions (id);
alter table incidents add constraint FKn19plpugmk6n547tckv9c0bbv foreign key (slot_id) references parking_slots (id);
alter table parking_session_exceptions add constraint FK5yirmj6cu3qc33hxpkxiixl0e foreign key (created_by_user_id) references users (id);
alter table parking_session_exceptions add constraint FKamaitkm69r88d263u8nay0pk7 foreign key (session_id) references parking_sessions (id);
alter table parking_sessions add constraint FKamv52ui6lbhujm54d1qnc35o foreign key (created_by_user_id) references users (id);
alter table parking_sessions add constraint FKp9ssgejordr55ko4o9sm34miu foreign key (reservation_id) references reservations (id);
alter table parking_sessions add constraint FKtrqvuphyoehfmvxm538kf6qyd foreign key (slot_id) references parking_slots (id);
alter table parking_sessions add constraint FKn8jg2g4xk41x59di5a5ggvavv foreign key (vehicle_type_id) references vehicle_types (id);
alter table parking_slots add constraint FKlwqj0vlq3y26h4ikgaboijwiq foreign key (floor_id) references floors (id);
alter table parking_slots add constraint FKadcsiam7o2rn32r5yx2wk7qmd foreign key (vehicle_type_id) references vehicle_types (id);
alter table payments add constraint FKfygq4xj11rd6fng3chqn6fcy7 foreign key (collected_by_user_id) references users (id);
alter table payments add constraint FKbr8q3hxwj7q3a5ratc4y5cs1n foreign key (session_id) references parking_sessions (id);
alter table pricing add constraint FKtnw6wkijanc1y5dq1jjatbv7t foreign key (vehicle_type_id) references vehicle_types (id);
alter table reservations add constraint FKa0t6epq80cb9fwefvastfqsg7 foreign key (slot_id) references parking_slots (id);
alter table reservations add constraint FK1ug6myx83o9huge49oiyh4yqn foreign key (vehicle_type_id) references vehicle_types (id);
alter table role_permissions add constraint FKegdk29eiy7mdtefy5c7eirr6e foreign key (permission_id) references permissions (id);
alter table role_permissions add constraint FKn5fotdgk8d1xvo8nav9uv3muc foreign key (role_id) references roles (id);
alter table users add constraint FKp56c1712k691lhsyewcssf40f foreign key (role_id) references roles (id);
