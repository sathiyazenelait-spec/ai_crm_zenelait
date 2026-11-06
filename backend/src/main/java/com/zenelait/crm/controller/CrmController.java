package com.zenelait.crm.controller;

import com.zenelait.crm.model.*;
import com.zenelait.crm.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm")
@CrossOrigin(origins = "*")
public class CrmController {

    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OpportunityRepository opportunityRepository;
    private final AppointmentRepository appointmentRepository;
    private final TaskRepository taskRepository;
    private final CompanyRepository companyRepository;

    public CrmController(
            LeadRepository leadRepository,
            CustomerRepository customerRepository,
            OpportunityRepository opportunityRepository,
            AppointmentRepository appointmentRepository,
            TaskRepository taskRepository,
            CompanyRepository companyRepository
    ) {
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.opportunityRepository = opportunityRepository;
        this.appointmentRepository = appointmentRepository;
        this.taskRepository = taskRepository;
        this.companyRepository = companyRepository;
    }

    // ==================== LEADS ====================
    @GetMapping("/leads")
    public ResponseEntity<List<Lead>> getLeads(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(leadRepository.findByTenantId(tenantId));
    }

    @PostMapping("/leads")
    public ResponseEntity<?> createLead(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody Lead lead) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        lead.setTenant(company);
        Lead saved = leadRepository.save(lead);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/leads/{id}")
    public ResponseEntity<?> updateLead(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return leadRepository.findById(id).map(lead -> {
            if (updates.containsKey("status")) lead.setStatus((String) updates.get("status"));
            if (updates.containsKey("stage")) lead.setStage((String) updates.get("stage"));
            if (updates.containsKey("name")) lead.setName((String) updates.get("name"));
            if (updates.containsKey("email")) lead.setEmail((String) updates.get("email"));
            if (updates.containsKey("phone")) lead.setPhone((String) updates.get("phone"));
            if (updates.containsKey("score")) lead.setScore(((Number) updates.get("score")).intValue());
            if (updates.containsKey("assignedTo")) lead.setAssignedTo((String) updates.get("assignedTo"));
            if (updates.containsKey("notes")) lead.setNotes((String) updates.get("notes"));
            return ResponseEntity.ok(leadRepository.save(lead));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<?> deleteLead(@PathVariable String id) {
        if (leadRepository.existsById(id)) {
            leadRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Lead deleted successfully", "id", id));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== CUSTOMERS ====================
    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getCustomers(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(customerRepository.findByTenantId(tenantId));
    }

    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody Customer customer) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        customer.setTenant(company);
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    // ==================== OPPORTUNITIES ====================
    @GetMapping("/opportunities")
    public ResponseEntity<List<Opportunity>> getOpportunities(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(opportunityRepository.findByTenantId(tenantId));
    }

    @PostMapping("/opportunities")
    public ResponseEntity<?> createOpportunity(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody Opportunity opportunity) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        opportunity.setTenant(company);
        return ResponseEntity.ok(opportunityRepository.save(opportunity));
    }

    // ==================== APPOINTMENTS ====================
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAppointments(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(appointmentRepository.findByTenantId(tenantId));
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody Appointment appointment) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        appointment.setTenant(company);
        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    // ==================== TASKS ====================
    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getTasks(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(taskRepository.findByTenantId(tenantId));
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody Task task) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        task.setTenant(company);
        return ResponseEntity.ok(taskRepository.save(task));
    }
}
