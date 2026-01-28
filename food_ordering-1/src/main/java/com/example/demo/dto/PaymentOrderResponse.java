package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {

    private Long paymentId;
    private String razorpayOrderId;
    private Double amount;
    private String currency;
    private String status;
    private String razorpayKeyId; // For frontend integration
    private String receipt;
    private Long orderId;
    private String notes;
}
