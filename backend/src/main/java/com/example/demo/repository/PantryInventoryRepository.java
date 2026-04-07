package com.example.demo.repository;

import com.example.demo.entity.PantryInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PantryInventoryRepository extends JpaRepository<PantryInventory, Long> {

    List<PantryInventory> findByPantryId(Long pantryId);

    Optional<PantryInventory> findByPantryIdAndFoodItemId(Long pantryId, Long foodItemId);

    @Query("SELECT pi FROM PantryInventory pi WHERE pi.currentStock <= pi.minStockLevel")
    List<PantryInventory> findLowStockItems();

    @Query("SELECT pi FROM PantryInventory pi WHERE pi.pantry.id = :pantryId AND pi.currentStock <= pi.minStockLevel")
    List<PantryInventory> findLowStockItemsByPantryId(Long pantryId);

    @Query("SELECT pi FROM PantryInventory pi WHERE pi.pantry.id = :pantryId AND pi.foodItem.id = :foodItemId")
    Optional<PantryInventory> findInventoryItem(Long pantryId, Long foodItemId);
}
