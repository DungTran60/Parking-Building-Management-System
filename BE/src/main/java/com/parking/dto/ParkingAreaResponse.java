package com.parking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ParkingAreaResponse {

    private Long id;

    private String areaCode;

    private String areaName;

    private String description;

    private String status;
}