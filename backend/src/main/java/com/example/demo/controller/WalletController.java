package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private WalletService walletService;

    /**
     * Get user wallet balance
     * Authenticated users only
     */
    @GetMapping("/balance")
    public ResponseEntity<Double> getBalance(@RequestParam Long userId) {
        return ResponseEntity.ok(walletService.getBalance(userId));
    }

    /**
     * Get wallet details
     * Authenticated users only
     */
    @GetMapping
    public ResponseEntity<WalletResponse> getWallet(@RequestParam Long userId) {
        return ResponseEntity.ok(walletService.getWalletByUserId(userId));
    }

    /**
     * Create wallet for user
     * Authenticated users only
     */
    @PostMapping("/create")
    public ResponseEntity<WalletResponse> createWallet(@RequestParam Long userId) {
        return ResponseEntity.ok(walletService.createWallet(userId));
    }

    /**
     * Add money to wallet - Step 1: Create payment order
     * Authenticated users only
     */
    @PostMapping("/add-money")
    public ResponseEntity<PaymentOrderResponse> addMoney(@Valid @RequestBody AddMoneyRequest request) {
        return ResponseEntity.ok(walletService.addMoney(request));
    }

    /**
     * Confirm money added to wallet - Step 2: After successful payment
     * Authenticated users only
     */
    @PostMapping("/confirm-add-money")
    public ResponseEntity<WalletResponse> confirmAddMoney(
            @RequestParam String razorpayPaymentId,
            @RequestParam(required = false) String razorpayOrderId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(walletService.confirmAddMoney(razorpayPaymentId, razorpayOrderId, userId));
    }

    /**
     * Pay from wallet
     * Authenticated users only
     */
    @PostMapping("/pay")
    public ResponseEntity<WalletTransactionResponse> payFromWallet(
            @Valid @RequestBody WalletPaymentRequest request) {
        return ResponseEntity.ok(walletService.payFromWallet(request));
    }

    /**
     * Get transaction history
     * Authenticated users only
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransactionResponse>> getTransactionHistory(@RequestParam Long userId) {
        return ResponseEntity.ok(walletService.getTransactionHistory(userId));
    }

    /**
     * Refund amount to wallet
     * Admin only
     */
    @PostMapping("/refund")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<WalletTransactionResponse> refundToWallet(
            @RequestParam Long userId,
            @RequestParam Double amount,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long orderId) {
        return ResponseEntity.ok(walletService.refundToWallet(userId, amount, description, orderId));
    }

    /**
     * Get user wallet (Admin only)
     * Admin only
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<WalletResponse> getUserWallet(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getWalletByUserId(userId));
    }

    /**
     * Check if wallet exists
     * Authenticated users only
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> walletExists(@RequestParam Long userId) {
        return ResponseEntity.ok(walletService.walletExists(userId));
    }
}
