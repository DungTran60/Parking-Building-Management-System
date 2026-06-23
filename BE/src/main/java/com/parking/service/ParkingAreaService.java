package com.parking.service;

import com.parking.dto.ParkingAreaRequest;
import com.parking.dto.ParkingAreaResponse;

import java.util.List;

public interface ParkingAreaService {

    ParkingAreaResponse create(ParkingAreaRequest request);

    ParkingAreaResponse update(Long id, ParkingAreaRequest request);

    void delete(Long id);

    ParkingAreaResponse getById(Long id);

    List<ParkingAreaResponse> getAll();

    List<ParkingAreaResponse> getByStatus(String status);

    List<ParkingAreaResponse> searchByName(String keyword);
}