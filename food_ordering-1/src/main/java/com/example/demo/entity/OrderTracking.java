package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_person_id")
    private DeliveryPerson deliveryPerson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus currentStatus = DeliveryStatus.PLACED;

    private LocalDateTime placedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime preparingAt;
    private LocalDateTime readyAt;
    private LocalDateTime assignedAt;
    private LocalDateTime outForDeliveryAt;
    private LocalDateTime reachedStationAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;

    private LocalDateTime estimatedDeliveryTime;

    @Column(columnDefinition = "TEXT")
    private String notes; // Any special instructions or notes

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method to update status with timestamp
    public void updateStatus(DeliveryStatus newStatus) {
        this.currentStatus = newStatus;
        LocalDateTime now = LocalDateTime.now();

        switch (newStatus) {
            case PLACED:
                this.placedAt = now;
                break;
            case CONFIRMED:
                this.confirmedAt = now;
                break;
            case PREPARING:
                this.preparingAt = now;
                break;
            case READY:
                this.readyAt = now;
                break;
            case ASSIGNED_TO_DELIVERY:
                this.assignedAt = now;
                break;
            case OUT_FOR_DELIVERY:
                this.outForDeliveryAt = now;
                break;
            case REACHED_STATION:
                this.reachedStationAt = now;
                break;
            case DELIVERED:
                this.deliveredAt = now;
                break;
            case CANCELLED:
                this.cancelledAt = now;
                break;
        }
    }
}
