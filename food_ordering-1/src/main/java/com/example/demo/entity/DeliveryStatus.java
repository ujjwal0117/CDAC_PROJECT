package com.example.demo.entity;

public enum DeliveryStatus {
    PLACED, // Order placed, not yet confirmed
    CONFIRMED, // Payment confirmed
    PREPARING, // Restaurant preparing food
    READY, // Food ready for pickup
    ASSIGNED_TO_DELIVERY, // Assigned to delivery person
    OUT_FOR_DELIVERY, // Delivery person picked up and on the way
    REACHED_STATION, // Delivery person reached station
    DELIVERED, // Successfully delivered
    CANCELLED // Order cancelled
}
