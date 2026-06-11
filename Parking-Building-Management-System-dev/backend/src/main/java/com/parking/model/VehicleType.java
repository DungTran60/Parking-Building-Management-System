package com.parking.model;

import java.sql.Timestamp;

/**
 * Entity đại diện cho một loại phương tiện trong hệ thống quản lý bãi đỗ xe.
 * Ví dụ: CAR (Ô tô), MOTORBIKE (Xe máy), TRUCK (Xe tải).
 */
public class VehicleType {

    private Integer id;

    /** Tên loại phương tiện (ví dụ: CAR, MOTORBIKE, TRUCK). Phải là duy nhất. */
    private String name;

    /** Mô tả chi tiết về loại phương tiện. */
    private String description;

    /** Thời điểm bản ghi được tạo ra trong hệ thống. */
    private Timestamp createdAt;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    public VehicleType() {
    }

    public VehicleType(Integer id, String name, String description, Timestamp createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    // -------------------------------------------------------------------------
    // toString
    // -------------------------------------------------------------------------

    @Override
    public String toString() {
        return "VehicleType{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
