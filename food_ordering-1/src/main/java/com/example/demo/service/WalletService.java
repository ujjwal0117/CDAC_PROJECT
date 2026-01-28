package com.example.demo.service;

import com.example.demo.dto.*;

import java.util.List;

public interface WalletService {

    // Wallet management
    WalletResponse createWallet(Long userId);

    WalletResponse getWalletByUserId(Long userId);

    Double getBalance(Long userId);

    // Add money to wallet
    PaymentOrderResponse addMoney(AddMoneyRequest request);

    WalletResponse confirmAddMoney(String razorpayPaymentId, String razorpayOrderId, Long userId);

    // Pay from wallet
    WalletTransactionResponse payFromWallet(WalletPaymentRequest request);

    // Get transaction history
    List<WalletTransactionResponse> getTransactionHistory(Long userId);

    // Refund to wallet
    WalletTransactionResponse refundToWallet(Long userId, Double amount, String description, Long orderId);

    // Check if wallet exists
    boolean walletExists(Long userId);
}
