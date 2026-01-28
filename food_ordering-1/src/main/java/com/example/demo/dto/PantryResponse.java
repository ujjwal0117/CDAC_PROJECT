package com.example.demo.dto;

import com.example.demo.entity.Pantry;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PantryResponse {

    private Long id;
    private Long trainId;
    private String trainNumber;
    private String trainName;
    private String pantryCode;
    private String coachNumber;
    private String contactNumber;
    private String managerName;
    private Boolean active;
    private Integer totalInventoryItems;
    private Integer lowStockItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PantryResponse fromEntity(Pantry pantry) {
        PantryResponse response = new PantryResponse();
        response.setId(pantry.getId());
        response.setTrainId(pantry.getTrain().getId());
        response.setTrainNumber(pantry.getTrain().getTrainNumber());
        response.setTrainName(pantry.getTrain().getTrainName());
        response.setPantryCode(pantry.getPantryCode());
        response.setCoachNumber(pantry.getCoachNumber());
        response.setContactNumber(pantry.getContactNumber());
        response.setManagerName(pantry.getManagerName());
        response.setActive(pantry.getActive());

        if (pantry.getInventory() != null) {
            response.setTotalInventoryItems(pantry.getInventory().size());
            response.setLowStockItems((int) pantry.getInventory().stream()
                    .filter(inv -> inv.isLowStock())
                    .count());
        } else {
            response.setTotalInventoryItems(0);
            response.setLowStockItems(0);
        }

        response.setCreatedAt(pantry.getCreatedAt());
        response.setUpdatedAt(pantry.getUpdatedAt());
        return response;
    }
}
