package com.example.demo.entity;

public enum PaymentStatus {
    CREATED, // Payment order created
    PENDING, // Awaiting payment
    SUCCESS, // Payment successful
    FAILED, // Payment failed
    REFUNDED, // Payment refunded
    PARTIAL_REFUND // Partially refunded
}
