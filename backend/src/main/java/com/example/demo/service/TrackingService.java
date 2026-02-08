package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.DeliveryStatus;

public interface TrackingService {

    // Order tracking
    OrderTrackingResponse createTracking(Long orderId);

    OrderTrackingResponse getOrderTracking(Long orderId);

    OrderTrackingResponse updateOrderStatus(Long orderId, DeliveryStatus newStatus);

    // Delivery assignment
    // List<OrderTrackingResponse> getDeliveryPersonOrders(Long deliveryPersonId);
    // // Keep if used by driver app? Maybe remove if admin focused.

    // List<OrderTrackingResponse> getActiveDeliveries(); // Admin only

    // Station and destination info
    StationResponse getOrderDestinationStation(Long orderId);

    // Train status
    TrainStatusResponse getOrderTrainStatus(Long orderId);
}
