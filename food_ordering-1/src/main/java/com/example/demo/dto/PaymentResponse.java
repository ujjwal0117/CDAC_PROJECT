package com.example.demo.dto;
import com.example.demo.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private String username;
    private Double amount;
    private String currency;
    private String status;
    private String paymentMethod;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String cardLast4;
    private String cardNetwork;
    private String upiId;
    private String bank;
    private String wallet;
    private Double refundedAmount;
    private String refundId;
    private LocalDateTime refundedAt;
    private String receipt;
    private String notes;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    public static PaymentResponse fromEntity(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());

        // FIXED: Handle null order (for wallet top-ups)
        response.setOrderId(payment.getOrder() != null ? payment.getOrder().getId() : null);

        // FIXED: Handle null user (may be set later for wallet top-ups)
        response.setUserId(payment.getUser() != null ? payment.getUser().getId() : null);
        response.setUsername(payment.getUser() != null ? payment.getUser().getUsername() : null);

        response.setAmount(payment.getAmount());
        response.setCurrency(payment.getCurrency());
        response.setStatus(payment.getStatus().name());
        response.setPaymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null);
        response.setRazorpayOrderId(payment.getRazorpayOrderId());
        response.setRazorpayPaymentId(payment.getRazorpayPaymentId());
        response.setCardLast4(payment.getCardLast4());
        response.setCardNetwork(payment.getCardNetwork());
        response.setUpiId(payment.getUpiId());
        response.setBank(payment.getBank());
        response.setWallet(payment.getWallet());
        response.setRefundedAmount(payment.getRefundedAmount());
        response.setRefundId(payment.getRefundId());
        response.setRefundedAt(payment.getRefundedAt());
        response.setReceipt(payment.getReceipt());
        response.setNotes(payment.getNotes());
        response.setFailureReason(payment.getFailureReason());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }
}
