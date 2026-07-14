package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.repository.UserRepository;
import com.parking.security.JwtService;
import com.parking.service.AuditService;
import com.parking.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuditService auditService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        when(httpServletRequest.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpServletRequest.getHeader("User-Agent")).thenReturn("JUnit-Test");
    }

    @Test
    void loginShouldAuditFailedAuthenticationWhenCredentialsAreInvalid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("wrong-user");
        request.setPassword("wrong-password");

        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));
        when(userRepository.findByUsername("wrong-user")).thenReturn(Optional.of(new com.parking.entity.User()));

        assertThrows(BadCredentialsException.class, () -> authController.login(request, httpServletRequest));

        verify(auditService).log(
                eq("LOGIN_FAILED"),
                eq("AUTH"),
                eq(-1L),
                eq(-1L),
                eq("wrong-user"),
                eq("127.0.0.1"),
                eq("JUnit-Test")
        );
    }
}
