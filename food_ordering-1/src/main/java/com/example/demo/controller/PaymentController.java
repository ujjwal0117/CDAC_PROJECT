package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Create Razorpay payment order
     * Authenticated users only
     */
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(@Valid @RequestBody PaymentOrderRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentOrder(request));
    }

    /**
     * Verify payment signature after payment completion
     * Authenticated users only
     */
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    /**
     * Get payment details by ID
     * Authenticated users only
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    /**
     * Get all payments for a specific order
     * Authenticated users only
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsByOrderId(orderId));
    }

    /**
     * Get user's payment history
     * Authenticated users only
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getUserPayments(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    /**
     * Process refund for a payment
     * Admin only
     */
    @PostMapping("/refund")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PaymentResponse> processRefund(@Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(paymentService.processRefund(request));
    }

    /**
     * Razorpay webhook endpoint
     * Public endpoint - signature verification done internally
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        try {
            paymentService.handleWebhook(payload, signature);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook processing failed: " + e.getMessage());
        }
    }

    /**
     * Update payment details from Razorpay
     * Admin only
     */
    @PutMapping("/update/{razorpayPaymentId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PaymentResponse> updatePaymentDetails(
            @PathVariable String razorpayPaymentId,
            @RequestParam(required = false) String razorpayOrderId) {
        return ResponseEntity.ok(paymentService.updatePaymentDetails(razorpayPaymentId, razorpayOrderId));
    }

    /**
     * Check if order has successful payment
     * Authenticated users only
     */
    @GetMapping("/check-payment/{orderId}")
    public ResponseEntity<Boolean> checkPaymentStatus(@PathVariable Long orderId) {
        boolean hasPayment = paymentService.hasSuccessfulPayment(orderId);
        return ResponseEntity.ok(hasPayment);
    }

    /**
     * Get total amount paid by user (sum of all successful payments)
     * Authenticated users only
     */
    @GetMapping("/total-paid/{userId}")
    public ResponseEntity<Double> getTotalAmountPaid(@PathVariable Long userId) {
        Double totalPaid = paymentService.getTotalAmountPaidByUser(userId);
        return ResponseEntity.ok(totalPaid);
    }
}
