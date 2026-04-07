package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Train ID is required")
    private Long trainId;

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    @NotBlank(message = "PNR number is required")
    private String pnrNumber;

    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    @NotBlank(message = "Coach number is required")
    private String coachNumber;

    @NotEmpty(message = "Order items cannot be empty")
    private List<OrderItemRequest> items;

    private String deliveryInstructions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Food item ID is required")
        private Long foodItemId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}