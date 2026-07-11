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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Seed Permissions
        List<String> permissionNames = Arrays.asList(
                "sessions:view",
                "sessions:checkout",
                "sessions:exception");
        for (String permissionName : permissionNames) {
            if (permissionRepository.findByName(permissionName).isEmpty()) {
                permissionRepository.save(Permission.builder().name(permissionName).build());
            }
        }

        // Seed Roles with Permissions
        Permission view_session = permissionRepository.findByName("sessions:view").orElseThrow();
        Permission checkout_session = permissionRepository.findByName("sessions:checkout").orElseThrow();
        Permission exception_session = permissionRepository.findByName("sessions:exception").orElseThrow();

        Set<Permission> driverPermissions = new HashSet<>(Collections.singletonList(view_session));
        Set<Permission> staffPermissions = new HashSet<>(
                Arrays.asList(view_session, checkout_session, exception_session));
        Set<Permission> managerPermissions = new HashSet<>(
                Arrays.asList(view_session, checkout_session, exception_session)); // Managers get all staff permissions
        Set<Permission> adminPermissions = new HashSet<>(
                Arrays.asList(view_session, checkout_session, exception_session)); // Admins get all permissions

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
                    .status(Status.ACTIVE)
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);
            System.out.println("Seeded admin user (admin / admin123)");
        }

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
        seedVehicleType("CAR", "Ô tô", "Xe ô tô thông thường", "2.5m x 5m", 3, "#16a34a", 25000.0);
        seedVehicleType("EV", "Xe điện", "Ô tô điện", "2.5m x 5m", 3, "#0891b2", 30000.0);
        seedVehicleType("TRUCK", "Xe tải", "Xe tải hạng nặng", "3m x 8m", 5, "#f59e0b", 45000.0);
        seedVehicleType("COACH", "Xe khách", "Xe khách / xe buýt", "3m x 12m", 8, "#dc2626", 60000.0);

        VehicleType motorbike = vehicleTypeRepository.findByCode("MOTORBIKE").orElse(null);
        VehicleType car = vehicleTypeRepository.findByCode("CAR").orElse(null);
        VehicleType ev = vehicleTypeRepository.findByCode("EV").orElse(null);
        VehicleType truck = vehicleTypeRepository.findByCode("TRUCK").orElse(null);
        VehicleType coach = vehicleTypeRepository.findByCode("COACH").orElse(null);

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
                    String ticketCode = "TKT-" + date.toString().replace("-", "") + "-"
                            + String.format("%04d", random.nextInt(10000));
                    String plateNumber = "51G-" + String.format("%05d", 10000 + random.nextInt(90000));

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
                            .build();

                    sessionsToSave.add(session);
                }
            }

            // Save sessions first so they have IDs
            List<ParkingSession> savedSessions = parkingSessionRepository.saveAll(sessionsToSave);

            // Now create payment records for these sessions
            String[] methods = { "CASH", "QR_CODE", "BANK_CARD" };
            for (ParkingSession session : savedSessions) {
                Payment payment = Payment.builder()
                        .session(session)
                        .amount(BigDecimal.valueOf(session.getFee()))
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
                        .fee(0.0)
                        .status("ACTIVE")
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
                            .timezone("Asia/Ho_Chi_Minh")
                            .dateFormat("dd/MM/yyyy")
                            .version("1.0.0")
                            .build());
            System.out.println("Seeded default system settings.");
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
            System.out.println("Seeded vehicle type: " + code);
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
