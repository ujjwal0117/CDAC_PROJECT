package com.example.demo.service.Impl;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.VendorRegisterRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private RoleRepository roleRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;
        @Autowired
        private JwtUtil jwtUtil;
        @Autowired
        private AuthenticationManager authenticationManager;

        @Override
        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new RuntimeException("Username already exists");
                }
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }
                User user = new User();
                user.setUsername(request.getUsername());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setFullName(request.getFullName());
                user.setPhoneNumber(request.getPhoneNumber());
                Set<Role> roles = new HashSet<>();
                Role userRole = roleRepository.findByName("ROLE_USER")
                                .orElseGet(() -> {
                                        Role newRole = new Role("ROLE_USER");
                                        return roleRepository.save(newRole);
                                });
                roles.add(userRole);
                user.setRoles(roles);
                User savedUser = userRepository.save(user);
                UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                                .username(savedUser.getUsername())
                                .password(savedUser.getPassword())
                                .authorities(savedUser.getRoles().stream()
                                                .map(role -> role.getName())
                                                .toArray(String[]::new))
                                .build();
                String token = jwtUtil.generateToken(userDetails);
                return new AuthResponse(
                                token,
                                savedUser.getId(),
                                savedUser.getUsername(),
                                savedUser.getEmail(),
                                savedUser.getFullName(),
                                savedUser.getPhoneNumber(),
                                savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }

        @Override
        public AuthResponse registerVendor(VendorRegisterRequest request) {
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new RuntimeException("Username already exists");
                }
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }
                User user = new User();
                user.setUsername(request.getUsername());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setFullName(request.getFullName());
                user.setPhoneNumber(request.getPhoneNumber());
                // Assign ROLE_VENDOR
                Set<Role> roles = new HashSet<>();
                Role vendorRole = roleRepository.findByName("ROLE_VENDOR")
                                .orElseGet(() -> {
                                        Role newRole = new Role("ROLE_VENDOR");
                                        return roleRepository.save(newRole);
                                });
                roles.add(vendorRole);
                user.setRoles(roles);
                // Note: Vendor-specific fields (businessName, gstNumber, address)
                // are not stored in User entity. You may want to create a separate
                // Vendor entity to store these fields.
                // For now, they will be validated but not persisted.
                User savedUser = userRepository.save(user);
                UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                                .username(savedUser.getUsername())
                                .password(savedUser.getPassword())
                                .authorities(savedUser.getRoles().stream()
                                                .map(role -> role.getName())
                                                .toArray(String[]::new))
                                .build();
                String token = jwtUtil.generateToken(userDetails);
                return new AuthResponse(
                                token,
                                savedUser.getId(),
                                savedUser.getUsername(),
                                savedUser.getEmail(),
                                savedUser.getFullName(),
                                savedUser.getPhoneNumber(),
                                savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }

        @Override
        public AuthResponse login(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String token = jwtUtil.generateToken(userDetails);
                User user = userRepository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return new AuthResponse(
                                token,
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getFullName(),
                                user.getPhoneNumber(),
                                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        }
}
