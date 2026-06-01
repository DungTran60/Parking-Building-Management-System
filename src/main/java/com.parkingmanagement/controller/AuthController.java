package com.parkingmanagement.controller;

import org.springframework.web.bind.annotation.*;

import com.parkingmanagement.dto.RegisterRequest;
import com.parkingmanagement.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService) {

        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(
            @RequestBody RegisterRequest request) {

        return authService.register(request);
    }
}
