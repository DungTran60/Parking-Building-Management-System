package com.parking.config;

import com.parking.entity.*;
import com.parking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
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
    private final Environment environment;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.email:admin@parking.com}")
    private String adminEmail;

    @Value("${app.manager.username:manager}")
    private String managerUsername;

    @Value("${app.manager.password:Manager@123}")
    private String managerPassword;

    @Value("${app.manager.email:manager@parking.com}")
    private String managerEmail;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Bảo mật: chặn khởi động ở môi trường thật (không phải dev/test) nếu admin còn dùng mật khẩu mặc định.
        guardAdminPassword();

        // Seed Permissions
        List<String> permissionNames = Arrays.asList(
                "sessions:view",
                "sessions:checkout",
                "sessions:exception",
                "sessions:manage"
        );
        for (String permissionName : permissionNames) {
            if (permissionRepository.findByName(permissionName).isEmpty()) {
                permissionRepository.save(Permission.builder().name(permissionName).build());
            }
        }

        // Seed Roles with Permissions
        Permission view_session = permissionRepository.findByName("sessions:view").orElseThrow();
        Permission checkout_session = permissionRepository.findByName("sessions:checkout").orElseThrow();
        Permission exception_session = permissionRepository.findByName("sessions:exception").orElseThrow();
        Permission manage_session = permissionRepository.findByName("sessions:manage").orElseThrow();

        // Driver: chỉ xem lượt gửi.
        Set<Permission> driverPermissions = new HashSet<>(Collections.singletonList(view_session));
        // Staff: xem, check-in/out, xử lý ngoại lệ.
        Set<Permission> staffPermissions = new HashSet<>(Arrays.asList(view_session, checkout_session, exception_session));
        // Manager: quyền của Staff + quản lý session (updateStatus/reopen/mark-unpaid/waive-fee/note).
        Set<Permission> managerPermissions = new HashSet<>(Arrays.asList(view_session, checkout_session, exception_session, manage_session));
        // Admin: toàn bộ permission.
        Set<Permission> adminPermissions = new HashSet<>(Arrays.asList(view_session, checkout_session, exception_session, manage_session));

        seedRole("DRIVER", driverPermissions);
        seedRole("STAFF", staffPermissions);
        seedRole("MANAGER", managerPermissions);
        seedRole("ADMIN", adminPermissions);


        // Seed Admin User if not exists (thông tin lấy từ cấu hình app.admin.*)
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            User adminUser = User.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .status(Status.ACTIVE)
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);
            System.out.println("Seeded admin user: " + adminUsername);
        }

        // Seed Manager User if not exists (thông tin lấy từ cấu hình app.manager.*)
        seedUser(managerUsername, managerPassword, managerEmail, "MANAGER");

        // Seed Building
        Building building;
        if (buildingRepository.count() == 0) {
            building = Building.builder()
                    .buildingName("Tòa nhà gửi xe trung tâm (Building A)")
                    .address("123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh")
                    .build();
            building = buildingRepository.save(building);
            System.out.println("Seeded default building");
        } else {
            building = buildingRepository.findAll().get(0);
        }

        // Seed VehicleTypes (by code to avoid duplicates)
        seedVehicleType("MOTORBIKE", "Xe máy", "Phương tiện 2 bánh", "0.8m x 2m", 1, "#2563eb", 5000.0);
        seedVehicleType("CAR",       "Ô tô",   "Xe ô tô thông thường", "2.5m x 5m", 3, "#16a34a", 25000.0);
        seedVehicleType("EV",        "Xe điện","Ô tô điện", "2.5m x 5m", 3, "#0891b2", 30000.0);
        seedVehicleType("TRUCK",     "Xe tải", "Xe tải hạng nặng", "3m x 8m", 5, "#f59e0b", 45000.0);
        seedVehicleType("COACH",     "Xe khách","Xe khách / xe buýt", "3m x 12m", 8, "#dc2626", 60000.0);

        VehicleType motorbike = vehicleTypeRepository.findByCode("MOTORBIKE").orElse(null);
        VehicleType car       = vehicleTypeRepository.findByCode("CAR").orElse(null);
        VehicleType ev        = vehicleTypeRepository.findByCode("EV").orElse(null);
        VehicleType truck     = vehicleTypeRepository.findByCode("TRUCK").orElse(null);
        VehicleType coach     = vehicleTypeRepository.findByCode("COACH").orElse(null);

        // Seed Floors
        if (floorRepository.count() == 0) {
            Floor f1 = Floor.builder().building(building).name("B1").zone("Motorbike A").slotCount(180).supportedVehicleTypes(new HashSet<>(Collections.singletonList(motorbike))).build();
            Floor f2 = Floor.builder().building(building).name("B2").zone("Car B").slotCount(120).supportedVehicleTypes(new HashSet<>(Arrays.asList(car, ev))).build();
            Floor f3 = Floor.builder().building(building).name("L1").zone("Mixed C").slotCount(96).supportedVehicleTypes(new HashSet<>(Arrays.asList(car, truck))).build();
            Floor f4 = Floor.builder().building(building).name("L2").zone("Coach D").slotCount(52).supportedVehicleTypes(new HashSet<>(Arrays.asList(coach, truck))).build();
            floorRepository.saveAll(Arrays.asList(f1, f2, f3, f4));
            System.out.println("Seeded floors");
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

                ParkingSlot slot = ParkingSlot.builder()
                        .code(floor.getName() + "-" + String.format("%03d", i + 1))
                        .floor(floor)
                        .vehicleType(type)
                        .status(status)
                        .build();
                slotsToSave.add(slot);
            }
            parkingSlotRepository.saveAll(slotsToSave);
            System.out.println("Seeded " + slotsToSave.size() + " parking slots");
        }

        // Seed Sessions and Payments
        if (parkingSessionRepository.count() == 0) {
            List<ParkingSlot> slots = parkingSlotRepository.findAll();
            Random random = new Random();
            List<ParkingSession> sessionsToSave = new ArrayList<>();
            List<Payment> paymentsToSave = new ArrayList<>();

            // Seed completed sessions & payments for the last 14 days
            for (int dayOffset = 14; dayOffset >= 0; dayOffset--) {
                LocalDate date = LocalDate.now().minusDays(dayOffset);
                
                // Let's create between 3 and 7 sessions per day
                int dailyCount = 3 + random.nextInt(5); 
                for (int j = 0; j < dailyCount; j++) {
                    ParkingSlot slot = slots.get(random.nextInt(slots.size()));
                    VehicleType type = slot.getVehicleType();
                    
                    // Entry time between 7:00 and 19:00
                    int entryHour = 7 + random.nextInt(12);
                    int entryMinute = random.nextInt(60);
                    LocalDateTime entryTime = date.atTime(entryHour, entryMinute);
                    
                    // Exit time between 1 and 8 hours later
                    int durationHours = 1 + random.nextInt(8);
                    LocalDateTime exitTime = entryTime.plusHours(durationHours).plusMinutes(random.nextInt(60));
                    
                    // Check exitTime is before now
                    if (exitTime.isAfter(LocalDateTime.now())) {
                        continue;
                    }
                    
                    double fee = type.getHourlyRate() * durationHours;
                    String ticketCode = "TKT-" + date.toString().replace("-", "") + "-" + String.format("%04d", random.nextInt(10000));
                    String plateNumber = "51G-" + String.format("%05d", 10000 + random.nextInt(90000));

                    ParkingSession session = ParkingSession.builder()
                            .ticketCode(ticketCode)
                            .plateNumber(plateNumber)
                            .vehicleType(type)
                            .slot(slot)
                            .entryGate("Gate " + (1 + random.nextInt(3)))
                            .checkInAt(entryTime)
                            .checkOutAt(exitTime)
                            .fee(BigDecimal.valueOf(fee))
                            .status(SessionStatus.COMPLETED)
                            .build();
                    
                    sessionsToSave.add(session);
                }
            }
            
            // Save sessions first so they have IDs
            List<ParkingSession> savedSessions = parkingSessionRepository.saveAll(sessionsToSave);
            
            // Now create payment records for these sessions
            PaymentMethod[] methods = {PaymentMethod.CASH, PaymentMethod.QR_CODE, PaymentMethod.BANK_CARD};
            for (ParkingSession session : savedSessions) {
                Payment payment = Payment.builder()
                        .session(session)
                        .amount(session.getFee())
                        .method(methods[random.nextInt(methods.length)])
                        .paymentTime(session.getCheckOutAt().plusMinutes(1 + random.nextInt(5)))
                        .build();
                paymentsToSave.add(payment);
            }
            paymentRepository.saveAll(paymentsToSave);
            System.out.println("Seeded " + savedSessions.size() + " completed parking sessions and payments.");
            
            // Also seed a few ACTIVE sessions (currently parked cars)
            int activeCount = 5;
            for (int k = 0; k < activeCount; k++) {
                // Find an AVAILABLE slot
                ParkingSlot slot = slots.stream()
                        .filter(s -> s.getStatus() == SlotStatus.AVAILABLE)
                        .findFirst()
                        .orElse(slots.get(random.nextInt(slots.size())));
                
                // Update slot status to OCCUPIED
                slot.setStatus(SlotStatus.OCCUPIED);
                parkingSlotRepository.save(slot);
                
                LocalDateTime entryTime = LocalDateTime.now().minusHours(1 + random.nextInt(5));
                String ticketCode = "TKT-ACT-" + String.format("%04d", random.nextInt(10000));
                String plateNumber = "51A-" + String.format("%05d", 10000 + random.nextInt(90000));
                
                ParkingSession activeSession = ParkingSession.builder()
                        .ticketCode(ticketCode)
                        .plateNumber(plateNumber)
                        .vehicleType(slot.getVehicleType())
                        .slot(slot)
                        .entryGate("Gate " + (1 + random.nextInt(3)))
                        .checkInAt(entryTime)
                        .fee(BigDecimal.ZERO)
                        .status(SessionStatus.ACTIVE)
                        .build();
                parkingSessionRepository.save(activeSession);
            }
            System.out.println("Seeded 5 active parking sessions (occupied slots).");
        }

        // Seed default System Settings (singleton)
        if (systemSettingsRepository.count() == 0) {
            systemSettingsRepository.save(
                SystemSettings.builder()
                    .id(1L)
                    .systemName("Parking Building Management")
                    .openingTime("06:00")
                    .closingTime("23:00")
                    .paymentMode(PaymentMode.HYBRID)
                    .autoBlockOverdueSlots(true)
                    .build()
            );
            System.out.println("Seeded default system settings.");
        }
    }

    /**
     * Seed một tài khoản với role cho trước nếu username chưa tồn tại.
     * Dùng cho các tài khoản mẫu theo vai trò (MANAGER, STAFF, ...), tương tự admin.
     */
    private void seedUser(String username, String rawPassword, String email, String roleName) {
        if (userRepository.findByUsername(username).isEmpty()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException(roleName + " role not found"));

            User user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPassword))
                    .email(email)
                    .status(Status.ACTIVE)
                    .role(role)
                    .build();

            userRepository.save(user);
            System.out.println("Seeded " + roleName + " user: " + username);
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
                    .build()
            );
            System.out.println("Seeded vehicle type: " + code);
        }
    }

    /**
     * Chặn dùng mật khẩu admin mặc định ('admin123') ngoài môi trường dev/test.
     * Ở prod (không có profile 'dev'/'test'), yêu cầu đặt ADMIN_PASSWORD khác mặc định,
     * fail-fast để tránh tài khoản admin bị đoán mật khẩu.
     */
    private void guardAdminPassword() {
        System.out.println("Profiles = " + Arrays.toString(environment.getActiveProfiles()));
        System.out.println("Admin password = " + adminPassword);
        boolean isDevOrTest = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("test"));
        if (!isDevOrTest && "admin123".equals(adminPassword)) {
            throw new IllegalStateException(
                    "[SECURITY] Admin đang dùng mật khẩu mặc định 'admin123' ở môi trường thật. "
                    + "Hãy đặt biến môi trường ADMIN_PASSWORD với mật khẩu mạnh trước khi khởi động.");
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
