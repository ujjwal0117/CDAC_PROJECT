package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PantryInventoryRequest {

    @NotNull(message = "Food item ID is required")
    private Long foodItemId;

    @NotNull(message = "Current stock is required")
    @Min(value = 0, message = "Current stock must be non-negative")
    private Integer currentStock;

    @NotNull(message = "Minimum stock level is required")
    @Min(value = 0, message = "Minimum stock level must be non-negative")
    private Integer minStockLevel;

    @NotNull(message = "Maximum stock level is required")
    @Min(value = 1, message = "Maximum stock level must be positive")
    private Integer maxStockLevel;
}
