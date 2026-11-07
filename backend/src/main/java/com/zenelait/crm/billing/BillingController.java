package com.zenelait.crm.billing;

import com.zenelait.crm.model.TenantSubscription;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BillingController {

    private final SubscriptionBillingService billingService;

    public BillingController(SubscriptionBillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/status")
    public ResponseEntity<TenantSubscription> getSubscriptionStatus(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId) {
        return ResponseEntity.ok(billingService.getOrCreateSubscription(tenantId));
    }

    @PostMapping("/create-checkout")
    public ResponseEntity<Map<String, Object>> createCheckout(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> payload) {

        String tier = payload.getOrDefault("planTier", "GROWTH");
        String gateway = payload.getOrDefault("gateway", "STRIPE");

        Map<String, Object> checkout = billingService.simulateCheckout(tenantId, tier, gateway);
        return ResponseEntity.ok(checkout);
    }

    @PostMapping("/purchase-credits")
    public ResponseEntity<Map<String, Object>> purchaseAiCredits(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, Object> payload) {

        int credits = Integer.parseInt(payload.getOrDefault("credits", 500).toString());
        String cost = payload.getOrDefault("cost", "$15").toString();

        TenantSubscription updated = billingService.addAiCredits(tenantId, credits, cost);
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Successfully added " + credits + " AI credits via Stripe/Razorpay",
                "aiCreditsTotal", updated.getAiCreditsTotal(),
                "aiCreditsRemaining", updated.getAiCreditsTotal() - updated.getAiCreditsUsed(),
                "cost", cost
        ));
    }

    @PostMapping("/stripe-webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        // Stripe webhook ingestion
        return ResponseEntity.ok("{\"status\":\"RECEIVED\"}");
    }

    @PostMapping("/razorpay-webhook")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String sigHeader) {
        // Razorpay webhook ingestion
        return ResponseEntity.ok("{\"status\":\"RECEIVED\"}");
    }
}

