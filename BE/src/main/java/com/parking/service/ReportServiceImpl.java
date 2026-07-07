package com.parking.service;

import com.parking.dto.*;
import com.parking.entity.ParkingSession;
import com.parking.entity.Payment;
import com.parking.entity.VehicleType;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.PaymentRepository;
import com.parking.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final PaymentRepository paymentRepository;
    private final ParkingSessionRepository parkingSessionRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public RevenueReportDto getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<Payment> payments = paymentRepository.findByPaymentTimeBetween(startDateTime, endDateTime);

        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> revenueByDate = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getPaymentTime().format(DATE_FORMATTER),
                        Collectors.mapping(Payment::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        Map<String, BigDecimal> revenueByMethod = payments.stream()
                .collect(Collectors.groupingBy(Payment::getMethod,
                        Collectors.mapping(Payment::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        Map<VehicleType, BigDecimal> revenueByVehicleTypeMap = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getSession().getVehicleType(),
                        Collectors.mapping(Payment::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        List<RevenueReportDto.DateRevenueDto> dateRevenueList = revenueByDate.entrySet().stream()
                .map(e -> new RevenueReportDto.DateRevenueDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(RevenueReportDto.DateRevenueDto::getDate))
                .collect(Collectors.toList());

        List<RevenueReportDto.MethodRevenueDto> methodRevenueList = revenueByMethod.entrySet().stream()
                .map(e -> new RevenueReportDto.MethodRevenueDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<RevenueByVehicleTypeDto> vehicleTypeRevenueList = revenueByVehicleTypeMap.entrySet().stream()
                .map(e -> new RevenueByVehicleTypeDto(
                        e.getKey().getId(),
                        e.getKey().getName(),
                        e.getValue()))
                .collect(Collectors.toList());

        return RevenueReportDto.builder()
                .totalRevenue(totalRevenue)
                .revenueByDate(dateRevenueList)
                .revenueByMethod(methodRevenueList)
                .revenueByVehicleType(vehicleTypeRevenueList)
                .build();
    }

    @Override
    public OccupancyReportDto getOccupancyReport() {
        long totalCapacity = 100; // Placeholder
        long occupiedSpaces = parkingSessionRepository.countByCheckOutAtIsNull();
        return OccupancyReportDto.builder()
                .totalSlots(totalCapacity)
                .occupiedSlots(occupiedSpaces)
                .availableSlots(totalCapacity - occupiedSpaces)
                .build();
    }

    @Override
    public TrafficReportDto getTrafficReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<ParkingSession> sessions = parkingSessionRepository.findByCheckInAtBetweenOrCheckOutAtBetween(startDateTime, endDateTime, startDateTime, endDateTime);

        List<ParkingSession> checkInSessions = sessions.stream()
                .filter(s -> s.getCheckInAt().isAfter(startDateTime.minusNanos(1)) && s.getCheckInAt().isBefore(endDateTime))
                .collect(Collectors.toList());

        List<ParkingSession> checkOutSessions = sessions.stream()
                .filter(s -> s.getCheckOutAt() != null && s.getCheckOutAt().isAfter(startDateTime.minusNanos(1)) && s.getCheckOutAt().isBefore(endDateTime))
                .collect(Collectors.toList());

        long totalCheckIns = checkInSessions.size();
        long totalCheckOuts = checkOutSessions.size();

        // Traffic by Date
        Map<LocalDate, TrafficReportDto.DateTrafficDto> trafficByDateMap = new LinkedHashMap<>();
        startDate.datesUntil(endDate.plusDays(1)).forEach(date ->
                trafficByDateMap.put(date, new TrafficReportDto.DateTrafficDto(date.format(DATE_FORMATTER), 0L, 0L))
        );
        checkInSessions.forEach(s -> {
            LocalDate checkInDate = s.getCheckInAt().toLocalDate();
            trafficByDateMap.computeIfPresent(checkInDate, (k, v) -> {
                v.setCheckIns(v.getCheckIns() + 1);
                return v;
            });
        });
        checkOutSessions.forEach(s -> {
            LocalDate checkOutDate = s.getCheckOutAt().toLocalDate();
            trafficByDateMap.computeIfPresent(checkOutDate, (k, v) -> {
                v.setCheckOuts(v.getCheckOuts() + 1);
                return v;
            });
        });
        List<TrafficReportDto.DateTrafficDto> trafficByDate = new ArrayList<>(trafficByDateMap.values());

        // Traffic by Hour
        Map<Integer, TrafficReportDto.HourTrafficDto> trafficByHourMap = new LinkedHashMap<>();
        IntStream.range(0, 24).forEach(hour -> trafficByHourMap.put(hour, new TrafficReportDto.HourTrafficDto(hour, 0L, 0L)));
        checkInSessions.forEach(s -> {
            int checkInHour = s.getCheckInAt().getHour();
            trafficByHourMap.get(checkInHour).setCheckIns(trafficByHourMap.get(checkInHour).getCheckIns() + 1);
        });
        checkOutSessions.forEach(s -> {
            int checkOutHour = s.getCheckOutAt().getHour();
            trafficByHourMap.get(checkOutHour).setCheckOuts(trafficByHourMap.get(checkOutHour).getCheckOuts() + 1);
        });
        List<TrafficReportDto.HourTrafficDto> trafficByHour = new ArrayList<>(trafficByHourMap.values());

        // Traffic by Vehicle Type
        Map<String, TrafficReportDto.VehicleTypeTrafficDto> trafficByVehicleTypeMap = new HashMap<>();
        checkInSessions.forEach(s -> {
            String vehicleTypeName = s.getVehicleType().getName();
            TrafficReportDto.VehicleTypeTrafficDto dto = trafficByVehicleTypeMap.computeIfAbsent(vehicleTypeName, k -> new TrafficReportDto.VehicleTypeTrafficDto(k, 0L, 0L));
            dto.setCheckIns(dto.getCheckIns() + 1);
        });
        checkOutSessions.forEach(s -> {
             String vehicleTypeName = s.getVehicleType().getName();
             TrafficReportDto.VehicleTypeTrafficDto dto = trafficByVehicleTypeMap.computeIfAbsent(vehicleTypeName, k -> new TrafficReportDto.VehicleTypeTrafficDto(k, 0L, 0L));
             dto.setCheckOuts(dto.getCheckOuts() + 1);
        });
        List<TrafficReportDto.VehicleTypeTrafficDto> trafficByVehicleType = new ArrayList<>(trafficByVehicleTypeMap.values());


        // Traffic by Hour and Vehicle Type
        Map<String, TrafficByHourAndVehicleTypeDto> trafficByHourAndVehicleTypeMap = new LinkedHashMap<>();
        checkInSessions.forEach(s -> {
            int hour = s.getCheckInAt().getHour();
            String vehicleTypeName = s.getVehicleType().getName();
            String key = hour + ":" + vehicleTypeName;
            TrafficByHourAndVehicleTypeDto dto = trafficByHourAndVehicleTypeMap.computeIfAbsent(key, k -> new TrafficByHourAndVehicleTypeDto(hour, vehicleTypeName, 0L, 0L));
            dto.setCheckIns(dto.getCheckIns() + 1);
        });
        checkOutSessions.forEach(s -> {
            int hour = s.getCheckOutAt().getHour();
            String vehicleTypeName = s.getVehicleType().getName();
            String key = hour + ":" + vehicleTypeName;
            TrafficByHourAndVehicleTypeDto dto = trafficByHourAndVehicleTypeMap.computeIfAbsent(key, k -> new TrafficByHourAndVehicleTypeDto(hour, vehicleTypeName, 0L, 0L));
            dto.setCheckOuts(dto.getCheckOuts() + 1);
        });

        List<TrafficByHourAndVehicleTypeDto> trafficByHourAndVehicleType = trafficByHourAndVehicleTypeMap.values().stream()
                .sorted(Comparator.comparing(TrafficByHourAndVehicleTypeDto::getHour).thenComparing(TrafficByHourAndVehicleTypeDto::getVehicleTypeName))
                .collect(Collectors.toList());


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
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<ParkingSession> sessions = parkingSessionRepository
                .findByCheckInAtBetweenOrCheckOutAtBetween(startDateTime, endDateTime, startDateTime, endDateTime);

        List<TrafficEventDto> events = new ArrayList<>();
        sessions.forEach(s -> {
            if (("check-in".equalsIgnoreCase(eventType) || eventType == null) && s.getCheckInAt().isAfter(startDateTime.minusNanos(1)) && s.getCheckInAt().isBefore(endDateTime)) {
                events.add(mapToTrafficEventDto(s, "check-in"));
            }
            if (("check-out".equalsIgnoreCase(eventType) || eventType == null) && s.getCheckOutAt() != null && s.getCheckOutAt().isAfter(startDateTime.minusNanos(1)) && s.getCheckOutAt().isBefore(endDateTime)) {
                events.add(mapToTrafficEventDto(s, "check-out"));
            }
        });

        events.sort(Comparator.comparing(TrafficEventDto::getEventTime).reversed());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), events.size());
        return new PageImpl<>(events.subList(start, end), pageable, events.size());
    }

    private TrafficEventDto mapToTrafficEventDto(ParkingSession session, String eventType) {
        LocalDateTime timestamp = "check-in".equals(eventType) ? session.getCheckInAt() : session.getCheckOutAt();
        return TrafficEventDto.builder()
                .sessionId(session.getId())
                .ticketCode(session.getTicketCode())
                .plateNumber(session.getPlateNumber())
                .vehicleTypeName(session.getVehicleType().getName())
                .slotCode(session.getSlot().getCode())
                .eventType(eventType)
                .eventTime(timestamp)
                .build();
    }
}