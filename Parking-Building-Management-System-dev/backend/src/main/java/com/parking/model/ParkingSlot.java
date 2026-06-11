package com.parking.model;

public class ParkingSlot {
    private Integer id;
    private String slotCode;
    private int floorId;
    private String slotType; // e.g. CAR, MOTORBIKE
    private String status;   // e.g. AVAILABLE, OCCUPIED, RESERVED

    public ParkingSlot() {
    }

    public ParkingSlot(Integer id, String slotCode, int floorId, String slotType, String status) {
        this.id = id;
        this.slotCode = slotCode;
        this.floorId = floorId;
        this.slotType = slotType;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSlotCode() {
        return slotCode;
    }

    public void setSlotCode(String slotCode) {
        this.slotCode = slotCode;
    }

    public int getFloorId() {
        return floorId;
    }

    public void setFloorId(int floorId) {
        this.floorId = floorId;
    }

    public String getSlotType() {
        return slotType;
    }

    public void setSlotType(String slotType) {
        this.slotType = slotType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
