package com.zenelait.crm.customer;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Customer;
import com.zenelait.crm.repository.CustomerRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/customers")
@CrossOrigin(origins = "*")
public class CustomerV1Controller {

    private final CustomerRepository customerRepository;
    private final TenantSecurityService tenantSecurityService;

    public CustomerV1Controller(CustomerRepository customerRepository, TenantSecurityService tenantSecurityService) {
        this.customerRepository = customerRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * POST /api/v1/customers
     */
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        Company company = tenantSecurityService.getCurrentCompany();
        customer.setTenant(company);
        Customer saved = customerRepository.save(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /api/v1/customers
     */
    @GetMapping
    public ResponseEntity<List<Customer>> getCustomers() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(customerRepository.findByTenantId(tenantId));
    }

    /**
     * GET /api/v1/customers/{customerId}
     */
    @GetMapping("/{customerId}")
    public ResponseEntity<Customer> getCustomer(@PathVariable String customerId) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
        return ResponseEntity.ok(customer);
    }

    /**
     * PATCH /api/v1/customers/{customerId}
     */
    @PatchMapping("/{customerId}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable String customerId, @RequestBody Map<String, Object> updates) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));

        if (updates.containsKey("name")) customer.setName((String) updates.get("name"));
        if (updates.containsKey("email")) customer.setEmail((String) updates.get("email"));
        if (updates.containsKey("phone")) customer.setPhone((String) updates.get("phone"));
        if (updates.containsKey("company")) customer.setCompany((String) updates.get("company"));
        if (updates.containsKey("segment")) customer.setSegment((String) updates.get("segment"));
        if (updates.containsKey("plan")) customer.setPlan((String) updates.get("plan"));
        if (updates.containsKey("status")) customer.setStatus((String) updates.get("status"));

        return ResponseEntity.ok(customerRepository.save(customer));
    }

    /**
     * GET /api/v1/customers/{customerId}/timeline
     */
    @GetMapping("/{customerId}/timeline")
    public ResponseEntity<List<Map<String, Object>>> getTimeline(@PathVariable String customerId) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));

        List<Map<String, Object>> timeline = List.of(
                Map.of("id", "TL-1", "action", "CUSTOMER_CREATED", "description", "Account established for " + customer.getName(), "timestamp", customer.getCreatedAt().toString()),
                Map.of("id", "TL-2", "action", "SUBSCRIPTION_ACTIVE", "description", "Plan upgraded to " + customer.getPlan(), "timestamp", LocalDateTime.now().minusDays(3).toString()),
                Map.of("id", "TL-3", "action", "SUPPORT_INTERACTION", "description", "AI agent provided technical documentation onboarding", "timestamp", LocalDateTime.now().minusDays(1).toString())
        );

        return ResponseEntity.ok(timeline);
    }
}
