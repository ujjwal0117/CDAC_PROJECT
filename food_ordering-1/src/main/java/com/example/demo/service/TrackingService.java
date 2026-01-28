package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.DeliveryStatus;

import java.util.List;

public interface TrackingService {

    // Order tracking
    OrderTrackingResponse createTracking(Long orderId);

    OrderTrackingResponse getOrderTracking(Long orderId);

    OrderTrackingResponse updateOrderStatus(Long orderId, DeliveryStatus newStatus);

    // Delivery assignment
    OrderTrackingResponse assignDelivery(DeliveryAssignmentRequest request);

    List<OrderTrackingResponse> getDeliveryPersonOrders(Long deliveryPersonId);

    List<OrderTrackingResponse> getActiveDeliveries();

    // Location tracking
    LocationUpdateResponse updateLocation(LocationUpdateRequest request);

    LocationUpdateResponse getLatestLocation(Long deliveryPersonId);

    LocationUpdateResponse getOrderDeliveryLocation(Long orderId);

    // Station and destination info
    StationResponse getOrderDestinationStation(Long orderId);

    // Train status
    TrainStatusResponse getOrderTrainStatus(Long orderId);
}
