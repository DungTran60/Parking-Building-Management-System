package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parking_area")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String areaCode;

    private String areaName;

    private String description;

    private String status;

}