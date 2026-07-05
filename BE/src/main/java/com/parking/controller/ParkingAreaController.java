package com.parking.controller;

import com.parking.dto.ParkingAreaRequest;
import com.parking.dto.ParkingAreaResponse;
import com.parking.service.ParkingAreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing parking area operations.
 * Provides endpoints for creating, retrieving, updating, and deleting parking areas (CRUD).
 */
@RestController
@RequestMapping("/api/parking-areas")
@RequiredArgsConstructor
public class ParkingAreaController {

    private final ParkingAreaService parkingAreaService;

    /**
     * Creates a new parking area.
     *
     * @param request The ParkingAreaRequest object containing the details of the parking area to create.
     * @return The created ParkingAreaResponse object.
     */
    @PostMapping
    public ParkingAreaResponse create(
            @Valid @RequestBody ParkingAreaRequest request) {

        return parkingAreaService.create(request);
    }

    /**
     * Updates an existing parking area by its ID.
     *
     * @param id The ID of the parking area to update.
     * @param request The ParkingAreaRequest object containing the updated details.
     * @return The updated ParkingAreaResponse object.
     */
    @PutMapping("/{id}")
    public ParkingAreaResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ParkingAreaRequest request) {

        return parkingAreaService.update(id, request);
    }

    /**
     * Deletes a parking area by its ID.
     *
     * @param id The ID of the parking area to delete.
     * @return A confirmation message upon successful deletion.
     */
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {

        parkingAreaService.delete(id);
        return "Delete successfully";
    }

    /**
     * Retrieves a parking area by its ID.
     *
     * @param id The ID of the parking area to retrieve.
     * @return The ParkingAreaResponse object corresponding to the given ID.
     */
    @GetMapping("/{id}")
    public ParkingAreaResponse getById(@PathVariable Long id) {

        return parkingAreaService.getById(id);
    }

    /**
     * Retrieves all parking areas.
     *
     * @return A list of all ParkingAreaResponse objects.
     */
    @GetMapping
    public List<ParkingAreaResponse> getAll() {

        return parkingAreaService.getAll();
    }

    /**
     * Retrieves parking areas filtered by their status.
     *
     * @param status The status to filter parking areas by.
     * @return A list of ParkingAreaResponse objects matching the given status.
     */
    @GetMapping("/status/{status}")
    public List<ParkingAreaResponse> getByStatus(
            @PathVariable String status) {

        return parkingAreaService.getByStatus(status);
    }

    /**
     * Searches for parking areas by name using a keyword.
     *
     * @param keyword The keyword to search for in parking area names.
     * @return A list of ParkingAreaResponse objects matching the search keyword.
     */
    @GetMapping("/search")
    public List<ParkingAreaResponse> search(
            @RequestParam String keyword) {

        return parkingAreaService.searchByName(keyword);
    }
}
