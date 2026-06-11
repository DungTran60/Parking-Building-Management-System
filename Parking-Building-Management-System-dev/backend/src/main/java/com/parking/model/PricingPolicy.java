package com.parking.model;

import java.sql.Timestamp;

public class PricingPolicy {
    private Integer id;
    private String vehicleType;
    private double baseRate;
    private double hourlyRate;
    private Timestamp lastUpdated;

    public PricingPolicy() {
    }

    public PricingPolicy(Integer id, String vehicleType, double baseRate, double hourlyRate, Timestamp lastUpdated) {
        this.id = id;
        this.vehicleType = vehicleType;
        this.baseRate = baseRate;
        this.hourlyRate = hourlyRate;
        this.lastUpdated = lastUpdated;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public double getBaseRate() {
        return baseRate;
    }

    public void setBaseRate(double baseRate) {
        this.baseRate = baseRate;
    }

    public double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
