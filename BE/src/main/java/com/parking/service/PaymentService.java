package com.parking.service;

import com.parking.dto.PaymentRequestDto;
import com.parking.dto.PaymentResponseDto;
import java.security.Principal;
import java.util.List;

public interface PaymentService {
    PaymentResponseDto createPayment(PaymentRequestDto request, Principal principal);
    List<PaymentResponseDto> getPaymentHistory(Principal principal);
}
