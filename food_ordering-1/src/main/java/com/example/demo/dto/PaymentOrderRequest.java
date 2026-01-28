package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderRequest {
    // Made nullable - null means wallet top-up (no associated order)
    private Long orderId;
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be greater than 0")
    private Double amount;
    private String receipt; // Optional receipt number for reference
    private String notes; // Optional notes
    private Long userId; // Optional user ID (required if orderId is null)
}