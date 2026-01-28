package com.example.demo.dto;

import com.example.demo.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private String username;
    private String trainNumber;
    private String trainName;
    private String restaurantName;
    private String pnrNumber;
    private String seatNumber;
    private String coachNumber;
    private Double totalAmount;
    private String status;
    private String userFullName;
    private String userPhoneNumber;
    private String deliveryInstructions;
    private String deliveryOtp;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ReviewResponse review;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private String foodItemName;
        private Integer quantity;
        private Double price;
        private Double subtotal;
    }

    public static OrderResponse fromEntity(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setUsername(order.getUser().getUsername());
        response.setUserFullName(order.getUser().getFullName());
        response.setUserPhoneNumber(order.getUser().getPhoneNumber());

        // FIXED: Use getTrainName() to match Train entity field name
        if (order.getTrain() != null) {
            response.setTrainNumber(order.getTrain().getTrainNumber());
            response.setTrainName(order.getTrain().getTrainName()); // Correct method!
        }

        response.setRestaurantName(order.getRestaurant().getName());
        response.setPnrNumber(order.getPnrNumber());
        response.setSeatNumber(order.getSeatNumber());
        response.setCoachNumber(order.getCoachNumber());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setDeliveryInstructions(order.getDeliveryInstructions());
        response.setDeliveryOtp(order.getDeliveryOtp());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        response.setItems(order.getOrderItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getFoodItem().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getSubtotal()))
                .collect(Collectors.toList()));

        if (order.getReview() != null) {
            System.out.println("DEBUG: OrderResponse - Found Review for Order " + order.getId());
            response.setReview(ReviewResponse.fromEntity(order.getReview()));
        } else {
            System.out.println("DEBUG: OrderResponse - NO Review found for Order " + order.getId());
        }

        return response;
    }
}