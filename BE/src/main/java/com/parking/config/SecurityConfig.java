package com.parking.config;

import com.parking.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    /**
     * Configures the security filter chain for HTTP requests.
     * Defines security rules for different endpoints, CSRF protection, session management,
     * authentication providers, and JWT filter integration.
     *
     * @param http The HttpSecurity object to configure.
     * @return The configured SecurityFilterChain.
     * @throws Exception if an error occurs during configuration.
     */
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Configure CORS (Cross-Origin Resource Sharing)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Disable CSRF (Cross-Site Request Forgery) protection as it's not needed for stateless APIs (JWT based)
            .csrf(AbstractHttpConfigurer::disable)
            // Configure authorization rules for HTTP requests
            .authorizeHttpRequests(auth -> auth
                // Allow public access to authentication-related endpoints
                .requestMatchers("/api/auth/**").permitAll()
                // Allow public access to slot-related endpoints (e.g., viewing available slots)
                .requestMatchers("/api/slots/**").permitAll()
                // Allow public access to session-related endpoints (e.g., parking session details)
                .requestMatchers("/api/sessions/**").permitAll()
                // Allow public access to payment-related endpoints
                .requestMatchers("/api/payments/**").permitAll()
                // Allow public access to error page
                .requestMatchers("/error").permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            // Configure session management to be stateless, as JWT handles authentication state
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // Register the custom authentication provider
            .authenticationProvider(authenticationProvider())
            // Add the JWT authentication filter before the standard UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    //mã hóa mật khẩu và lưu vào container của spring boot
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures the CORS settings for the application.
     * This allows the frontend to make requests to the backend from different origins.
     * In a production environment, it's recommended to restrict allowed origins to specific domains.
     *
     * @return A CorsConfigurationSource with the defined CORS rules.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow requests from all origins (consider restricting in production)
        configuration.setAllowedOrigins(List.of("*"));
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Allow specific headers in requests
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        // Expose specific headers to the client
        configuration.setExposedHeaders(List.of("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all paths
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
