package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.dto.UserCreateDto;
import com.parking.dto.UserResponseDto;
import com.parking.entity.Status;
import com.parking.repository.UserRepository;
import com.parking.security.JwtService;
import com.parking.service.AuditService;
import com.parking.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final UserRepository userRepository;

    // Xác thực đăng nhập (login).
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwtToken = jwtService.generateToken(userDetails);

            String role = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(auth -> auth.startsWith("ROLE_") ? auth.substring(5) : auth)
                    .findFirst()
                    .orElse("DRIVER");

            auditAuthenticationEvent("LOGIN", userDetails.getUsername(), httpRequest);

            LoginResponse response = LoginResponse.builder()
                    .token(jwtToken)
                    .username(userDetails.getUsername())
                    .role(role)
                    .build();

            return ResponseEntity.ok(response);
        } catch (AuthenticationException ex) {
            auditAuthenticationEvent("LOGIN_FAILED", request.getUsername(), httpRequest);
            throw ex;
        }
    }

    private void auditAuthenticationEvent(String action, String username, HttpServletRequest httpRequest) {
        String ip = resolveClientIp(httpRequest);
        String userAgent = resolveUserAgent(httpRequest);
        userRepository.findByUsername(username).ifPresentOrElse(
                user -> {
                    Long actorId = user.getId() != null ? user.getId() : -1L;
                    String actorUsername = (user.getUsername() != null && !user.getUsername().isBlank()) ? user.getUsername() : username;
                    auditService.log(action, "AUTH", actorId, actorId, actorUsername, ip, userAgent);
                },
                () -> auditService.log(action, "AUTH", -1L, -1L, username, ip, userAgent)
        );
    }

    private String resolveClientIp(HttpServletRequest httpRequest) {
        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            return ip.split(",")[0].trim();
        }
        return httpRequest.getRemoteAddr();
    }

    private String resolveUserAgent(HttpServletRequest httpRequest) {
        return httpRequest.getHeader("User-Agent");
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody RegisterRequest request) {
        // Public self-registration must never accept a privileged role from the client.
        UserCreateDto dto = UserCreateDto.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .roleName("DRIVER")
                .status(Status.ACTIVE)
                .build();
        UserResponseDto response = userService.createUser(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            jwtService.blacklistToken(token);

            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetails userDetails) {
                userRepository.findByUsername(userDetails.getUsername()).ifPresent(user -> {
                    String ip = httpRequest.getHeader("X-Forwarded-For");
                    if (ip == null || ip.isEmpty()) ip = httpRequest.getRemoteAddr();
                    String userAgent = httpRequest.getHeader("User-Agent");
                    auditService.log("LOGOUT", "AUTH", user.getId(), user.getId(), user.getUsername(), ip, userAgent);
                });
            }
        }
        return ResponseEntity.ok("Logout success");
    }
}
