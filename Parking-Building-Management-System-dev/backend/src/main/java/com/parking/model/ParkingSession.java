package com.parking.model;

import java.sql.Timestamp;

public class ParkingSession {
    private Integer id;
    private String licensePlate;
    private int slotId;
    private Integer userId;
    private Timestamp checkInTime;
    private Timestamp checkOutTime;
    private String status; // ACTIVE, COMPLETED

    public ParkingSession() {
    }

    public ParkingSession(Integer id, String licensePlate, int slotId, Integer userId, Timestamp checkInTime, Timestamp checkOutTime, String status) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.slotId = slotId;
        this.userId = userId;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public int getSlotId() {
        return slotId;
    }

    public void setSlotId(int slotId) {
        this.slotId = slotId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Timestamp getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(Timestamp checkInTime) {
        this.checkInTime = checkInTime;
    }

    public Timestamp getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(Timestamp checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
