package com.example.demo.entity;

public enum DeliveryStatus {
    PLACED, // Order placed, not yet confirmed
    CONFIRMED, // Payment confirmed
    PREPARING, // Restaurant preparing food
    READY, // Food ready for pickup
    OUT_FOR_DELIVERY, // Food on the way to the train seat
    REACHED_STATION, // Reached train station
    DELIVERED, // Successfully delivered
    CANCELLED // Order cancelled
}
