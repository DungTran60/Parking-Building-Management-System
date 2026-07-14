package com.parking.config;

import com.parking.entity.*;
import com.parking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final BuildingRepository buildingRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final FloorRepository floorRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final PasswordEncoder passwordEncoder;
    private final ParkingSessionRepository parkingSessionRepository;
    private final PaymentRepository paymentRepository;
    private final SystemSettingsRepository systemSettingsRepository;
    private final ReservationRepository reservationRepository;
    private final PricingRepository pricingRepository;
    private final IncidentRepository incidentRepository;
    private final ParkingSessionExceptionRepository parkingSessionExceptionRepository;
    private final AuditLogRepository auditLogRepository;
    private final ParkingAreaRepository parkingAreaRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Seed Permissions
        List<String> permissionNames = Arrays.asList(
                "sessions:view",
                "sessions:checkout",
                "sessions:exception",
                "users:view",
                "users:create",
                "users:edit",
                "slots:manage",
                "pricing:manage",
                "reports:view",
                "settings:manage");
        for (String permissionName : permissionNames) {
            if (permissionRepository.findByName(permissionName).isEmpty()) {
                permissionRepository.save(Permission.builder().name(permissionName).build());
            }
        }

        // Seed Roles with Permissions
        Permission view_session = permissionRepository.findByName("sessions:view").orElseThrow();
        Permission checkout_session = permissionRepository.findByName("sessions:checkout").orElseThrow();
        Permission exception_session = permissionRepository.findByName("sessions:exception").orElseThrow();
        Permission users_view = permissionRepository.findByName("users:view").orElseThrow();
        Permission users_create = permissionRepository.findByName("users:create").orElseThrow();
        Permission users_edit = permissionRepository.findByName("users:edit").orElseThrow();
        Permission slots_manage = permissionRepository.findByName("slots:manage").orElseThrow();
        Permission pricing_manage = permissionRepository.findByName("pricing:manage").orElseThrow();
        Permission reports_view = permissionRepository.findByName("reports:view").orElseThrow();
        Permission settings_manage = permissionRepository.findByName("settings:manage").orElseThrow();

        Set<Permission> driverPermissions = new HashSet<>(Collections.singletonList(view_session));
        Set<Permission> staffPermissions = new HashSet<>(
                Arrays.asList(view_session, checkout_session, exception_session, users_view));
        Set<Permission> managerPermissions = new HashSet<>(
                Arrays.asList(view_session, checkout_session, exception_session, users_view, users_create, users_edit,
                        slots_manage, reports_view));
        Set<Permission> adminPermissions = new HashSet<>(
                Arrays.asList(view_session, checkout_session, exception_session, users_view, users_create, users_edit,
                        slots_manage, pricing_manage, reports_view, settings_manage));

        seedRole("DRIVER", driverPermissions);
        seedRole("STAFF", staffPermissions);
        seedRole("MANAGER", managerPermissions);
        seedRole("ADMIN", adminPermissions);

        // Seed Admin User if not exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@parking.com")
                    .phoneNumber("0901234567")
                    .status(Status.ACTIVE)
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);
        }

        // Seed additional users
        seedUserIfNotExists("admin2", "admin456", "admin2@parking.com", "0901234568", "ADMIN");
        seedUserIfNotExists("admin3", "admin789", "admin3@parking.com", "0901234569", "ADMIN");
        seedUserIfNotExists("manager1", "manager123", "manager1@parking.com", "0912345678", "MANAGER");
        seedUserIfNotExists("manager2", "manager456", "manager2@parking.com", "0912345679", "MANAGER");
        seedUserIfNotExists("staff1", "staff123", "staff1@parking.com", "0923456789", "STAFF");
        seedUserIfNotExists("staff2", "staff456", "staff2@parking.com", "0923456780", "STAFF");
        seedUserIfNotExists("driver1", "driver123", "driver1@parking.com", "0934567891", "DRIVER");
        seedUserIfNotExists("driver2", "driver456", "driver2@parking.com", "0934567892", "DRIVER");
        seedUserIfNotExists("driver3", "driver789", "driver3@parking.com", "0934567893", "DRIVER");
        seedUserIfNotExists("driver4", "driverabc", "driver4@parking.com", "0934567894", "DRIVER");
        seedUserIfNotExists("driver5", "driverdef", "driver5@parking.com", "0934567895", "DRIVER");

        User admin = userRepository.findByUsername("admin").orElseThrow();
        User manager1 = userRepository.findByUsername("manager1").orElseThrow();
        User staff1 = userRepository.findByUsername("staff1").orElseThrow();
        User driver1 = userRepository.findByUsername("driver1").orElseThrow();
        User driver2 = userRepository.findByUsername("driver2").orElseThrow();
        User driver3 = userRepository.findByUsername("driver3").orElseThrow();

        // Seed ParkingArea
        if (parkingAreaRepository.findByAreaCode("A") == null) {
            parkingAreaRepository.save(new ParkingArea(null, "A", "Khu A - Xe máy", "Khu vực để xe máy tầng hầm", "ACTIVE"));
            parkingAreaRepository.save(new ParkingArea(null, "B", "Khu B - Ô tô", "Khu vực để ô tô tầng hầm", "ACTIVE"));
            parkingAreaRepository.save(new ParkingArea(null, "C", "Khu C - Xe lớn", "Khu vực để xe tải, xe khách", "ACTIVE"));
        }

        // Seed Building
        Building building;
        if (buildingRepository.count() == 0) {
            building = Building.builder()
                    .buildingName("Tòa nhà gửi xe trung tâm (Building A)")
                    .address("123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh")
                    .hotline("19001234")
                    .email("info@parking.com")
                    .openingTime("06:00")
                    .closingTime("22:00")
                    .description("Bãi xe trung tâm phục vụ khách hàng tòa nhà văn phòng và trung tâm thương mại")
                    .parkingRules("Không hút thuốc trong bãi xe.\nGiữ gìn vệ sinh chung.\nKhông để vật có giá trị trong xe.")
                    .paymentMode(PaymentMode.HYBRID)
                    .autoBlockOverdueSlots(true)
                    .avatarUrl("/images/buildings/default.png")
                    .build();
            building = buildingRepository.save(building);
        } else {
            building = buildingRepository.findAll().get(0);
        }

        // Seed VehicleTypes (by code to avoid duplicates)
        seedVehicleType("MOTORBIKE", "Xe máy", "Phương tiện 2 bánh", "0.8m x 2m", 1, "#2563eb", 5000.0);
        seedVehicleType("CAR", "Ô tô", "Xe ô tô thông thường", "2.5m x 5m", 3, "#16a34a", 25000.0);
        seedVehicleType("EV", "Xe điện", "Ô tô điện", "2.5m x 5m", 3, "#0891b2", 30000.0);
        seedVehicleType("TRUCK", "Xe tải", "Xe tải hạng nặng", "3m x 8m", 5, "#f59e0b", 45000.0);
        seedVehicleType("COACH", "Xe khách", "Xe khách / xe buýt", "3m x 12m", 8, "#dc2626", 60000.0);

        VehicleType motorbike = vehicleTypeRepository.findByCode("MOTORBIKE").orElse(null);
        VehicleType car = vehicleTypeRepository.findByCode("CAR").orElse(null);
        VehicleType ev = vehicleTypeRepository.findByCode("EV").orElse(null);
        VehicleType truck = vehicleTypeRepository.findByCode("TRUCK").orElse(null);
        VehicleType coach = vehicleTypeRepository.findByCode("COACH").orElse(null);

        // Seed Pricing for each vehicle type
        if (pricingRepository.findByVehicleTypeIdAndActiveTrue(motorbike.getId()).isEmpty()) {
            seedPricing(motorbike, PricingTimeUnit.HOURLY, new BigDecimal("5000"), BigDecimal.ZERO, BigDecimal.ZERO);
            seedPricing(motorbike, PricingTimeUnit.DAILY, new BigDecimal("30000"), BigDecimal.ZERO, BigDecimal.ZERO);
            seedPricing(motorbike, PricingTimeUnit.MONTHLY, new BigDecimal("200000"), BigDecimal.ZERO, BigDecimal.ZERO);
            seedPricing(car, PricingTimeUnit.HOURLY, new BigDecimal("25000"), new BigDecimal("50000"), new BigDecimal("100000"));
            seedPricing(car, PricingTimeUnit.DAILY, new BigDecimal("150000"), new BigDecimal("50000"), new BigDecimal("100000"));
            seedPricing(car, PricingTimeUnit.MONTHLY, new BigDecimal("1200000"), new BigDecimal("50000"), new BigDecimal("100000"));
            seedPricing(ev, PricingTimeUnit.HOURLY, new BigDecimal("30000"), new BigDecimal("60000"), new BigDecimal("120000"));
            seedPricing(ev, PricingTimeUnit.DAILY, new BigDecimal("180000"), new BigDecimal("60000"), new BigDecimal("120000"));
            seedPricing(ev, PricingTimeUnit.MONTHLY, new BigDecimal("1500000"), new BigDecimal("60000"), new BigDecimal("120000"));
            seedPricing(truck, PricingTimeUnit.HOURLY, new BigDecimal("45000"), new BigDecimal("80000"), new BigDecimal("150000"));
            seedPricing(truck, PricingTimeUnit.DAILY, new BigDecimal("270000"), new BigDecimal("80000"), new BigDecimal("150000"));
            seedPricing(truck, PricingTimeUnit.MONTHLY, new BigDecimal("2500000"), new BigDecimal("80000"), new BigDecimal("150000"));
            seedPricing(coach, PricingTimeUnit.HOURLY, new BigDecimal("60000"), new BigDecimal("100000"), new BigDecimal("200000"));
            seedPricing(coach, PricingTimeUnit.DAILY, new BigDecimal("360000"), new BigDecimal("100000"), new BigDecimal("200000"));
            seedPricing(coach, PricingTimeUnit.MONTHLY, new BigDecimal("3000000"), new BigDecimal("100000"), new BigDecimal("200000"));
        }

        // Seed Floors
        if (floorRepository.count() == 0) {
            Floor f1 = Floor.builder().building(building).name("B1").zone("Motorbike A").slotCount(180)
                    .supportedVehicleTypes(new HashSet<>(Collections.singletonList(motorbike))).build();
            Floor f2 = Floor.builder().building(building).name("B2").zone("Car B").slotCount(120)
                    .supportedVehicleTypes(new HashSet<>(Arrays.asList(car, ev))).build();
            Floor f3 = Floor.builder().building(building).name("L1").zone("Mixed C").slotCount(96)
                    .supportedVehicleTypes(new HashSet<>(Arrays.asList(car, truck))).build();
            Floor f4 = Floor.builder().building(building).name("L2").zone("Coach D").slotCount(52)
                    .supportedVehicleTypes(new HashSet<>(Arrays.asList(coach, truck))).build();
            floorRepository.saveAll(Arrays.asList(f1, f2, f3, f4));
        }

        // Seed Slots
        if (parkingSlotRepository.count() == 0) {
            List<Floor> dbFloors = floorRepository.findAll();
            List<ParkingSlot> slotsToSave = new ArrayList<>();
            SlotStatus[] statuses = SlotStatus.values();

            for (int i = 0; i < 80; i++) {
                Floor floor = dbFloors.get(i % dbFloors.size());
                List<VehicleType> supported = new ArrayList<>(floor.getSupportedVehicleTypes());
                VehicleType type = supported.get(i % supported.size());
                SlotStatus status = statuses[i % statuses.length];
                if (status == SlotStatus.RESERVED) status = SlotStatus.AVAILABLE;

                ParkingSlot slot = ParkingSlot.builder()
                        .code(floor.getName() + "-" + String.format("%03d", i + 1))
                        .floor(floor)
                        .vehicleType(type)
                        .status(status)
                        .build();
                slotsToSave.add(slot);
            }
            parkingSlotRepository.saveAll(slotsToSave);
        }

        List<ParkingSlot> allSlots = parkingSlotRepository.findAll();

        // Seed Reservations
        if (reservationRepository.count() == 0 && allSlots.size() >= 5) {
            LocalDateTime now = LocalDateTime.now();
            ParkingSlot slot1 = allSlots.get(0);
            ParkingSlot slot2 = allSlots.get(1);
            ParkingSlot slot3 = allSlots.get(3);
            ParkingSlot slot4 = allSlots.get(4);

            Reservation r1 = Reservation.builder()
                    .plateNumber("51G-12345")
                    .vehicleType(car)
                    .slot(slot1)
                    .driver(driver1)
                    .startAt(now.plusDays(1).withHour(8).withMinute(0))
                    .endAt(now.plusDays(1).withHour(12).withMinute(0))
                    .status(ReservationStatus.CONFIRMED)
                    .build();
            Reservation r2 = Reservation.builder()
                    .plateNumber("51G-67890")
                    .vehicleType(ev)
                    .slot(slot2)
                    .driver(driver2)
                    .startAt(now.plusDays(1).withHour(13).withMinute(0))
                    .endAt(now.plusDays(1).withHour(17).withMinute(0))
                    .status(ReservationStatus.CONFIRMED)
                    .build();
            Reservation r3 = Reservation.builder()
                    .plateNumber("51G-54321")
                    .vehicleType(motorbike)
                    .slot(slot3)
                    .driver(driver3)
                    .startAt(now.plusDays(2).withHour(9).withMinute(0))
                    .endAt(now.plusDays(2).withHour(11).withMinute(0))
                    .status(ReservationStatus.PENDING)
                    .build();
            Reservation r4 = Reservation.builder()
                    .plateNumber("51G-09876")
                    .vehicleType(car)
                    .slot(slot4)
                    .driver(driver1)
                    .startAt(now.minusDays(1).withHour(10).withMinute(0))
                    .endAt(now.minusDays(1).withHour(14).withMinute(0))
                    .status(ReservationStatus.COMPLETED)
                    .build();
            reservationRepository.saveAll(Arrays.asList(r1, r2, r3, r4));
        }

        // Seed Sessions and Payments
        if (parkingSessionRepository.count() == 0) {
            List<ParkingSlot> slots = parkingSlotRepository.findAll();
            Random random = new Random();
            List<ParkingSession> sessionsToSave = new ArrayList<>();
            List<Payment> paymentsToSave = new ArrayList<>();
            List<ParkingSessionException> exceptionsToSave = new ArrayList<>();

            // Seed completed sessions & payments for the last 14 days
            for (int dayOffset = 14; dayOffset >= 0; dayOffset--) {
                LocalDate date = LocalDate.now().minusDays(dayOffset);
                int dailyCount = 3 + random.nextInt(5);
                for (int j = 0; j < dailyCount; j++) {
                    ParkingSlot slot = slots.get(random.nextInt(slots.size()));
                    VehicleType type = slot.getVehicleType();

                    int entryHour = 7 + random.nextInt(12);
                    int entryMinute = random.nextInt(60);
                    LocalDateTime entryTime = date.atTime(entryHour, entryMinute);

                    int durationHours = 1 + random.nextInt(8);
                    LocalDateTime exitTime = entryTime.plusHours(durationHours).plusMinutes(random.nextInt(60));

                    if (exitTime.isAfter(LocalDateTime.now())) {
                        continue;
                    }

                    double fee = type.getHourlyRate() * durationHours;
                    String ticketCode = "TKT-" + date.toString().replace("-", "") + "-"
                            + String.format("%04d", random.nextInt(10000));
                    String plateNumber = "51G-" + String.format("%05d", 10000 + random.nextInt(90000));

                    User randomDriver = Arrays.asList(driver1, driver2, driver3).get(random.nextInt(3));

                    ParkingSession session = ParkingSession.builder()
                            .ticketCode(ticketCode)
                            .plateNumber(plateNumber)
                            .vehicleType(type)
                            .slot(slot)
                            .entryGate("Gate " + (1 + random.nextInt(3)))
                            .checkInAt(entryTime)
                            .checkOutAt(exitTime)
                            .fee(fee)
                            .status("COMPLETED")
                            .driver(randomDriver)
                            .build();

                    sessionsToSave.add(session);
                }
            }

            List<ParkingSession> savedSessions = parkingSessionRepository.saveAll(sessionsToSave);

            // Create payment records for completed sessions
            String[] methods = { "CASH", "QR_CODE", "BANK_CARD" };
            int sessionIndex = 0;
            for (ParkingSession session : savedSessions) {
                Payment payment = Payment.builder()
                        .session(session)
                        .amount(BigDecimal.valueOf(session.getFee()))
                        .method(methods[random.nextInt(methods.length)])
                        .paymentTime(session.getCheckOutAt().plusMinutes(1 + random.nextInt(5)))
                        .build();
                paymentsToSave.add(payment);

                // Add a few exceptions to some sessions
                if (sessionIndex % 7 == 0) {
                    ParkingSessionException exception = ParkingSessionException.builder()
                            .session(session)
                            .type(SessionExceptionType.OVERTIME)
                            .reason("Xe quá giờ gửi " + random.nextInt(60) + " phút")
                            .extraFee(new BigDecimal(random.nextInt(5) + 1).multiply(new BigDecimal("10000")))
                            .createdBy(staff1)
                            .build();
                    exceptionsToSave.add(exception);
                }
                sessionIndex++;
            }
            paymentRepository.saveAll(paymentsToSave);
            parkingSessionExceptionRepository.saveAll(exceptionsToSave);

            // Seed a few ACTIVE sessions (currently parked cars)
            int activeCount = 5;
            for (int k = 0; k < activeCount; k++) {
                ParkingSlot slot = slots.stream()
                        .filter(s -> s.getStatus() == SlotStatus.AVAILABLE)
                        .findFirst()
                        .orElse(slots.get(random.nextInt(slots.size())));

                slot.setStatus(SlotStatus.OCCUPIED);
                parkingSlotRepository.save(slot);

                LocalDateTime entryTime = LocalDateTime.now().minusHours(1 + random.nextInt(5));
                String ticketCode = "TKT-ACT-" + String.format("%04d", random.nextInt(10000));
                String plateNumber = "51A-" + String.format("%05d", 10000 + random.nextInt(90000));

                User randomDriver = Arrays.asList(driver1, driver2, driver3).get(random.nextInt(3));

                ParkingSession activeSession = ParkingSession.builder()
                        .ticketCode(ticketCode)
                        .plateNumber(plateNumber)
                        .vehicleType(slot.getVehicleType())
                        .slot(slot)
                        .entryGate("Gate " + (1 + random.nextInt(3)))
                        .checkInAt(entryTime)
                        .fee(0.0)
                        .status("ACTIVE")
                        .driver(randomDriver)
                        .build();
                parkingSessionRepository.save(activeSession);
            }
        }

        // Seed Incidents
        if (incidentRepository.count() == 0) {
            List<ParkingSession> completedSessions = parkingSessionRepository.findByStatusAndCheckOutAtBetween(
                    "COMPLETED", LocalDateTime.now().minusDays(14), LocalDateTime.now());
            List<ParkingSlot> slots = parkingSlotRepository.findAll();

            if (!completedSessions.isEmpty() && slots.size() >= 3) {
                Incident inc1 = Incident.builder()
                        .reporter(staff1)
                        .session(completedSessions.get(0))
                        .assignee(manager1)
                        .slot(slots.get(0))
                        .type(IncidentType.LOST_TICKET)
                        .description("Khách hàng báo mất vé gửi xe, biển số " + completedSessions.get(0).getPlateNumber())
                        .resolution("Đã tra cứu thông tin qua biển số và xác nhận. Thu phí mất vé 100,000 VNĐ.")
                        .status(IncidentStatus.RESOLVED)
                        .resolvedAt(LocalDateTime.now().minusDays(1))
                        .build();
                incidentRepository.save(inc1);

                if (completedSessions.size() > 3) {
                    Incident inc2 = Incident.builder()
                            .reporter(staff1)
                            .session(completedSessions.get(3))
                            .assignee(staff1)
                            .slot(slots.get(1))
                            .type(IncidentType.WRONG_ZONE)
                            .description("Xe ô tô gửi nhầm sang khu vực xe máy")
                            .status(IncidentStatus.IN_PROGRESS)
                            .processingAt(LocalDateTime.now())
                            .build();
                    incidentRepository.save(inc2);
                }

                Incident inc3 = Incident.builder()
                        .reporter(admin)
                        .assignee(manager1)
                        .slot(slots.get(2))
                        .type(IncidentType.FACILITY_ISSUE)
                        .description("Đèn chiếu sáng khu B1 bị hỏng, cần sửa chữa gấp")
                        .status(IncidentStatus.OPEN)
                        .build();
                incidentRepository.save(inc3);
            }
        }

        // Seed AuditLogs (only if no LOGIN events exist — keeps demo data even if other audit records accumulated)
        if (auditLogRepository.countByAction("LOGIN") == 0) {
            LocalDateTime now = LocalDateTime.now();
            List<AuditLog> logs = Arrays.asList(
                    AuditLog.builder().action("LOGIN").resource("AUTH").resourceId(1L).actorId(admin.getId()).actorUsername("admin").ipAddress("192.168.1.100").userAgent("Mozilla/5.0 Chrome/120").createdAt(now.minusHours(2)).build(),
                    AuditLog.builder().action("LOGIN_FAILED").resource("AUTH").resourceId(1L).actorId(admin.getId()).actorUsername("admin").ipAddress("192.168.1.100").userAgent("Mozilla/5.0 Chrome/120").createdAt(now.minusHours(3)).build(),
                    AuditLog.builder().action("LOGOUT").resource("AUTH").resourceId(1L).actorId(admin.getId()).actorUsername("admin").ipAddress("192.168.1.100").userAgent("Mozilla/5.0 Chrome/120").createdAt(now.minusHours(1)).build(),
                    AuditLog.builder().action("LOGIN").resource("AUTH").resourceId(1L).actorId(admin.getId()).actorUsername("admin").ipAddress("192.168.1.100").userAgent("Mozilla/5.0 Chrome/120").createdAt(now.minusDays(1)).build(),
                    AuditLog.builder().action("LOGIN").resource("AUTH").resourceId(1L).actorId(admin.getId()).actorUsername("admin2").ipAddress("10.0.0.50").userAgent("Mozilla/5.0 Firefox/121").createdAt(now.minusDays(1).withHour(14)).build(),
                    AuditLog.builder().action("LOGIN_FAILED").resource("AUTH").resourceId(1L).actorId(admin.getId()).actorUsername("unknown").ipAddress("203.0.113.42").userAgent("curl/7.88").createdAt(now.minusDays(2)).build(),
                    AuditLog.builder().action("CREATE_USER").resource("USER").resourceId(driver1.getId()).actorId(admin.getId()).actorUsername("admin").createdAt(now.minusDays(2)).build(),
                    AuditLog.builder().action("CREATE_USER").resource("USER").resourceId(driver2.getId()).actorId(admin.getId()).actorUsername("admin").createdAt(now.minusDays(2)).build(),
                    AuditLog.builder().action("CHECK_IN").resource("SESSION").resourceId(1L).actorId(staff1.getId()).actorUsername("staff1").createdAt(now.minusDays(3)).build(),
                    AuditLog.builder().action("CHECK_OUT").resource("SESSION").resourceId(2L).actorId(staff1.getId()).actorUsername("staff1").createdAt(now.minusDays(1)).build(),
                    AuditLog.builder().action("UPDATE_SETTINGS").resource("SETTINGS").resourceId(1L).actorId(admin.getId()).actorUsername("admin").createdAt(now.minusDays(7)).build()
            );
            auditLogRepository.saveAll(logs);
        }

        // Seed default System Settings (singleton)
        if (systemSettingsRepository.count() == 0) {
            systemSettingsRepository.save(
                    SystemSettings.builder()
                            .id(1L)
                            .systemName("Parking Building Management")
                            .timezone("Asia/Ho_Chi_Minh")
                            .dateFormat("dd/MM/yyyy")
                            .themeColor("#2563eb")
                            .passwordPolicy("medium")
                            .sessionTimeout(30)
                            .logoUrl("/logo.png")
                            .version("1.0.0")
                            .build());
        }
    }

    private void seedPricing(VehicleType vehicleType, PricingTimeUnit timeUnit, BigDecimal price, BigDecimal overnightFee, BigDecimal lostTicketFee) {
        if (pricingRepository.findByVehicleTypeIdAndTimeUnit(vehicleType.getId(), timeUnit).isEmpty()) {
            pricingRepository.save(
                    Pricing.builder()
                            .vehicleType(vehicleType)
                            .timeUnit(timeUnit)
                            .price(price)
                            .overnightFee(overnightFee)
                            .lostTicketFee(lostTicketFee)
                            .active(true)
                            .build());
        }
    }

    private void seedVehicleType(String code, String name, String description,
            String size, int capacityUnit, String color, double hourlyRate) {
        if (vehicleTypeRepository.findByCode(code).isEmpty()) {
            vehicleTypeRepository.save(
                    VehicleType.builder()
                            .code(code)
                            .name(name)
                            .description(description)
                            .status(VehicleTypeStatus.ACTIVE)
                            .size(size)
                            .capacityUnit(capacityUnit)
                            .color(color)
                            .hourlyRate(hourlyRate)
                            .build());
        }
    }

    private void seedUserIfNotExists(String username, String rawPassword, String email, String phoneNumber, String roleName) {
        if (userRepository.findByUsername(username).isEmpty()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException(roleName + " role not found"));
            userRepository.save(User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPassword))
                    .email(email)
                    .phoneNumber(phoneNumber)
                    .status(Status.ACTIVE)
                    .role(role)
                    .build());
        }
    }

    private void seedRole(String roleName, Set<Permission> permissions) {
        Optional<Role> existingRole = roleRepository.findByName(roleName);
        Role role;
        if (existingRole.isEmpty()) {
            role = Role.builder().name(roleName).permissions(permissions).build();
        } else {
            role = existingRole.get();
            role.setPermissions(permissions);
        }
        roleRepository.save(role);
    }
}
