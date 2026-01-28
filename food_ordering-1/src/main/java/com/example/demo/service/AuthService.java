package com.example.demo.service;
import com.example.demo.dto.AdminRegisterRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.VendorRegisterRequest;
public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse registerVendor(VendorRegisterRequest request);
    AuthResponse registerAdmin(AdminRegisterRequest request);
    AuthResponse login(LoginRequest request);
}