package com.parking.controller;

import com.parking.dto.PaymentRequestDto;
import com.parking.dto.PaymentResponseDto;
import com.parking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponseDto> createPayment(@RequestBody PaymentRequestDto request, Principal principal) {
        return ResponseEntity.ok(paymentService.createPayment(request, principal));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponseDto>> getPaymentHistory(Principal principal) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(principal));
    }
}
