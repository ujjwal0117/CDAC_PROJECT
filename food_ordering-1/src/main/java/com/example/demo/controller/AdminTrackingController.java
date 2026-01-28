package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tracking")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminTrackingController {

    @Autowired
    private TrackingService trackingService;

    /**
     * Assign delivery person to an order
     * Admin only
     */
    @PostMapping("/assign-delivery")
    public ResponseEntity<OrderTrackingResponse> assignDelivery(@Valid @RequestBody DeliveryAssignmentRequest request) {
        return ResponseEntity.ok(trackingService.assignDelivery(request));
    }

    /**
     * Get all active deliveries
     * Admin only
     */
    @GetMapping("/active-deliveries")
    public ResponseEntity<List<OrderTrackingResponse>> getActiveDeliveries() {
        return ResponseEntity.ok(trackingService.getActiveDeliveries());
    }

    /**
     * Create tracking for an order
     * Admin only
     */
    @PostMapping("/create/{orderId}")
    public ResponseEntity<OrderTrackingResponse> createTracking(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.createTracking(orderId));
    }

    /**
     * Get delivery person's current location
     * Admin only
     */
    @GetMapping("/delivery-person/{deliveryPersonId}/location")
    public ResponseEntity<LocationUpdateResponse> getDeliveryPersonLocation(@PathVariable Long deliveryPersonId) {
        return ResponseEntity.ok(trackingService.getLatestLocation(deliveryPersonId));
    }
}
