package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pantry_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PantryInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pantry_id", nullable = false)
    private Pantry pantry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false)
    private Integer currentStock = 0;

    @Column(nullable = false)
    private Integer minStockLevel = 10;

    @Column(nullable = false)
    private Integer maxStockLevel = 100;

    @UpdateTimestamp
    private LocalDateTime lastUpdated;

    // Helper method to check if stock is low
    public boolean isLowStock() {
        return currentStock <= minStockLevel;
    }

    // Helper method to check if stock is available
    public boolean isAvailable(Integer quantity) {
        return currentStock >= quantity;
    }
}
