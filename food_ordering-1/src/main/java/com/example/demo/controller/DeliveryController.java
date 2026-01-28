package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.DeliveryStatus;
import com.example.demo.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "*")
public class DeliveryController {

    @Autowired
    private TrackingService trackingService;

    /**
     * Update delivery person's GPS location
     * Delivery person role required
     */
    @PostMapping("/location")
    public ResponseEntity<LocationUpdateResponse> updateLocation(@Valid @RequestBody LocationUpdateRequest request) {
        return ResponseEntity.ok(trackingService.updateLocation(request));
    }

    /**
     * Get assigned orders for
     * Delivery person role
     */
    @GetMapping("/assigned-orders")
    public ResponseEntity<List<OrderTrackingResponse>> getAssignedOrders(@RequestParam Long deliveryPersonId) {
        return ResponseEntity.ok(trackingService.getDeliveryPersonOrders(deliveryPersonId));
    }

    /**
     * Get destination details for an order
     * Delivery person role
     */
    @GetMapping("/order/{orderId}/destination")
    public ResponseEntity<StationResponse> getOrderDestination(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.getOrderDestinationStation(orderId));
    }

    /**
     * Update delivery status
     * Delivery person role
     */
    @PutMapping("/order/{orderId}/status")
    public ResponseEntity<OrderTrackingResponse> updateDeliveryStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        DeliveryStatus deliveryStatus = DeliveryStatus.valueOf(status);
        return ResponseEntity.ok(trackingService.updateOrderStatus(orderId, deliveryStatus));
    }

    /**
     * Mark delivery as complete
     * Delivery person role
     */
    @PostMapping("/complete/{orderId}")
    public ResponseEntity<OrderTrackingResponse> completeDelivery(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.updateOrderStatus(orderId, DeliveryStatus.DELIVERED));
    }

    /**
     * Get train status for navigation
     * Delivery person role
     */
    @GetMapping("/order/{orderId}/train-status")
    public ResponseEntity<TrainStatusResponse> getTrainStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.getOrderTrainStatus(orderId));
    }
}
