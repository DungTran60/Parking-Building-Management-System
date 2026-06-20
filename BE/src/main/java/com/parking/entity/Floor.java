package com.parking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "floors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Floor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 100)
    private String zone;

    @Column(name = "slot_count")
    private Integer slotCount;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "floor_supported_vehicle_types",
        joinColumns = @JoinColumn(name = "floor_id"),
        inverseJoinColumns = @JoinColumn(name = "vehicle_type_id")
    )
    private Set<VehicleType> supportedVehicleTypes;
}
