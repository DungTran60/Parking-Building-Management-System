package com.parking.model;

import java.sql.Timestamp;

public class Floor {
    private Integer id;
    private String floorName;
    private int totalSlots;
    private Timestamp createdAt;

    public Floor() {
    }

    public Floor(Integer id, String floorName, int totalSlots, Timestamp createdAt) {
        this.id = id;
        this.floorName = floorName;
        this.totalSlots = totalSlots;
        this.createdAt = createdAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFloorName() {
        return floorName;
    }

    public void setFloorName(String floorName) {
        this.floorName = floorName;
    }

    public int getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(int totalSlots) {
        this.totalSlots = totalSlots;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Floor{" +
                "id=" + id +
                ", floorName='" + floorName + '\'' +
                ", totalSlots=" + totalSlots +
                ", createdAt=" + createdAt +
                '}';
    }
}

