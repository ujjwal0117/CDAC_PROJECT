package com.example.demo.service.Impl;

import com.example.demo.dto.PantryInventoryRequest;
import com.example.demo.dto.PantryInventoryResponse;
import com.example.demo.dto.PantryRequest;
import com.example.demo.dto.PantryResponse;
import com.example.demo.entity.FoodItem;
import com.example.demo.entity.Pantry;
import com.example.demo.entity.PantryInventory;
import com.example.demo.entity.Train;
import com.example.demo.repository.FoodItemRepository;
import com.example.demo.repository.PantryInventoryRepository;
import com.example.demo.repository.PantryRepository;
import com.example.demo.repository.TrainRepository;
import com.example.demo.service.PantryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PantryServiceImpl implements PantryService {

    @Autowired
    private PantryRepository pantryRepository;

    @Autowired
    private PantryInventoryRepository pantryInventoryRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Override
    public List<PantryInventoryResponse> getAllAvailableMenuItems() {
        List<Pantry> activePantries = pantryRepository.findByActiveTrue();
        List<PantryInventoryResponse> allMenuItems = new ArrayList<>();

        for (Pantry pantry : activePantries) {
            List<PantryInventory> inventory = pantryInventoryRepository.findByPantryId(pantry.getId());
            allMenuItems.addAll(inventory.stream()
                    .map(PantryInventoryResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return allMenuItems;
    }

    @Override
    @Transactional
    public PantryResponse createPantry(PantryRequest request) {
        Long trainId = request.getTrainId();
        if (trainId == null)
            throw new RuntimeException("Train ID is required");
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new RuntimeException("Train not found with ID: " + trainId));

        if (pantryRepository.existsByPantryCode(request.getPantryCode())) {
            throw new RuntimeException("Pantry code already exists: " + request.getPantryCode());
        }

        Pantry pantry = new Pantry();
        pantry.setTrain(train);
        pantry.setPantryCode(request.getPantryCode());
        pantry.setCoachNumber(request.getCoachNumber());
        pantry.setContactNumber(request.getContactNumber());
        pantry.setManagerName(request.getManagerName());
        pantry.setActive(true);

        Pantry savedPantry = pantryRepository.save(pantry);
        return PantryResponse.fromEntity(savedPantry);
    }

    @Override
    public PantryResponse getPantryById(Long id) {
        Long pantryId = id;
        if (pantryId == null)
            return null;
        Pantry pantry = pantryRepository.findById(pantryId)
                .orElseThrow(() -> new RuntimeException("Pantry not found with ID: " + pantryId));
        return PantryResponse.fromEntity(pantry);
    }

    @Override
    public PantryResponse getPantryByCode(String pantryCode) {
        Pantry pantry = pantryRepository.findByPantryCode(pantryCode)
                .orElseThrow(() -> new RuntimeException("Pantry not found with code: " + pantryCode));
        return PantryResponse.fromEntity(pantry);
    }

    @Override
    public List<PantryResponse> getPantriesByTrainId(Long trainId) {
        List<Pantry> pantries = pantryRepository.findByTrainIdAndActiveTrue(trainId);
        return pantries.stream()
                .map(PantryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<PantryResponse> getAllActivePantries() {
        List<Pantry> pantries = pantryRepository.findByActiveTrue();
        return pantries.stream()
                .map(PantryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PantryResponse updatePantry(Long id, PantryRequest request) {
        Long pantryId = id;
        if (pantryId == null)
            throw new RuntimeException("ID is required");
        Long trainId = request.getTrainId();
        if (trainId == null)
            throw new RuntimeException("Train ID is required");
        Pantry pantry = pantryRepository.findById(pantryId)
                .orElseThrow(() -> new RuntimeException("Pantry not found with ID: " + pantryId));

        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new RuntimeException("Train not found with ID: " + trainId));

        if (!pantry.getPantryCode().equals(request.getPantryCode())) {
            if (pantryRepository.existsByPantryCode(request.getPantryCode())) {
                throw new RuntimeException("Pantry code already exists: " + request.getPantryCode());
            }
        }

        pantry.setTrain(train);
        pantry.setPantryCode(request.getPantryCode());
        pantry.setCoachNumber(request.getCoachNumber());
        pantry.setContactNumber(request.getContactNumber());
        pantry.setManagerName(request.getManagerName());

        Pantry updatedPantry = pantryRepository.save(pantry);
        return PantryResponse.fromEntity(updatedPantry);
    }

    @Override
    @Transactional
    public void deletePantry(Long id) {
        if (id == null)
            return;
        Pantry pantry = pantryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pantry not found with ID: " + id));
        pantry.setActive(false);
        pantryRepository.save(pantry);
    }

    @Override
    @Transactional
    public PantryInventoryResponse addInventoryItem(Long pantryId, PantryInventoryRequest request) {
        if (pantryId == null)
            throw new RuntimeException("Pantry ID is required");
        Pantry pantry = pantryRepository.findById(pantryId)
                .orElseThrow(() -> new RuntimeException("Pantry not found with ID: " + pantryId));

        Long foodItemId = request.getFoodItemId();
        if (foodItemId == null)
            throw new RuntimeException("Food Item ID is required");
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new RuntimeException("Food item not found with ID: " + foodItemId));

        if (pantryInventoryRepository.findByPantryIdAndFoodItemId(pantryId, foodItemId).isPresent()) {
            throw new RuntimeException("Inventory item already exists for this food item in this pantry");
        }

        PantryInventory inventory = new PantryInventory();
        inventory.setPantry(pantry);
        inventory.setFoodItem(foodItem);
        inventory.setCurrentStock(request.getCurrentStock());
        inventory.setMinStockLevel(request.getMinStockLevel());
        inventory.setMaxStockLevel(request.getMaxStockLevel());

        PantryInventory savedInventory = pantryInventoryRepository.save(inventory);
        return PantryInventoryResponse.fromEntity(savedInventory);
    }

    @Override
    @Transactional
    public PantryInventoryResponse updateInventoryItem(Long pantryId, Long inventoryId,
            PantryInventoryRequest request) {
        if (inventoryId == null)
            throw new RuntimeException("Inventory ID is required");
        PantryInventory inventory = pantryInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + inventoryId));

        if (!inventory.getPantry().getId().equals(pantryId)) {
            throw new RuntimeException("Inventory item does not belong to this pantry");
        }

        inventory.setCurrentStock(request.getCurrentStock());
        inventory.setMinStockLevel(request.getMinStockLevel());
        inventory.setMaxStockLevel(request.getMaxStockLevel());

        PantryInventory updatedInventory = pantryInventoryRepository.save(inventory);
        return PantryInventoryResponse.fromEntity(updatedInventory);
    }

    @Override
    @Transactional
    public PantryInventoryResponse updateStockLevel(Long pantryId, Long foodItemId, Integer quantity) {
        if (pantryId == null || foodItemId == null)
            throw new RuntimeException("Pantry ID and Food Item ID are required");

        PantryInventory inventory = pantryInventoryRepository.findByPantryIdAndFoodItemId(pantryId, foodItemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found for this food item in this pantry"));

        inventory.setCurrentStock(quantity);
        PantryInventory updatedInventory = pantryInventoryRepository.save(inventory);
        return PantryInventoryResponse.fromEntity(updatedInventory);
    }

    @Override
    @Transactional
    public void removeInventoryItem(Long pantryId, Long inventoryId) {
        if (inventoryId == null)
            return;
        PantryInventory inventory = pantryInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + inventoryId));

        if (!inventory.getPantry().getId().equals(pantryId)) {
            throw new RuntimeException("Inventory item does not belong to this pantry");
        }

        pantryInventoryRepository.delete(inventory);
    }

    @Override
    public List<PantryInventoryResponse> getPantryInventory(Long pantryId) {
        if (pantryId == null)
            return new ArrayList<>();
        pantryRepository.findById(pantryId)
                .orElseThrow(() -> new RuntimeException("Pantry not found with ID: " + pantryId));

        List<PantryInventory> inventoryList = pantryInventoryRepository.findByPantryId(pantryId);
        return inventoryList.stream()
                .map(PantryInventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<PantryInventoryResponse> getLowStockItems(Long pantryId) {
        if (pantryId == null)
            return new ArrayList<>();
        pantryRepository.findById(pantryId)
                .orElseThrow(() -> new RuntimeException("Pantry not found with ID: " + pantryId));

        List<PantryInventory> lowStockItems = pantryInventoryRepository.findLowStockItemsByPantryId(pantryId);
        return lowStockItems.stream()
                .map(PantryInventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<PantryInventoryResponse> getAllLowStockItems() {
        List<PantryInventory> lowStockItems = pantryInventoryRepository.findLowStockItems();
        return lowStockItems.stream()
                .map(PantryInventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public boolean checkStockAvailability(Long pantryId, Long foodItemId, Integer quantity) {
        if (pantryId == null || foodItemId == null)
            return false;

        PantryInventory inventory = pantryInventoryRepository.findByPantryIdAndFoodItemId(pantryId, foodItemId)
                .orElse(null);

        if (inventory == null) {
            return false;
        }

        return inventory.isAvailable(quantity);
    }

    @Override
    @Transactional
    public void deductStock(Long pantryId, Long foodItemId, Integer quantity) {
        if (pantryId == null || foodItemId == null)
            throw new RuntimeException("Pantry ID and Food Item ID are required");

        PantryInventory inventory = pantryInventoryRepository.findByPantryIdAndFoodItemId(pantryId, foodItemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found for this food item in this pantry"));

        if (!inventory.isAvailable(quantity)) {
            throw new RuntimeException(
                    "Insufficient stock. Available: " + inventory.getCurrentStock() + ", Required: " + quantity);
        }

        inventory.setCurrentStock(inventory.getCurrentStock() - quantity);
        pantryInventoryRepository.save(inventory);
    }

    @Override
    public List<PantryInventoryResponse> getMenuItemsByTrainId(Long trainId) {
        // Get all pantries for this train
        List<Pantry> pantries = pantryRepository.findByTrainIdAndActiveTrue(trainId);
        List<PantryInventoryResponse> allMenuItems = new ArrayList<>();

        for (Pantry pantry : pantries) {
            List<PantryInventory> inventory = pantryInventoryRepository.findByPantryId(pantry.getId());
            List<PantryInventoryResponse> items = inventory.stream()
                    .map(inv -> {
                        PantryInventoryResponse response = PantryInventoryResponse.fromEntity(inv);
                        // Add train info to response if needed
                        return response;
                    })
                    .collect(Collectors.toList());
            allMenuItems.addAll(items);
        }

        return allMenuItems;
    }
}