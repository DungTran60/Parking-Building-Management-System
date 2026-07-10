package com.parking.service;

import com.parking.dto.OccupancyReportDto;
import com.parking.dto.RevenueReportDto;
import com.parking.dto.TrafficReportDto;
import com.parking.dto.TrafficEventDto;
import com.parking.dto.TrafficByHourAndVehicleTypeDto;
import com.parking.dto.RevenueByVehicleTypeDto;
import com.parking.entity.ParkingSession;
import com.parking.entity.Payment;
import com.parking.entity.SlotStatus;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    @Override
    public RevenueReportDto getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endExclusive = endDate.plusDays(1).atStartOfDay();

        List<Payment> payments = paymentRepository.findByPaymentTimeGreaterThanEqualAndPaymentTimeLessThan(
                startDateTime, endExclusive);

        BigDecimal totalRevenue = payments.stream().map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Populate all dates in the range with 0.0 first to avoid gaps
        Map<String, BigDecimal> dateMap = new LinkedHashMap<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dateMap.put(current.toString(), BigDecimal.ZERO);
            current = current.plusDays(1);
        }

        // Add actual payments
        for (Payment p : payments) {
            String dateStr = p.getPaymentTime().toLocalDate().toString();
            dateMap.merge(dateStr, p.getAmount(), BigDecimal::add);
        }

        List<RevenueReportDto.DateRevenueDto> revenueByDate = dateMap.entrySet().stream()
                .map(e -> RevenueReportDto.DateRevenueDto.builder()
                        .date(e.getKey())
                        .amount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // Group by Method
        Map<String, BigDecimal> methodMap = new HashMap<>();
        for (Payment p : payments) {
            String method = p.getMethod() != null ? p.getMethod().name() : "UNKNOWN";
            methodMap.merge(method, p.getAmount(), BigDecimal::add);
        }

        List<RevenueReportDto.MethodRevenueDto> revenueByMethod = methodMap.entrySet().stream()
                .map(e -> RevenueReportDto.MethodRevenueDto.builder()
                        .method(e.getKey())
                        .amount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        Map<Long, RevenueByVehicleTypeDto> vehicleRevenue = new HashMap<>();
        for (Payment payment : payments) {
            var vehicleType = payment.getSession().getVehicleType();
            vehicleRevenue.compute(vehicleType.getId(), (id, currentValue) -> new RevenueByVehicleTypeDto(
                    id,
                    vehicleType.getName(),
                    (currentValue == null ? BigDecimal.ZERO : currentValue.getAmount()).add(payment.getAmount())
            ));
        }

        return RevenueReportDto.builder()
                .totalRevenue(totalRevenue)
                .revenueByDate(revenueByDate)
                .revenueByMethod(revenueByMethod)
                .revenueByVehicleType(vehicleRevenue.values().stream()
                        .sorted(Comparator.comparing(RevenueByVehicleTypeDto::getVehicleTypeName))
                        .toList())
                .build();
    }

    @Override
    public OccupancyReportDto getOccupancyReport() {
        long totalSlots = parkingSlotRepository.count();
        long occupiedSlots = parkingSlotRepository.countByStatus(SlotStatus.OCCUPIED);
        long availableSlots = parkingSlotRepository.countByStatus(SlotStatus.AVAILABLE);
        long reservedSlots = parkingSlotRepository.countByStatus(SlotStatus.RESERVED);
        long maintenanceSlots = parkingSlotRepository.countByStatus(SlotStatus.MAINTENANCE);
        long blockedSlots = parkingSlotRepository.countByStatus(SlotStatus.BLOCKED);

        double occupancyRate = totalSlots == 0 ? 0.0 : ((double) occupiedSlots / totalSlots) * 100.0;

        // Group by Floor
        List<OccupancyReportDto.FloorOccupancyDto> occupancyByFloor = parkingSlotRepository.countOccupancyByFloor().stream()
                .map(row -> {
                    long occupied = ((Number) row[1]).longValue();
                    long total = ((Number) row[2]).longValue();
                    double rate = total == 0 ? 0.0 : ((double) occupied / total) * 100.0;
                    return OccupancyReportDto.FloorOccupancyDto.builder()
                            .floorName((String) row[0])
                            .occupied(occupied)
                            .total(total)
                            .rate(rate)
                            .build();
                })
                .collect(Collectors.toList());

        // Group by Vehicle Type
        List<OccupancyReportDto.VehicleTypeOccupancyDto> occupancyByVehicleType = parkingSlotRepository.countOccupancyByVehicleType().stream()
                .map(row -> {
                    long occupied = ((Number) row[1]).longValue();
                    long total = ((Number) row[2]).longValue();
                    double rate = total == 0 ? 0.0 : ((double) occupied / total) * 100.0;
                    return OccupancyReportDto.VehicleTypeOccupancyDto.builder()
                            .vehicleTypeName((String) row[0])
                            .occupied(occupied)
                            .total(total)
                            .rate(rate)
                            .build();
                })
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
        LocalDateTime endExclusive = endDate.plusDays(1).atStartOfDay();

        List<ParkingSession> sessions = parkingSessionRepository.findTrafficInRange(startDateTime, endExclusive);

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
        Map<Integer, long[]> hourMap = new LinkedHashMap<>();
        for (int h = 0; h < 24; h++) {
            hourMap.put(h, new long[2]);
        }

        // Initialize vehicle type traffic map
        Map<String, long[]> typeTrafficMap = new HashMap<>();
        Map<String, long[]> hourTypeTrafficMap = new HashMap<>();

        for (ParkingSession s : sessions) {
            boolean hasCheckInInRange = s.getCheckInAt() != null &&
                    !s.getCheckInAt().isBefore(startDateTime) && s.getCheckInAt().isBefore(endExclusive);
            boolean hasCheckOutInRange = s.getCheckOutAt() != null &&
                    !s.getCheckOutAt().isBefore(startDateTime) && s.getCheckOutAt().isBefore(endExclusive);

            String vehicleTypeName = s.getVehicleType().getName();

            if (hasCheckInInRange) {
                totalCheckIns++;
                String dateStr = s.getCheckInAt().toLocalDate().toString();
                if (dateTrafficMap.containsKey(dateStr)) {
                    dateTrafficMap.get(dateStr)[0]++;
                }
                int hour = s.getCheckInAt().getHour();
                hourMap.get(hour)[0]++;
                typeTrafficMap.computeIfAbsent(vehicleTypeName, ignored -> new long[2])[0]++;
                hourTypeTrafficMap.computeIfAbsent(hour + "|" + vehicleTypeName, ignored -> new long[2])[0]++;
            }

            if (hasCheckOutInRange) {
                totalCheckOuts++;
                String dateStr = s.getCheckOutAt().toLocalDate().toString();
                if (dateTrafficMap.containsKey(dateStr)) {
                    dateTrafficMap.get(dateStr)[1]++;
                }
                // (Optional) Hourly traffic can combine exits or just entrances, here we count check-ins for entry traffic,
                // but we also add check-outs to hourly combined if desired. Let's make hourly count represent check-ins.

                int hour = s.getCheckOutAt().getHour();
                hourMap.get(hour)[1]++;
                typeTrafficMap.computeIfAbsent(vehicleTypeName, ignored -> new long[2])[1]++;
                hourTypeTrafficMap.computeIfAbsent(hour + "|" + vehicleTypeName, ignored -> new long[2])[1]++;
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
                        .checkIns(e.getValue()[0])
                        .checkOuts(e.getValue()[1])
                        .build())
                .collect(Collectors.toList());

        List<TrafficReportDto.VehicleTypeTrafficDto> trafficByVehicleType = typeTrafficMap.entrySet().stream()
                .map(e -> TrafficReportDto.VehicleTypeTrafficDto.builder()
                        .vehicleTypeName(e.getKey())
                        .checkIns(e.getValue()[0])
                        .checkOuts(e.getValue()[1])
                        .build())
                .sorted(Comparator.comparing(TrafficReportDto.VehicleTypeTrafficDto::getVehicleTypeName))
                .collect(Collectors.toList());

        List<TrafficByHourAndVehicleTypeDto> trafficByHourAndVehicleType = hourTypeTrafficMap.entrySet().stream()
                .map(e -> {
                    String[] key = e.getKey().split("\\|", 2);
                    return TrafficByHourAndVehicleTypeDto.builder()
                            .hour(Integer.parseInt(key[0]))
                            .vehicleTypeName(key[1])
                            .checkIns(e.getValue()[0])
                            .checkOuts(e.getValue()[1])
                            .build();
                })
                .sorted(Comparator.comparingInt(TrafficByHourAndVehicleTypeDto::getHour)
                        .thenComparing(TrafficByHourAndVehicleTypeDto::getVehicleTypeName))
                .toList();

        return TrafficReportDto.builder()
                .totalCheckIns(totalCheckIns)
                .totalCheckOuts(totalCheckOuts)
                .trafficByDate(trafficByDate)
                .trafficByHour(trafficByHour)
                .trafficByVehicleType(trafficByVehicleType)
                .trafficByHourAndVehicleType(trafficByHourAndVehicleType)
                .build();
    }

    @Override
    public Page<TrafficEventDto> getTrafficEvents(LocalDate startDate, LocalDate endDate, String eventType, Pageable pageable) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();
        String normalizedType = eventType == null ? "ALL" : eventType.trim().toUpperCase();
        List<TrafficEventDto> events = parkingSessionRepository.findTrafficInRange(start, end).stream()
                .flatMap(session -> {
                    List<TrafficEventDto> rows = new ArrayList<>();
                    if (!session.getCheckInAt().isBefore(start) && session.getCheckInAt().isBefore(end)
                            && (normalizedType.equals("ALL") || normalizedType.equals("CHECK_IN"))) {
                        rows.add(toTrafficEvent(session, "CHECK_IN", session.getCheckInAt()));
                    }
                    if (session.getCheckOutAt() != null && !session.getCheckOutAt().isBefore(start) && session.getCheckOutAt().isBefore(end)
                            && (normalizedType.equals("ALL") || normalizedType.equals("CHECK_OUT"))) {
                        rows.add(toTrafficEvent(session, "CHECK_OUT", session.getCheckOutAt()));
                    }
                    return rows.stream();
                })
                .sorted(Comparator.comparing(TrafficEventDto::getEventTime).reversed())
                .toList();
        int from = Math.min((int) pageable.getOffset(), events.size());
        int to = Math.min(from + pageable.getPageSize(), events.size());
        return new PageImpl<>(events.subList(from, to), pageable, events.size());
    }

    private TrafficEventDto toTrafficEvent(ParkingSession session, String type, LocalDateTime time) {
        return TrafficEventDto.builder()
                .sessionId(session.getId()).ticketCode(session.getTicketCode()).plateNumber(session.getPlateNumber())
                .vehicleTypeName(session.getVehicleType().getName()).slotCode(session.getSlot().getCode())
                .eventType(type).eventTime(time).build();
    }
}
