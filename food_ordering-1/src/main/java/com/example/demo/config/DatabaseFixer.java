package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔧 DatabaseFixer: Attempting to fix schema...");
        try {
            // Force the status column to be a VARCHAR(50) to accept ANY enum value
            // This fixes "Data truncated" if the column was previously an ENUM or short
            // VARCHAR
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50)");
            System.out.println("✅ DatabaseFixer: Successfully altered 'orders' table status column to VARCHAR(50).");
        } catch (Exception e) {
            System.err.println(
                    "⚠️ DatabaseFixer: Failed to alter table (might already be fixed or locked): " + e.getMessage());
        }
    }
}
