package com.example.demo.service;

import com.example.demo.dto.ProfileResponse;
import com.example.demo.dto.ProfileUpdateRequest;

public interface UserService {

    /**
     * Get user profile by username
     * 
     * @param username the username
     * @return ProfileResponse with user details
     */
    ProfileResponse getProfile(String username);

    /**
     * Update user profile
     * 
     * @param username the username of the user to update
     * @param request  the profile update request
     * @return updated ProfileResponse
     */
    ProfileResponse updateProfile(String username, ProfileUpdateRequest request);

    /**
     * Get all users
     * 
     * @return List of ProfileResponse
     */
    java.util.List<ProfileResponse> getAllUsers();
}
