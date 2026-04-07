package com.example.demo.dto;

import com.example.demo.entity.FoodItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodItemResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private String imageUrl;
    private Boolean vegetarian;
    private Boolean available;

    public static FoodItemResponse fromEntity(FoodItem item) {
        FoodItemResponse response = new FoodItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        response.setDescription(item.getDescription());
        response.setPrice(item.getPrice());
        response.setCategory(item.getCategory());
        response.setImageUrl(item.getImageUrl());
        response.setVegetarian(item.getVegetarian());
        response.setAvailable(item.getAvailable());
        return response;
    }
}