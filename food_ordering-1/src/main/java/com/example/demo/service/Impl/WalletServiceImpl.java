package com.example.demo.service.Impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.PaymentService;
import com.example.demo.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletServiceImpl implements WalletService {
    private static final Double MAX_WALLET_BALANCE = 50000.0;
    @Autowired
    private WalletRepository walletRepository;
    @Autowired
    private WalletTransactionRepository transactionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private PaymentService paymentService;

    @Override
    // Removed @Transactional to allow handling DataIntegrityViolationException
    // without rollback of outer transaction
    public WalletResponse createWallet(Long userId) {
        // Check if wallet already exists
        if (walletRepository.existsByUserId(userId)) {
            Wallet existingWallet = walletRepository.findByUserId(userId).orElseThrow();
            return WalletResponse.fromEntity(existingWallet);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        try {
            // Create wallet
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(0.0);
            wallet.setActive(true);
            Wallet savedWallet = walletRepository.save(wallet);
            return WalletResponse.fromEntity(savedWallet);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Wallet created concurrently by another thread/request
            Wallet existingWallet = walletRepository.findByUserId(userId).orElseThrow();
            return WalletResponse.fromEntity(existingWallet);
        }
    }

    @Override
    public WalletResponse getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(WalletResponse::fromEntity)
                .orElseGet(() -> createWallet(userId));
    }

    @Override
    public Double getBalance(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(Wallet::getBalance)
                .orElseGet(() -> createWallet(userId).getBalance());
    }

    @Override
    public PaymentOrderResponse addMoney(AddMoneyRequest request) {
        // Get or create wallet
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseGet(() -> {
                    WalletResponse newWallet = createWallet(request.getUserId());
                    return walletRepository.findById(newWallet.getId()).get();
                });
        // Check max balance limit
        if (wallet.getBalance() + request.getAmount() > MAX_WALLET_BALANCE) {
            throw new RuntimeException(
                    "Adding this amount would exceed maximum wallet balance of ₹" + MAX_WALLET_BALANCE);
        }
        // Create payment order via payment service
        PaymentOrderRequest paymentRequest = new PaymentOrderRequest();
        // CHANGED: Use null instead of 0L for wallet top-ups (no associated order)
        paymentRequest.setOrderId(null);
        paymentRequest.setAmount(request.getAmount());
        paymentRequest.setReceipt("wallet_topup_" + wallet.getId() + "_" + System.currentTimeMillis());
        paymentRequest.setNotes("Wallet top-up for user: " + request.getUserId());
        paymentRequest.setUserId(request.getUserId());
        return paymentService.createPaymentOrder(paymentRequest);
    }

    @Override
    @Transactional
    public WalletResponse confirmAddMoney(String razorpayPaymentId, String razorpayOrderId, Long userId) {
        // Get wallet with lock
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user ID: " + userId));
        // Fetch payment details to get amount
        PaymentResponse payment = paymentService.updatePaymentDetails(razorpayPaymentId, razorpayOrderId);
        if (!payment.getStatus().equals("SUCCESS")) {
            throw new RuntimeException("Payment not successful");
        }
        Double amount = payment.getAmount();
        // Credit wallet
        wallet.credit(amount);
        Wallet updatedWallet = walletRepository.save(wallet);
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setType(TransactionType.CREDIT);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(wallet.getBalance());
        transaction.setDescription("Money added via Razorpay");
        transaction.setTransactionRef(razorpayPaymentId);
        transactionRepository.save(transaction);
        return WalletResponse.fromEntity(updatedWallet);
    }

    @Override
    @Transactional
    public WalletTransactionResponse payFromWallet(WalletPaymentRequest request) {
        // Get wallet with lock to prevent concurrent modifications
        Wallet wallet = walletRepository.findByUserIdWithLock(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for user ID: " + request.getUserId()));
        // Validate order exists
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));
        // Check if order belongs to user
        if (!order.getUser().getId().equals(request.getUserId())) {
            throw new RuntimeException("Order does not belong to this user");
        }
        // Check sufficient balance
        if (!wallet.hasSufficientBalance(request.getAmount())) {
            throw new RuntimeException("Insufficient wallet balance. Available: ₹" + wallet.getBalance() +
                    ", Required: ₹" + request.getAmount());
        }
        // Debit wallet
        wallet.debit(request.getAmount());
        walletRepository.save(wallet);
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setType(TransactionType.DEBIT);
        transaction.setAmount(request.getAmount());
        transaction.setBalanceAfter(wallet.getBalance());
        transaction.setDescription("Payment for order #" + request.getOrderId());
        transaction.setOrder(order);
        transaction.setTransactionRef("ORDER_" + request.getOrderId());
        WalletTransaction savedTransaction = transactionRepository.save(transaction);
        // Update order status to CONFIRMED
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }
        return WalletTransactionResponse.fromEntity(savedTransaction);
    }

    @Override
    public List<WalletTransactionResponse> getTransactionHistory(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    createWallet(userId);
                    return walletRepository.findByUserId(userId).orElseThrow();
                });
        List<WalletTransaction> transactions = transactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId());
        return transactions.stream()
                .map(WalletTransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WalletTransactionResponse refundToWallet(Long userId, Double amount, String description, Long orderId) {
        // Get wallet with lock
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user ID: " + userId));
        // Check max balance limit
        if (wallet.getBalance() + amount > MAX_WALLET_BALANCE) {
            throw new RuntimeException("Refund would exceed maximum wallet balance of ₹" + MAX_WALLET_BALANCE);
        }
        // Get order if provided
        Order order = null;
        if (orderId != null) {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        }
        // Credit wallet
        wallet.credit(amount);
        walletRepository.save(wallet);
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setType(TransactionType.REFUND);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(wallet.getBalance());
        transaction.setDescription(description != null ? description : "Refund to wallet");
        transaction.setOrder(order);
        transaction.setTransactionRef("REFUND_" + System.currentTimeMillis());
        WalletTransaction savedTransaction = transactionRepository.save(transaction);
        return WalletTransactionResponse.fromEntity(savedTransaction);
    }

    @Override
    public boolean walletExists(Long userId) {
        return walletRepository.existsByUserId(userId);
    }
}