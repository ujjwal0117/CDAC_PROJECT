package com.example.demo.dto;

import com.example.demo.entity.PantryInventory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PantryInventoryResponse {

    private Long id;
    private Long pantryId;
    private Long foodItemId;
    private String foodItemName;
    private String foodItemCategory;
    private Double foodItemPrice;
    private String imageUrl; // Added missing field
    private Integer currentStock;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private Boolean isLowStock;
    private LocalDateTime lastUpdated;

    public static PantryInventoryResponse fromEntity(PantryInventory inventory) {
        PantryInventoryResponse response = new PantryInventoryResponse();
        response.setId(inventory.getId());
        response.setPantryId(inventory.getPantry().getId());
        response.setFoodItemId(inventory.getFoodItem().getId());
        response.setFoodItemName(inventory.getFoodItem().getName());
        response.setFoodItemCategory(inventory.getFoodItem().getCategory());
        response.setFoodItemPrice(inventory.getFoodItem().getPrice());
        response.setImageUrl(inventory.getFoodItem().getImageUrl()); // Map image URL
        response.setCurrentStock(inventory.getCurrentStock());
        response.setMinStockLevel(inventory.getMinStockLevel());
        response.setMaxStockLevel(inventory.getMaxStockLevel());
        response.setIsLowStock(inventory.isLowStock());
        response.setLastUpdated(inventory.getLastUpdated());
        return response;
    }
}
