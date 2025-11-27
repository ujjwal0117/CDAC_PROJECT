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
    private String deliveryInstructions;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
        response.setTrainNumber(order.getTrain().getTrainNumber());
        response.setTrainName(order.getTrain().getTrainName());
        response.setRestaurantName(order.getRestaurant().getName());
        response.setPnrNumber(order.getPnrNumber());
        response.setSeatNumber(order.getSeatNumber());
        response.setCoachNumber(order.getCoachNumber());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setDeliveryInstructions(order.getDeliveryInstructions());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        response.setItems(order.getOrderItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getFoodItem().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList()));

        return response;
    }
}