package com.zenelait.crm.billing;

import com.zenelait.crm.model.TenantSubscription;
import com.zenelait.crm.repository.TenantSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionBillingService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionBillingService.class);

    private final TenantSubscriptionRepository subscriptionRepository;

    public SubscriptionBillingService(TenantSubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public TenantSubscription getOrCreateSubscription(String tenantId) {
        return subscriptionRepository.findByTenantId(tenantId).orElseGet(() -> {
            TenantSubscription sub = new TenantSubscription(
                    tenantId,
                    "GROWTH",
                    "STRIPE",
                    "sub_" + UUID.randomUUID().toString().substring(0, 10),
                    "cus_" + UUID.randomUUID().toString().substring(0, 10),
                    10,
                    1500,
                    142,
                    "ACTIVE",
                    "$79/mo",
                    "MONTHLY"
            );
            return subscriptionRepository.save(sub);
        });
    }

    public TenantSubscription upgradeTier(String tenantId, String newTier, String gateway) {
        TenantSubscription sub = getOrCreateSubscription(tenantId);
        sub.setPlanTier(newTier.toUpperCase());
        sub.setGateway(gateway.toUpperCase());
        sub.setUpdatedAt(LocalDateTime.now());
        sub.setStatus("ACTIVE");

        switch (newTier.toUpperCase()) {
            case "ENTERPRISE":
                sub.setAmount("$199/mo");
                sub.setSeatsPurchased(50);
                sub.setAiCreditsTotal(sub.getAiCreditsTotal() + 10000);
                break;
            case "GROWTH":
                sub.setAmount("$79/mo");
                sub.setSeatsPurchased(10);
                sub.setAiCreditsTotal(sub.getAiCreditsTotal() + 1500);
                break;
            case "STARTER":
            default:
                sub.setAmount("$29/mo");
                sub.setSeatsPurchased(3);
                sub.setAiCreditsTotal(sub.getAiCreditsTotal() + 250);
                break;
        }

        return subscriptionRepository.save(sub);
    }

    public TenantSubscription addAiCredits(String tenantId, int creditsToAdd, String cost) {
        TenantSubscription sub = getOrCreateSubscription(tenantId);
        sub.setAiCreditsTotal(sub.getAiCreditsTotal() + creditsToAdd);
        sub.setUpdatedAt(LocalDateTime.now());
        log.info("Added {} AI credits to tenant {} for {}", creditsToAdd, tenantId, cost);
        return subscriptionRepository.save(sub);
    }

    public boolean consumeAiCredit(String tenantId, int credits) {
        Optional<TenantSubscription> opt = subscriptionRepository.findByTenantId(tenantId);
        if (opt.isPresent()) {
            TenantSubscription sub = opt.get();
            int remaining = sub.getAiCreditsTotal() - sub.getAiCreditsUsed();
            if (remaining >= credits) {
                sub.setAiCreditsUsed(sub.getAiCreditsUsed() + credits);
                sub.setUpdatedAt(LocalDateTime.now());
                subscriptionRepository.save(sub);
                return true;
            }
        }
        return false;
    }

    public Map<String, Object> simulateCheckout(String tenantId, String tier, String gateway) {
        String checkoutId = "cs_test_" + UUID.randomUUID().toString().replace("-", "");
        String hostedUrl = gateway.equalsIgnoreCase("RAZORPAY")
                ? "https://api.razorpay.com/v1/checkout/test/" + checkoutId
                : "https://checkout.stripe.com/c/pay/" + checkoutId;

        // Auto-upgrade in sandbox test mode
        TenantSubscription updated = upgradeTier(tenantId, tier, gateway);

        return Map.of(
                "checkoutId", checkoutId,
                "gateway", gateway.toUpperCase(),
                "planTier", tier.toUpperCase(),
                "amount", updated.getAmount(),
                "status", "SESSION_CREATED_SIMULATED_SUCCESS",
                "checkoutUrl", hostedUrl,
                "currentSubscription", updated
        );
    }
}

