package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.UserCreateDto;
import com.parking.dto.UserResponseDto;
import com.parking.security.JwtService;
import com.parking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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

    /**
     * Handles user login by authenticating credentials and generating a JWT token.
     *
     * @param request The LoginRequest containing username and password.
     * @return A ResponseEntity containing LoginResponse with JWT token and user details.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(userDetails);

        // Extract and format the user's role
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.startsWith("ROLE_") ? auth.substring(5) : auth)
                .findFirst()
                .orElse("DRIVER"); // Default role if none found

        LoginResponse response = LoginResponse.builder()
                .token(jwtToken)
                .username(userDetails.getUsername())
                .role(role)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Handles user registration by creating a new user account.
     *
     * @param dto The UserCreateDto containing user registration details.
     * @return A ResponseEntity containing UserResponseDto of the newly created user.
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserCreateDto dto) {
        UserResponseDto response = userService.createUser(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Handles user logout.
     * In a JWT-based authentication system, tokens are stateless, so server-side logout
     * typically involves client-side token removal. This endpoint serves as a confirmation.
     *
     * @return A ResponseEntity with a logout success message.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logout success");
    }
}
