package com.parking.service;

import com.parking.dto.PaymentRequestDto;
import com.parking.dto.PaymentResponseDto;
import java.util.List;

public interface PaymentService {
    PaymentResponseDto createPayment(PaymentRequestDto request);
    List<PaymentResponseDto> getPaymentHistory();
}
