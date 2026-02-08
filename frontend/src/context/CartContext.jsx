"use client";

import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    // Store order context data (train, PNR, restaurant)
    const [orderContext, setOrderContext] = useState({
        trainId: null,
        trainName: '',
        restaurantId: null,
        restaurantName: '',
        pnrNumber: '',
        seatNumber: '',
        coachNumber: '',
    });

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        const existing = cart.find(c => c.id === itemId);
        if (!existing) return;

        if (existing.quantity === 1) {
            setCart(cart.filter(c => c.id !== itemId));
        } else {
            setCart(cart.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
        }
    };

    const clearCart = () => {
        setCart([]);
        setOrderContext({
            trainId: null,
            trainName: '',
            restaurantId: null,
            restaurantName: '',
            pnrNumber: '',
            seatNumber: '',
            coachNumber: '',
        });
    };

    const cartTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Set order context when user selects restaurant/train
    const setOrderInfo = (info) => {
        setOrderContext(prev => ({ ...prev, ...info }));
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartTotal,
            orderContext,
            setOrderInfo
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);