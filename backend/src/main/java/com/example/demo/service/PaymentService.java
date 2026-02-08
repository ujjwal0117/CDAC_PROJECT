package com.example.demo.service;

import com.example.demo.dto.*;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    // Create Razorpay order
    PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request);

    // Verify payment signature
    PaymentResponse verifyPayment(PaymentVerificationRequest request);

    // Get payment by ID
    PaymentResponse getPaymentById(Long id);

    // Get payments by order ID
    List<PaymentResponse> getPaymentsByOrderId(Long orderId);

    // Get user payment history
    List<PaymentResponse> getUserPayments(Long userId);

    // Process refund
    PaymentResponse processRefund(RefundRequest request);

    // Handle Razorpay webhook
    void handleWebhook(Map<String, Object> payload, String signature);

    // Update payment details from Razorpay callback
    PaymentResponse updatePaymentDetails(String razorpayPaymentId, String razorpayOrderId);

    // Check if order has successful payment
    boolean hasSuccessfulPayment(Long orderId);

    // Get total amount paid by user (all successful payments)
    Double getTotalAmountPaidByUser(Long userId);
}
