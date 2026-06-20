package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleType {

    @Id
    @Column(length = 50)
    private String id; // "motorbike", "car", "ev", "truck", "coach"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String size;

    @Column(name = "capacity_unit")
    private Integer capacityUnit;

    @Column(length = 20)
    private String color;
}
