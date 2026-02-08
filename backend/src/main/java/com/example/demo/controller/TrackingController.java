package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {

    @Autowired
    private TrackingService trackingService;

    /**
     * Get complete order tracking information
     * Customer facing API
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<OrderTrackingResponse> getOrderTracking(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.getOrderTracking(orderId));
    }

    /**
     * Get train live status for an order
     * Customer facing API
     */
    @GetMapping("/order/{orderId}/train-status")
    public ResponseEntity<TrainStatusResponse> getTrainStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.getOrderTrainStatus(orderId));
    }

    /**
     * Get destination station details
     * Customer facing API
     */
    @GetMapping("/order/{orderId}/destination")
    public ResponseEntity<StationResponse> getDestination(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.getOrderDestinationStation(orderId));
    }
}
