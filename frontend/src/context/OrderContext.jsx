"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderAPI, reviewAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch orders when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchOrders();
        } else {
            setOrders([]);
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);

    const fetchOrders = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const data = await orderAPI.getUserOrders(user.id);
            setOrders(data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async (orderData) => {
        if (!user?.id) throw new Error('User not authenticated');

        try {
            const newOrder = await orderAPI.create({
                ...orderData,
                userId: user.id
            });
            // Refresh orders list after creating
            await fetchOrders();
            return newOrder;
        } catch (err) {
            console.error('Failed to create order:', err);
            throw err;
        }
    };

    const getOrderById = async (orderId) => {
        try {
            // First check local cache
            const localOrder = orders.find(o => o.id === parseInt(orderId));
            if (localOrder) return localOrder;

            // If not found, fetch from API
            const order = await orderAPI.getById(orderId);
            return order;
        } catch (err) {
            console.error('Failed to get order:', err);
            return null;
        }
    };

    const getOrdersByCustomer = () => {
        return orders;
    };

    const getOrdersByVendor = () => {
        return orders;
    };

    const refreshOrders = () => {
        fetchOrders();
    };

    // Rate order - Submit review to backend
    const rateOrder = async (orderId, rating, review) => {
        try {
            await reviewAPI.add({
                orderId: orderId,
                rating: rating,
                comment: review
            });
            // Refresh to update the order's local state (so button disappears)
            await fetchOrders();
            return true;
        } catch (err) {
            console.error('Failed to submit review:', err);
            throw err;
        }
    };

    return (
        <OrderContext.Provider value={{
            orders,
            loading,
            createOrder,
            getOrderById,
            getOrdersByCustomer,
            getOrdersByVendor,
            rateOrder,
            refreshOrders
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => useContext(OrderContext);
