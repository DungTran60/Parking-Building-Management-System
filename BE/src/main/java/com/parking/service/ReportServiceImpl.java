package com.parking.service;

import com.parking.dto.OccupancyReportDto;
import com.parking.dto.RevenueReportDto;
import com.parking.dto.TrafficReportDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Payment;
import com.parking.entity.SlotStatus;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    @Override
    public RevenueReportDto getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Payment> payments = paymentRepository.findByPaymentTimeBetween(startDateTime, endDateTime);

        double totalRevenue = payments.stream().mapToDouble(Payment::getAmount).sum();

        // Populate all dates in the range with 0.0 first to avoid gaps
        Map<String, Double> dateMap = new LinkedHashMap<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dateMap.put(current.toString(), 0.0);
            current = current.plusDays(1);
        }

        // Add actual payments
        for (Payment p : payments) {
            String dateStr = p.getPaymentTime().toLocalDate().toString();
            dateMap.put(dateStr, dateMap.getOrDefault(dateStr, 0.0) + p.getAmount());
        }

        List<RevenueReportDto.DateRevenueDto> revenueByDate = dateMap.entrySet().stream()
                .map(e -> RevenueReportDto.DateRevenueDto.builder()
                        .date(e.getKey())
                        .amount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // Group by Method
        Map<String, Double> methodMap = new HashMap<>();
        for (Payment p : payments) {
            String method = p.getMethod();
            methodMap.put(method, methodMap.getOrDefault(method, 0.0) + p.getAmount());
        }

        List<RevenueReportDto.MethodRevenueDto> revenueByMethod = methodMap.entrySet().stream()
                .map(e -> RevenueReportDto.MethodRevenueDto.builder()
                        .method(e.getKey())
                        .amount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        return RevenueReportDto.builder()
                .totalRevenue(totalRevenue)
                .revenueByDate(revenueByDate)
                .revenueByMethod(revenueByMethod)
                .build();
    }

    @Override
    public OccupancyReportDto getOccupancyReport() {
        List<ParkingSlot> slots = parkingSlotRepository.findAll();

        long totalSlots = slots.size();
        long occupiedSlots = slots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count();
        long availableSlots = slots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE).count();
        long reservedSlots = slots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED).count();
        long maintenanceSlots = slots.stream().filter(s -> s.getStatus() == SlotStatus.MAINTENANCE).count();
        long blockedSlots = slots.stream().filter(s -> s.getStatus() == SlotStatus.BLOCKED).count();

        double occupancyRate = totalSlots == 0 ? 0.0 : ((double) occupiedSlots / totalSlots) * 100.0;

        // Group by Floor
        Map<String, long[]> floorCounts = new HashMap<>(); // floorName -> [occupied, total]
        for (ParkingSlot s : slots) {
            String floorName = s.getFloor().getName();
            long[] counts = floorCounts.computeIfAbsent(floorName, k -> new long[2]);
            counts[1]++; // total slots on this floor
            if (s.getStatus() == SlotStatus.OCCUPIED) {
                counts[0]++; // occupied slots on this floor
            }
        }

        List<OccupancyReportDto.FloorOccupancyDto> occupancyByFloor = floorCounts.entrySet().stream()
                .map(e -> {
                    long occupied = e.getValue()[0];
                    long total = e.getValue()[1];
                    double rate = total == 0 ? 0.0 : ((double) occupied / total) * 100.0;
                    return OccupancyReportDto.FloorOccupancyDto.builder()
                            .floorName(e.getKey())
                            .occupied(occupied)
                            .total(total)
                            .rate(rate)
                            .build();
                })
                .sorted(Comparator.comparing(OccupancyReportDto.FloorOccupancyDto::getFloorName))
                .collect(Collectors.toList());

        // Group by Vehicle Type
        Map<String, long[]> typeCounts = new HashMap<>(); // vehicleTypeName -> [occupied, total]
        for (ParkingSlot s : slots) {
            String typeName = s.getVehicleType().getName();
            long[] counts = typeCounts.computeIfAbsent(typeName, k -> new long[2]);
            counts[1]++;
            if (s.getStatus() == SlotStatus.OCCUPIED) {
                counts[0]++;
            }
        }

        List<OccupancyReportDto.VehicleTypeOccupancyDto> occupancyByVehicleType = typeCounts.entrySet().stream()
                .map(e -> {
                    long occupied = e.getValue()[0];
                    long total = e.getValue()[1];
                    double rate = total == 0 ? 0.0 : ((double) occupied / total) * 100.0;
                    return OccupancyReportDto.VehicleTypeOccupancyDto.builder()
                            .vehicleTypeName(e.getKey())
                            .occupied(occupied)
                            .total(total)
                            .rate(rate)
                            .build();
                })
                .sorted(Comparator.comparing(OccupancyReportDto.VehicleTypeOccupancyDto::getVehicleTypeName))
                .collect(Collectors.toList());

        return OccupancyReportDto.builder()
                .totalSlots(totalSlots)
                .occupiedSlots(occupiedSlots)
                .availableSlots(availableSlots)
                .reservedSlots(reservedSlots)
                .maintenanceSlots(maintenanceSlots)
                .blockedSlots(blockedSlots)
                .occupancyRate(occupancyRate)
                .occupancyByFloor(occupancyByFloor)
                .occupancyByVehicleType(occupancyByVehicleType)
                .build();
    }

    @Override
    public TrafficReportDto getTrafficReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<ParkingSession> sessions = parkingSessionRepository.findByCheckInAtBetweenOrCheckOutAtBetween(
                startDateTime, endDateTime, startDateTime, endDateTime);

        long totalCheckIns = 0;
        long totalCheckOuts = 0;

        // Initialize date map with [checkIns, checkOuts] = [0, 0]
        Map<String, long[]> dateTrafficMap = new LinkedHashMap<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dateTrafficMap.put(current.toString(), new long[2]);
            current = current.plusDays(1);
        }

        // Initialize hour map 0-23
        Map<Integer, Long> hourMap = new LinkedHashMap<>();
        for (int h = 0; h < 24; h++) {
            hourMap.put(h, 0L);
        }

        // Initialize vehicle type traffic map
        Map<String, Long> typeTrafficMap = new HashMap<>();

        for (ParkingSession s : sessions) {
            boolean hasCheckInInRange = s.getCheckInAt() != null &&
                    !s.getCheckInAt().isBefore(startDateTime) && !s.getCheckInAt().isAfter(endDateTime);
            boolean hasCheckOutInRange = s.getCheckOutAt() != null &&
                    !s.getCheckOutAt().isBefore(startDateTime) && !s.getCheckOutAt().isAfter(endDateTime);

            String vehicleTypeName = s.getVehicleType().getName();

            if (hasCheckInInRange) {
                totalCheckIns++;
                String dateStr = s.getCheckInAt().toLocalDate().toString();
                if (dateTrafficMap.containsKey(dateStr)) {
                    dateTrafficMap.get(dateStr)[0]++;
                }
                int hour = s.getCheckInAt().getHour();
                hourMap.put(hour, hourMap.get(hour) + 1);

                typeTrafficMap.put(vehicleTypeName, typeTrafficMap.getOrDefault(vehicleTypeName, 0L) + 1);
            }

            if (hasCheckOutInRange) {
                totalCheckOuts++;
                String dateStr = s.getCheckOutAt().toLocalDate().toString();
                if (dateTrafficMap.containsKey(dateStr)) {
                    dateTrafficMap.get(dateStr)[1]++;
                }
                // (Optional) Hourly traffic can combine exits or just entrances, here we count check-ins for entry traffic,
                // but we also add check-outs to hourly combined if desired. Let's make hourly count represent check-ins.

                typeTrafficMap.put(vehicleTypeName, typeTrafficMap.getOrDefault(vehicleTypeName, 0L) + 1);
            }
        }

        List<TrafficReportDto.DateTrafficDto> trafficByDate = dateTrafficMap.entrySet().stream()
                .map(e -> TrafficReportDto.DateTrafficDto.builder()
                        .date(e.getKey())
                        .checkIns(e.getValue()[0])
                        .checkOuts(e.getValue()[1])
                        .build())
                .collect(Collectors.toList());

        List<TrafficReportDto.HourTrafficDto> trafficByHour = hourMap.entrySet().stream()
                .map(e -> TrafficReportDto.HourTrafficDto.builder()
                        .hour(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        List<TrafficReportDto.VehicleTypeTrafficDto> trafficByVehicleType = typeTrafficMap.entrySet().stream()
                .map(e -> TrafficReportDto.VehicleTypeTrafficDto.builder()
                        .vehicleTypeName(e.getKey())
                        .count(e.getValue())
                        .build())
                .sorted(Comparator.comparing(TrafficReportDto.VehicleTypeTrafficDto::getVehicleTypeName))
                .collect(Collectors.toList());

        return TrafficReportDto.builder()
                .totalCheckIns(totalCheckIns)
                .totalCheckOuts(totalCheckOuts)
                .trafficByDate(trafficByDate)
                .trafficByHour(trafficByHour)
                .trafficByVehicleType(trafficByVehicleType)
                .build();
    }
}
