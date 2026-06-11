package com.parking.model;

import java.sql.Timestamp;

public class ExceptionLog {
    private Integer id;
    private Integer sessionId;
    private String logMessage;
    private String resolved; // YES, NO
    private Timestamp createdAt;

    public ExceptionLog() {
    }

    public ExceptionLog(Integer id, Integer sessionId, String logMessage, String resolved, Timestamp createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.logMessage = logMessage;
        this.resolved = resolved;
        this.createdAt = createdAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSessionId() {
        return sessionId;
    }

    public void setSessionId(Integer sessionId) {
        this.sessionId = sessionId;
    }

    public String getLogMessage() {
        return logMessage;
    }

    public void setLogMessage(String logMessage) {
        this.logMessage = logMessage;
    }

    public String getResolved() {
        return resolved;
    }

    public void setResolved(String resolved) {
        this.resolved = resolved;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
