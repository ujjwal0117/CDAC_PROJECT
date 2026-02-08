"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, userAPI, setToken, getToken, removeToken, setUserData, getUserData, removeUserData } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null); // 'customer', 'vendor'
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Initial auth check
    const router = useRouter();

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = () => {
            const token = getToken();
            const savedUser = getUserData();

            if (token && savedUser) {
                setUser(savedUser);
                setIsAuthenticated(true);
                // Determine user type from roles
                if (savedUser.roles?.includes('ROLE_VENDOR')) {
                    setUserType('vendor');
                } else {
                    setUserType('customer');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (type, username, password) => {
        if (!username || !password) {
            throw new Error('Please fill in all fields');
        }

        try {
            const response = await authAPI.login(username, password);

            // Validation: Check if the user role matches the requested login type
            const isVendor = response.roles?.includes('ROLE_VENDOR');
            const isCustomer = response.roles?.includes('ROLE_USER');

            if (type === 'customer' && isVendor && !isCustomer) {
                throw new Error('This account is registered as a Partner. Please use the Partner Login page.');
            }

            if (type === 'vendor' && !isVendor) {
                throw new Error('This account is registered as a Customer. Please use the Customer Login page.');
            }

            // Store token and user data
            setToken(response.token);
            setUserData(response);

            // Update state
            setUser(response);
            setIsAuthenticated(true);

            // Determine user type from roles and redirect
            if (response.roles?.includes('ROLE_VENDOR')) {
                setUserType('vendor');
                router.push('/vendor/orders');
            } else {
                setUserType('customer');
                router.push('/dashboard');
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Invalid username or password');
        }
    };

    const register = async (type, data) => {
        if (!data.username || !data.email || !data.password || !data.name || !data.phone) {
            throw new Error('Please fill in all fields');
        }

        try {
            // Map frontend fields to backend expected format
            const registerData = {
                username: data.username,
                email: data.email,
                password: data.password,
                fullName: data.name,
                phoneNumber: data.phone,
            };

            let response;

            if (type === 'vendor') {
                response = await authAPI.registerVendor({
                    ...registerData,
                    businessName: data.businessName || 'My Restaurant',
                    gstNumber: data.gstNumber || '',
                    address: data.address || ''
                });

            } else {
                // Default to customer registration
                response = await authAPI.register(registerData);
            }

            // Store token and user data
            setToken(response.token);
            setUserData(response);

            // Update state
            setUser(response);
            setUserType(type);
            setIsAuthenticated(true);

            // Redirect based on user type
            if (type === 'customer') router.push('/dashboard');
            if (type === 'vendor') router.push('/vendor/orders');


            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed. Please try again.');
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await userAPI.updateProfile(profileData);

            // Update local user state with new profile data
            const updatedUser = {
                ...user,
                fullName: response.fullName,
                email: response.email,
                phoneNumber: response.phoneNumber,
            };

            setUser(updatedUser);
            setUserData(updatedUser);

            return response;
        } catch (error) {
            console.error('Profile update error:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    };

    const logout = () => {
        removeToken();
        removeUserData();
        setUser(null);
        setUserType(null);
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            userType,
            isAuthenticated,
            loading,
            login,
            register,
            updateProfile,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);