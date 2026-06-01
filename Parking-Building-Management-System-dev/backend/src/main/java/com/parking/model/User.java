package com.parking.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.sql.Timestamp;

public class User {
    private Integer id;
    private String username;
    
    // Trường chỉ ghi (WRITE_ONLY) để tránh vô tình trả về mật khẩu đã băm trong phản hồi JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    private String fullName;
    private String phoneNumber;
    private String role; // Phân quyền: 'user', 'staff', 'admin'
    private Timestamp createdAt;

    // Phương thức khởi tạo (Constructors)
    public User() {
    }

    public User(Integer id, String username, String password, String fullName, String phoneNumber, String role, Timestamp createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.createdAt = createdAt;
    }

    // Các phương thức Getter và Setter
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", role='" + role + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
