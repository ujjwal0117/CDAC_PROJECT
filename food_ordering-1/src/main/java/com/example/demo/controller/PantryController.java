package com.example.demo.controller;

import com.example.demo.dto.PantryInventoryRequest;
import com.example.demo.dto.PantryInventoryResponse;
import com.example.demo.dto.PantryRequest;
import com.example.demo.dto.PantryResponse;
import com.example.demo.service.PantryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pantry")
@CrossOrigin(origins = "*")
public class PantryController {

    @Autowired
    private PantryService pantryService;

    /**
     * Get all pantry menu items (PUBLIC - for pantry menu page)
     */
    @GetMapping("/menu")
    public ResponseEntity<List<PantryInventoryResponse>> getPantryMenu() {
        return ResponseEntity.ok(pantryService.getAllAvailableMenuItems());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PantryResponse> createPantry(@Valid @RequestBody PantryRequest request) {
        return ResponseEntity.ok(pantryService.createPantry(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PantryResponse> getPantryById(@PathVariable Long id) {
        return ResponseEntity.ok(pantryService.getPantryById(id));
    }

    @GetMapping("/code/{pantryCode}")
    public ResponseEntity<PantryResponse> getPantryByCode(@PathVariable String pantryCode) {
        return ResponseEntity.ok(pantryService.getPantryByCode(pantryCode));
    }

    @GetMapping("/train/{trainId}")
    public ResponseEntity<List<PantryResponse>> getPantriesByTrain(@PathVariable Long trainId) {
        return ResponseEntity.ok(pantryService.getPantriesByTrainId(trainId));
    }

    /**
     * Get pantry menu items for a specific train (PUBLIC - for pantry menu page)
     */
    @GetMapping("/train/{trainId}/menu")
    public ResponseEntity<List<PantryInventoryResponse>> getTrainPantryMenu(@PathVariable Long trainId) {
        return ResponseEntity.ok(pantryService.getMenuItemsByTrainId(trainId));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PantryResponse>> getAllActivePantries() {
        return ResponseEntity.ok(pantryService.getAllActivePantries());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PantryResponse> updatePantry(
            @PathVariable Long id,
            @Valid @RequestBody PantryRequest request) {
        return ResponseEntity.ok(pantryService.updatePantry(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePantry(@PathVariable Long id) {
        pantryService.deletePantry(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{pantryId}/inventory")
    public ResponseEntity<List<PantryInventoryResponse>> getPantryInventory(@PathVariable Long pantryId) {
        return ResponseEntity.ok(pantryService.getPantryInventory(pantryId));
    }

    @PostMapping("/{pantryId}/inventory")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PantryInventoryResponse> addInventoryItem(
            @PathVariable Long pantryId,
            @Valid @RequestBody PantryInventoryRequest request) {
        return ResponseEntity.ok(pantryService.addInventoryItem(pantryId, request));
    }

    @PutMapping("/{pantryId}/inventory/{inventoryId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PantryInventoryResponse> updateInventoryItem(
            @PathVariable Long pantryId,
            @PathVariable Long inventoryId,
            @Valid @RequestBody PantryInventoryRequest request) {
        return ResponseEntity.ok(pantryService.updateInventoryItem(pantryId, inventoryId, request));
    }

    @PutMapping("/{pantryId}/inventory/food/{foodItemId}/stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PantryInventoryResponse> updateStockLevel(
            @PathVariable Long pantryId,
            @PathVariable Long foodItemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(pantryService.updateStockLevel(pantryId, foodItemId, quantity));
    }

    @DeleteMapping("/{pantryId}/inventory/{inventoryId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> removeInventoryItem(
            @PathVariable Long pantryId,
            @PathVariable Long inventoryId) {
        pantryService.removeInventoryItem(pantryId, inventoryId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{pantryId}/inventory/low-stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PantryInventoryResponse>> getLowStockItems(@PathVariable Long pantryId) {
        return ResponseEntity.ok(pantryService.getLowStockItems(pantryId));
    }

    @GetMapping("/inventory/low-stock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PantryInventoryResponse>> getAllLowStockItems() {
        return ResponseEntity.ok(pantryService.getAllLowStockItems());
    }

    @GetMapping("/{pantryId}/inventory/check-availability")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Boolean> checkStockAvailability(
            @PathVariable Long pantryId,
            @RequestParam Long foodItemId,
            @RequestParam Integer quantity) {
        boolean available = pantryService.checkStockAvailability(pantryId, foodItemId, quantity);
        return ResponseEntity.ok(available);
    }
}