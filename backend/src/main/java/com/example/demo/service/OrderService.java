package com.example.demo.service;

import com.example.demo.dto.OrderRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.entity.Order;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request);

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getOrdersByUserId(Long userId);

    OrderResponse updateOrderStatus(Long id, Order.OrderStatus status);

    List<OrderResponse> getAllOrders();

    List<OrderResponse> getOrdersByOwnerId(Long ownerId);
}
