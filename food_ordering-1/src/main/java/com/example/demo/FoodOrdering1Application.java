package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FoodOrdering1Application {

    public static void main(String[] args) {

        SpringApplication.run(FoodOrdering1Application.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner initData(
            com.example.demo.repository.RestaurantRepository restaurantRepository,
            com.example.demo.repository.StationRepository stationRepository,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // Fix Legacy Schema Issue: Make train_id nullable
                try {
                    jdbcTemplate.execute("ALTER TABLE restaurants MODIFY COLUMN train_id BIGINT NULL");
                    System.out.println("✅ Schema fixed: restaurants.train_id is now NULLABLE.");
                } catch (Exception e) {
                    System.out.println("⚠️ Schema fix skipped: " + e.getMessage());
                }

                restaurantRepository.findAll()
                        .forEach(r -> System.out.println("DEBUG: Restaurant " + r.getId() + " - " + r.getName()));

                if (restaurantRepository.findByName("IRCTC Pantry").isEmpty()) {
                    System.out.println("⚠️ Pantry not found by name. Creating via JPA...");
                    com.example.demo.entity.Station station = stationRepository.findAll().stream().findFirst()
                            .orElse(null);
                    if (station == null) {
                        station = new com.example.demo.entity.Station();
                        station.setStationName("IRCTC Virtual Station");
                        station.setStationCode("IRCTC");
                        station.setLatitude(0.0);
                        station.setLongitude(0.0);
                        station = stationRepository.save(station);
                    }

                    com.example.demo.entity.Restaurant pantry = new com.example.demo.entity.Restaurant();
                    pantry.setName("IRCTC Pantry");
                    pantry.setDescription("Onboard Train Pantry Service");
                    pantry.setCuisine("Pantry");
                    pantry.setDeliveryTime("30-45 min");
                    pantry.setActive(true);
                    pantry.setRating(4.5);
                    pantry.setStation(station);

                    restaurantRepository.save(pantry);
                    System.out.println("✅ IRCTC Pantry created via JPA.");
                } else {
                    System.out.println("✅ IRCTC Pantry exists.");
                }
            } catch (Exception e) {
                System.out.println("⚠️ Init Data Error: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
