package com.example.demo.service.Impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SignatureException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.example.demo.repository.UserRepository userRepository;

    @Autowired
    private RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency}")
    private String currency;

    @Override
    @Transactional
    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request) {
        Order order = null;
        User user = null;

        // CHANGED: Only validate order if orderId is provided (not null)
        // If orderId is null, it's a wallet top-up (no associated order)
        Long orderId = request.getOrderId();
        Long userId = request.getUserId();

        if (orderId != null) {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

            user = order.getUser();

            // Check if order already has a successful payment
            if (paymentRepository.existsByOrderIdAndStatus(orderId, PaymentStatus.SUCCESS)) {
                throw new RuntimeException("Order already has a successful payment");
            }
        } else if (userId != null) {
            // Wallet top-up case: fetch user directly
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        } else {
            throw new RuntimeException("Either orderId or userId must be provided for payment");
        }

        try {
            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (request.getAmount() * 100)); // Amount in paise
            orderRequest.put("currency", currency);

            // CHANGED: Handle receipt for both order payments and wallet top-ups
            String receipt = request.getReceipt() != null ? request.getReceipt()
                    : (order != null ? "receipt_" + order.getId() : "wallet_topup");
            orderRequest.put("receipt", receipt);

            // FIXED: Removed problematic JSON parsing - notes are optional for Razorpay
            // We'll store notes in our database only, not send to Razorpay

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            // Create payment record in database
            Payment payment = new Payment();
            payment.setOrder(order); // Can be null for wallet top-ups
            payment.setUser(user); // Can be null for wallet top-ups (will be set later)
            payment.setAmount(request.getAmount());
            payment.setCurrency(currency);
            payment.setStatus(PaymentStatus.CREATED);
            payment.setRazorpayOrderId(razorpayOrder.get("id"));
            payment.setReceipt(receipt);
            payment.setNotes(request.getNotes()); // Store notes as string in our database

            Payment savedPayment = paymentRepository.save(payment);

            // Prepare response
            PaymentOrderResponse response = new PaymentOrderResponse();
            response.setPaymentId(savedPayment.getId());
            response.setRazorpayOrderId(savedPayment.getRazorpayOrderId());
            response.setAmount(savedPayment.getAmount());
            response.setCurrency(savedPayment.getCurrency());
            response.setStatus(savedPayment.getStatus().name());
            response.setRazorpayKeyId(razorpayKeyId);
            response.setReceipt(savedPayment.getReceipt());
            response.setOrderId(order != null ? order.getId() : null); // null for wallet top-ups
            response.setNotes(savedPayment.getNotes());

            return response;

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyPayment(PaymentVerificationRequest request) {
        // Find payment by Razorpay order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(
                        () -> new RuntimeException("Payment not found for order ID: " + request.getRazorpayOrderId()));

        try {
            // Verify signature
            String generatedSignature = calculateRFC2104HMAC(
                    request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(),
                    razorpayKeySecret);

            if (!generatedSignature.equals(request.getRazorpaySignature())) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Invalid signature");
                paymentRepository.save(payment);
                throw new RuntimeException("Payment signature verification failed");
            }

            // Update payment details
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.SUCCESS);

            // Fetch and update payment details from Razorpay
            updatePaymentDetailsInternal(payment, request.getRazorpayPaymentId());

            Payment updatedPayment = paymentRepository.save(payment);

            // CHANGED: Only update order status if payment has an associated order
            if (payment.getOrder() != null) {
                Order order = payment.getOrder();
                if (order.getStatus() == Order.OrderStatus.PENDING) {
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                }
            }

            return PaymentResponse.fromEntity(updatedPayment);

        } catch (SignatureException e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Signature calculation error: " + e.getMessage());
            paymentRepository.save(payment);
            throw new RuntimeException("Payment verification failed", e);
        }
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Long paymentId = id;
        if (paymentId == null)
            return null;
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
        return PaymentResponse.fromEntity(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByOrderId(Long orderId) {
        if (orderId == null)
            return new java.util.ArrayList<>();
        List<Payment> payments = paymentRepository.findByOrderId(orderId);
        return payments.stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getUserPayments(Long userId) {
        if (userId == null)
            return new java.util.ArrayList<>();
        List<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return payments.stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse processRefund(RefundRequest request) {
        Long paymentId = request.getPaymentId();
        if (paymentId == null)
            throw new RuntimeException("Payment ID is required");
        // Find payment
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        // Validate payment can be refunded
        if (!payment.canBeRefunded()) {
            throw new RuntimeException("Payment cannot be refunded. Status: " + payment.getStatus() +
                    ", Already refunded: " + payment.getRefundedAmount());
        }

        // Validate refund amount
        if (request.getAmount() > payment.getRefundableAmount()) {
            throw new RuntimeException(
                    "Refund amount exceeds refundable amount. Max: " + payment.getRefundableAmount());
        }

        try {
            // Create refund in Razorpay
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", (int) (request.getAmount() * 100)); // Amount in paise
            if (request.getReason() != null) {
                refundRequest.put("notes", new JSONObject().put("reason", request.getReason()));
            }

            com.razorpay.Refund refund = razorpayClient.payments.refund(payment.getRazorpayPaymentId(), refundRequest);

            // Update payment record
            payment.setRefundedAmount(payment.getRefundedAmount() + request.getAmount());
            payment.setRefundId(refund.get("id"));
            payment.setRefundedAt(LocalDateTime.now());

            // Update status
            if (payment.getRefundedAmount().equals(payment.getAmount())) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else {
                payment.setStatus(PaymentStatus.PARTIAL_REFUND);
            }

            Payment updatedPayment = paymentRepository.save(payment);

            // CHANGED: Only update order if payment has an associated order
            if (payment.getStatus() == PaymentStatus.REFUNDED && payment.getOrder() != null) {
                Order order = payment.getOrder();
                order.setStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(order);
            }

            return PaymentResponse.fromEntity(updatedPayment);

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to process refund: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void handleWebhook(Map<String, Object> payload, String signature) {
        // Verify webhook signature
        try {
            String webhookSecret = razorpayKeySecret; // Use your webhook secret
            String generatedSignature = calculateRFC2104HMAC(payload.toString(), webhookSecret);

            // Verify the signature matches
            if (!generatedSignature.equals(signature)) {
                throw new RuntimeException("Invalid webhook signature - possible security breach");
            }

            String event = (String) payload.get("event");
            Object payloadObj = payload.get("payload");
            if (payloadObj == null) {
                throw new RuntimeException("Missing 'payload' in webhook data");
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> payloadData = (Map<String, Object>) payloadObj;

            Object paymentObj = payloadData.get("payment");
            if (paymentObj == null) {
                throw new RuntimeException("Missing 'payment' in webhook payload");
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentData = (Map<String, Object>) paymentObj;

            Object entityObj = paymentData.get("entity");
            if (entityObj == null) {
                throw new RuntimeException("Missing 'entity' in payment data");
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> entity = (Map<String, Object>) entityObj;

            String razorpayOrderId = (String) entity.get("order_id");
            String razorpayPaymentId = (String) entity.get("id");

            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElse(null);

            if (payment == null) {
                return; // Payment not found, skip
            }

            switch (event) {
                case "payment.captured":
                    payment.setStatus(PaymentStatus.SUCCESS);
                    payment.setRazorpayPaymentId(razorpayPaymentId);
                    updatePaymentDetailsInternal(payment, razorpayPaymentId);
                    paymentRepository.save(payment);
                    break;

                case "payment.failed":
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setFailureReason((String) entity.get("error_description"));
                    paymentRepository.save(payment);
                    break;

                default:
                    // Handle other events if needed
                    break;
            }

        } catch (Exception e) {
            throw new RuntimeException("Webhook processing failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PaymentResponse updatePaymentDetails(String razorpayPaymentId, String razorpayOrderId) {
        // Step 1: Try to find by Razorpay Payment ID (if we already processed it/stored
        // it)
        Payment payment = paymentRepository.findByRazorpayPaymentId(razorpayPaymentId).orElse(null);

        // Step 2: If not found, and we have an Order ID, try to find by Order ID
        if (payment == null && razorpayOrderId != null) {
            payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
            if (payment != null) {
                // Link the new payment ID to this record
                payment.setRazorpayPaymentId(razorpayPaymentId);
            }
        }

        // Step 3: If still not found, and it's NOT a demo payment, try fetching from
        // Razorpay
        if (payment == null && !razorpayPaymentId.startsWith("pay_demo_")) {
            try {
                // Fetch from Razorpay
                com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(razorpayPaymentId);
                String fetchedOrderId = razorpayPayment.get("order_id");

                // Find local payment record by Order ID from Razorpay
                payment = paymentRepository.findByRazorpayOrderId(fetchedOrderId)
                        .orElseThrow(() -> new RuntimeException("Payment not found for Order ID: " + fetchedOrderId));

                // Link the payment ID
                payment.setRazorpayPaymentId(razorpayPaymentId);
            } catch (RazorpayException e) {
                throw new RuntimeException("Failed to fetch payment details from Razorpay: " + e.getMessage(), e);
            }
        }

        // Step 4: Final checks
        if (payment == null) {
            throw new RuntimeException("Payment reference could not be found for ID: " + razorpayPaymentId);
        }

        // Update details (handle demo payments gracefully)
        if (!razorpayPaymentId.startsWith("pay_demo_")) {
            try {
                com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(razorpayPaymentId);
                String status = razorpayPayment.get("status");

                if ("captured".equals(status) || "authorized".equals(status)) {
                    payment.setStatus(PaymentStatus.SUCCESS);
                } else if ("failed".equals(status)) {
                    payment.setStatus(PaymentStatus.FAILED);
                }

                updatePaymentDetailsInternal(payment, razorpayPaymentId);
            } catch (RazorpayException e) {
                // Log but don't crash, though validation failed
                System.err.println("Error verifying payment status: " + e.getMessage());
            }
        } else {
            // For demo payments, manually set success
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaymentMethod(PaymentMethod.WALLET); // Assume wallet/test
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return PaymentResponse.fromEntity(updatedPayment);
    }

    @Override
    public boolean hasSuccessfulPayment(Long orderId) {
        return paymentRepository.existsByOrderIdAndStatus(orderId, PaymentStatus.SUCCESS);
    }

    // Private helper methods

    private void updatePaymentDetailsInternal(Payment payment, String razorpayPaymentId) {
        try {
            com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(razorpayPaymentId);

            // Convert Razorpay Payment to JSONObject for nested data access
            JSONObject paymentJson = razorpayPayment.toJson();

            // Update payment method
            String method = paymentJson.optString("method");
            if (method != null && !method.isEmpty()) {
                switch (method.toLowerCase()) {
                    case "card":
                        payment.setPaymentMethod(PaymentMethod.CARD);
                        if (paymentJson.has("card")) {
                            JSONObject card = paymentJson.getJSONObject("card");
                            payment.setCardLast4(card.optString("last4"));
                            payment.setCardNetwork(card.optString("network"));
                        }
                        break;
                    case "upi":
                        payment.setPaymentMethod(PaymentMethod.UPI);
                        payment.setUpiId(paymentJson.optString("vpa"));
                        break;
                    case "netbanking":
                        payment.setPaymentMethod(PaymentMethod.NET_BANKING);
                        payment.setBank(paymentJson.optString("bank"));
                        break;
                    case "wallet":
                        payment.setPaymentMethod(PaymentMethod.WALLET);
                        payment.setWallet(paymentJson.optString("wallet"));
                        break;
                    case "emi":
                        payment.setPaymentMethod(PaymentMethod.EMI);
                        break;
                }
            }

        } catch (RazorpayException e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to fetch payment details: " + e.getMessage());
        }
    }

    private String calculateRFC2104HMAC(String data, String secret) throws SignatureException {
        try {
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : rawHmac) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new SignatureException("Failed to calculate HMAC: " + e.getMessage());
        }
    }

    @Override
    public Double getTotalAmountPaidByUser(Long userId) {
        if (userId == null)
            return 0.0;
        List<Payment> successfulPayments = paymentRepository.findByUserIdAndStatus(userId, PaymentStatus.SUCCESS);

        // Calculate total by summing all successful payments and subtracting refunded
        // amounts
        return successfulPayments.stream()
                .mapToDouble(payment -> payment.getAmount() - payment.getRefundedAmount())
                .sum();
    }
}