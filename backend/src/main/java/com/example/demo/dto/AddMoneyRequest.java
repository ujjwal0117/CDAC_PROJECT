package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddMoneyRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Amount is required")
    @Min(value = 100, message = "Minimum amount to add is ₹100")
    @Max(value = 10000, message = "Maximum amount to add is ₹10,000")
    private Double amount;

    private String paymentMethod; // CARD, UPI, NET_BANKING, etc.
}
