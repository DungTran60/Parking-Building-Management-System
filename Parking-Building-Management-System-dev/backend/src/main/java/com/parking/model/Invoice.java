package com.parking.model;

import java.sql.Timestamp;

public class Invoice {
    private Integer id;
    private int sessionId;
    private double amount;
    private Timestamp paymentTime;
    private String paymentMethod; // CASH, CARD, E_WALLET
    private String status;         // PAID, UNPAID

    public Invoice() {
    }

    public Invoice(Integer id, int sessionId, double amount, Timestamp paymentTime, String paymentMethod, String status) {
        this.id = id;
        this.sessionId = sessionId;
        this.amount = amount;
        this.paymentTime = paymentTime;
        this.paymentMethod = paymentMethod;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getSessionId() {
        return sessionId;
    }

    public void setSessionId(int sessionId) {
        this.sessionId = sessionId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Timestamp getPaymentTime() {
        return paymentTime;
    }

    public void setPaymentTime(Timestamp paymentTime) {
        this.paymentTime = paymentTime;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
