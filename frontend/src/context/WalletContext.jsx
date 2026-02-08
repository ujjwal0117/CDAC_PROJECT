"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { walletAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walletExists, setWalletExists] = useState(false);

    // Fetch wallet data when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchWalletData();
        } else {
            // Reset wallet state when logged out
            setBalance(0);
            setTransactions([]);
            setWalletExists(false);
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);

    const fetchWalletData = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Check if wallet exists
            const exists = await walletAPI.exists(user.id);
            setWalletExists(exists);

            if (exists) {
                // Fetch balance and transactions in parallel
                const [walletData, txnData] = await Promise.all([
                    walletAPI.getWallet(user.id),
                    walletAPI.getTransactions(user.id)
                ]);

                setBalance(walletData.balance || 0);
                setTransactions(txnData || []);
            } else {
                // Create wallet if it doesn't exist
                try {
                    const newWallet = await walletAPI.createWallet(user.id);
                    setBalance(newWallet.balance || 0);
                    setWalletExists(true);
                } catch (createErr) {
                    console.error('Failed to create wallet:', createErr);
                }
            }
        } catch (err) {
            console.error('Failed to fetch wallet data:', err);
            if (err.message && (err.message.includes('Unauthorized') || err.message.includes('Full authentication is required'))) {
                // Token is likely invalid/expired
                // We should probably rely on AuthContext to handle this, 
                // but we can trigger a reload or soft logout
                localStorage.removeItem('token');
                window.location.reload();
            }
        } finally {
            setLoading(false);
        }
    };

    const addMoney = async (amount) => {
        if (!user?.id) return null;

        try {
            // Initiate add money - this creates a payment order
            const paymentOrder = await walletAPI.addMoney({
                userId: user.id,
                amount: parseFloat(amount)
            });
            return paymentOrder;
        } catch (err) {
            console.error('Failed to initiate add money:', err);
            throw err;
        }
    };

    const confirmAddMoney = async (razorpayPaymentId, razorpayOrderId) => {
        if (!user?.id) return;

        try {
            await walletAPI.confirmAddMoney(razorpayPaymentId, user.id, razorpayOrderId);
            // Refresh wallet data after adding money
            await fetchWalletData();
        } catch (err) {
            console.error('Failed to confirm add money:', err);
            throw err;
        }
    };

    const deductMoney = async (amount, description, orderId) => {
        if (!user?.id) return;

        if (balance < amount) {
            throw new Error('Insufficient wallet balance');
        }

        try {
            await walletAPI.payFromWallet({
                userId: user.id,
                amount: parseFloat(amount),
                description: description || 'Payment for Order',
                orderId: orderId
            });
            // Refresh wallet data after payment
            await fetchWalletData();
        } catch (err) {
            console.error('Failed to pay from wallet:', err);
            throw err;
        }
    };

    const refreshWallet = () => {
        fetchWalletData();
    };

    return (
        <WalletContext.Provider value={{
            balance,
            transactions,
            loading,
            walletExists,
            addMoney,
            confirmAddMoney,
            deductMoney,
            refreshWallet
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);