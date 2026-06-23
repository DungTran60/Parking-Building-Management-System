package com.parking.controller;

import com.parking.dto.ParkingAreaRequest;
import com.parking.dto.ParkingAreaResponse;
import com.parking.service.ParkingAreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-areas")
@RequiredArgsConstructor
public class ParkingAreaController {

    private final ParkingAreaService parkingAreaService;

    @PostMapping
    public ParkingAreaResponse create(
            @Valid @RequestBody ParkingAreaRequest request) {

        return parkingAreaService.create(request);
    }

    @PutMapping("/{id}")
    public ParkingAreaResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ParkingAreaRequest request) {

        return parkingAreaService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {

        parkingAreaService.delete(id);
        return "Delete successfully";
    }

    @GetMapping("/{id}")
    public ParkingAreaResponse getById(@PathVariable Long id) {

        return parkingAreaService.getById(id);
    }

    @GetMapping
    public List<ParkingAreaResponse> getAll() {

        return parkingAreaService.getAll();
    }

    @GetMapping("/status/{status}")
    public List<ParkingAreaResponse> getByStatus(
            @PathVariable String status) {

        return parkingAreaService.getByStatus(status);
    }

    @GetMapping("/search")
    public List<ParkingAreaResponse> search(
            @RequestParam String keyword) {

        return parkingAreaService.searchByName(keyword);
    }
}