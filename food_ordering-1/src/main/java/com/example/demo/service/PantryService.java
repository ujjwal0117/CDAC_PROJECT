package com.example.demo.service;

import com.example.demo.dto.PantryInventoryRequest;
import com.example.demo.dto.PantryInventoryResponse;
import com.example.demo.dto.PantryRequest;
import com.example.demo.dto.PantryResponse;

import java.util.List;

public interface PantryService {

    PantryResponse createPantry(PantryRequest request);

    PantryResponse getPantryById(Long id);

    PantryResponse getPantryByCode(String pantryCode);

    List<PantryResponse> getPantriesByTrainId(Long trainId);

    List<PantryResponse> getAllActivePantries();

    PantryResponse updatePantry(Long id, PantryRequest request);

    void deletePantry(Long id);

    PantryInventoryResponse addInventoryItem(Long pantryId, PantryInventoryRequest request);

    PantryInventoryResponse updateInventoryItem(Long pantryId, Long inventoryId, PantryInventoryRequest request);

    PantryInventoryResponse updateStockLevel(Long pantryId, Long foodItemId, Integer quantity);

    void removeInventoryItem(Long pantryId, Long inventoryId);

    List<PantryInventoryResponse> getPantryInventory(Long pantryId);

    List<PantryInventoryResponse> getLowStockItems(Long pantryId);

    List<PantryInventoryResponse> getAllLowStockItems();

    boolean checkStockAvailability(Long pantryId, Long foodItemId, Integer quantity);

    void deductStock(Long pantryId, Long foodItemId, Integer quantity);

    // NEW: Public menu endpoints
    List<PantryInventoryResponse> getAllAvailableMenuItems();

    List<PantryInventoryResponse> getMenuItemsByTrainId(Long trainId);
}