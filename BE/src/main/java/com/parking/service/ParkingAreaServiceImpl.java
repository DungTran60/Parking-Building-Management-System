package com.parking.service;

import com.parking.dto.ParkingAreaRequest;
import com.parking.dto.ParkingAreaResponse;
import com.parking.entity.ParkingArea;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingAreaServiceImpl implements ParkingAreaService {

    private final ParkingAreaRepository repository;

    @Override
    public ParkingAreaResponse create(ParkingAreaRequest request) {

        if (repository.existsByAreaCode(request.getAreaCode())) {
            throw new BadRequestException("Area code already exists");
        }

        ParkingArea area = new ParkingArea();
        area.setAreaCode(request.getAreaCode());
        area.setAreaName(request.getAreaName());
        area.setDescription(request.getDescription());
        area.setStatus(request.getStatus());

        return mapToResponse(repository.save(area));
    }

    @Override
    public ParkingAreaResponse update(Long id, ParkingAreaRequest request) {

        ParkingArea area = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Parking area not found"));

        area.setAreaName(request.getAreaName());
        area.setDescription(request.getDescription());
        area.setStatus(request.getStatus());

        return mapToResponse(repository.save(area));
    }

    @Override
    public void delete(Long id) {

        ParkingArea area = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Parking area not found"));

        repository.delete(area);
    }

    @Override
    public ParkingAreaResponse getById(Long id) {

        ParkingArea area = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Parking area not found"));

        return mapToResponse(area);
    }

    @Override
    public List<ParkingAreaResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ParkingAreaResponse> getByStatus(String status) {

        return repository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ParkingAreaResponse> searchByName(String keyword) {

        return repository.findByAreaNameContaining(keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ParkingAreaResponse mapToResponse(ParkingArea area) {

        return ParkingAreaResponse.builder()
                .id(area.getId())
                .areaCode(area.getAreaCode())
                .areaName(area.getAreaName())
                .description(area.getDescription())
                .status(area.getStatus())
                .build();
    }
}