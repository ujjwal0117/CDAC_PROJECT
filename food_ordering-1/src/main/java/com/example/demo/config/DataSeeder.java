package com.example.demo.config;

import com.example.demo.entity.Pnr;
import com.example.demo.entity.Role;
import com.example.demo.entity.Train;
import com.example.demo.entity.User;
import com.example.demo.repository.PnrRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.TrainRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PnrRepository pnrRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedUsers();
        seedPnrRecords();
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role("ROLE_USER"));
            roleRepository.save(new Role("ROLE_VENDOR"));
            roleRepository.save(new Role("ROLE_ADMIN"));
            System.out.println("✅ Roles seeded successfully");
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            // Create Customer
            if (!userRepository.existsByEmail("john.doe@gmail.com")) {
                User customer = new User();
                customer.setUsername("customer");
                customer.setEmail("john.doe@gmail.com");
                customer.setPassword(passwordEncoder.encode("John@2024"));
                customer.setFullName("John Doe");
                customer.setPhoneNumber("9876543210");

                Role userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
                customer.setRoles(new HashSet<>(Collections.singletonList(userRole)));

                User savedCustomer = userRepository.save(customer);
                createWalletForUser(savedCustomer);
                System.out.println("✅ Customer seeded: john.doe@gmail.com / John@2024");
            }

            // Create Vendor
            if (!userRepository.existsByEmail("vendor@station.com")) {
                User vendor = new User();
                vendor.setUsername("vendor");
                vendor.setEmail("vendor@station.com");
                vendor.setPassword(passwordEncoder.encode("Vendor@123"));
                vendor.setFullName("Station Vendor");
                vendor.setPhoneNumber("9876543211");

                Role vendorRole = roleRepository.findByName("ROLE_VENDOR").orElseThrow();
                vendor.setRoles(new HashSet<>(Collections.singletonList(vendorRole)));

                User savedVendor = userRepository.save(vendor);
                createWalletForUser(savedVendor);
                System.out.println("✅ Vendor seeded: vendor@station.com / Vendor@123");
            }

            // Create Admin
            if (!userRepository.existsByEmail("admin@raildine.com")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@raildine.com");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setFullName("Admin User");
                admin.setPhoneNumber("9876543212");

                Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();
                admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));

                User savedAdmin = userRepository.save(admin);
                createWalletForUser(savedAdmin);
                System.out.println("✅ Admin seeded: admin@raildine.com / Admin@123");
            }
        }
    }

    private void seedPnrRecords() {
        // Only seed if no PNR records exist
        if (pnrRepository.count() == 0) {
            List<Train> trains = trainRepository.findAll();

            if (trains.isEmpty()) {
                System.out.println("⚠️ No trains found. PNR seeding skipped. Please add trains first.");
                return;
            }

            // Create sample PNR records for different trains
            String[][] pnrData = {
                    { "1234567890", "B4", "24", "Rahul Sharma", "2026-01-20" },
                    { "1234567891", "A1", "15", "Priya Patel", "2026-01-20" },
                    { "1234567892", "C2", "32", "Amit Kumar", "2026-01-21" },
                    { "1234567893", "B1", "8", "Sneha Gupta", "2026-01-21" },
                    { "1234567894", "A3", "45", "Vikram Singh", "2026-01-22" },
            };

            for (int i = 0; i < pnrData.length; i++) {
                String[] data = pnrData[i];
                String pnrNumber = data[0];

                if (!pnrRepository.existsByPnrNumber(pnrNumber)) {
                    // Assign different trains to different PNRs
                    Train train = trains.get(i % trains.size());

                    Pnr pnr = new Pnr();
                    pnr.setPnrNumber(pnrNumber);
                    pnr.setTrain(train);
                    pnr.setCoachNumber(data[1]);
                    pnr.setSeatNumber(data[2]);
                    pnr.setPassengerName(data[3]);
                    pnr.setJourneyDate(data[4]);

                    pnrRepository.save(pnr);
                    System.out.println("🎫 PNR seeded: " + pnrNumber + " → Train: " + train.getTrainName());
                }
            }
            System.out.println("✅ PNR records seeded successfully");
        }
    }

    @Autowired
    private com.example.demo.repository.WalletRepository walletRepository;

    private void createWalletForUser(User user) {
        if (!walletRepository.existsByUserId(user.getId())) {
            com.example.demo.entity.Wallet wallet = new com.example.demo.entity.Wallet();
            wallet.setUser(user);
            wallet.setBalance(1000.0); // Give some default balance for testing
            wallet.setActive(true);
            walletRepository.save(wallet);
            System.out.println("💰 Wallet created for: " + user.getUsername());
        }
    }
}
