package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FIXED: Changed nullable = false to nullable = true (for wallet top-ups)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true)
    private Order order;

    // FIXED: Changed nullable = false to nullable = true (for wallet top-ups)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.CREATED;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    // Razorpay specific fields
    @Column(unique = true)
    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    // Payment details
    private String cardLast4; // Last 4 digits of card (if card payment)

    private String cardNetwork; // VISA, MASTERCARD, RUPAY, etc.

    private String upiId; // UPI ID (if UPI payment)

    private String bank; // Bank name (if net banking)

    private String wallet; // Wallet name (if wallet payment)

    // Refund details
    private Double refundedAmount = 0.0;

    private String refundId;

    private LocalDateTime refundedAt;

    // Additional fields
    private String receipt; // Receipt number for reference

    @Column(columnDefinition = "TEXT")
    private String notes; // Additional notes

    private String failureReason; // Reason for payment failure

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper methods
    public boolean isSuccessful() {
        return this.status == PaymentStatus.SUCCESS;
    }

    public boolean canBeRefunded() {
        return this.status == PaymentStatus.SUCCESS &&
                this.refundedAmount < this.amount;
    }

    public Double getRefundableAmount() {
        return this.amount - this.refundedAmount;
    }
}