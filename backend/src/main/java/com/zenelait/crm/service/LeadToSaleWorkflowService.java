package com.zenelait.crm.service;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.dto.LeadCreateDto;
import com.zenelait.crm.dto.LeadStageUpdateDto;
import com.zenelait.crm.model.Appointment;
import com.zenelait.crm.model.Customer;
import com.zenelait.crm.model.Lead;
import com.zenelait.crm.model.Opportunity;
import com.zenelait.crm.model.Task;
import com.zenelait.crm.repository.*;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class LeadToSaleWorkflowService {

    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OpportunityRepository opportunityRepository;
    private final AppointmentRepository appointmentRepository;
    private final TaskRepository taskRepository;
    private final SoftwareItService softwareItService;
    private final TenantSecurityService tenantSecurityService;

    public LeadToSaleWorkflowService(
            LeadRepository leadRepository,
            CustomerRepository customerRepository,
            OpportunityRepository opportunityRepository,
            AppointmentRepository appointmentRepository,
            TaskRepository taskRepository,
            SoftwareItService softwareItService,
            TenantSecurityService tenantSecurityService
    ) {
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.opportunityRepository = opportunityRepository;
        this.appointmentRepository = appointmentRepository;
        this.taskRepository = taskRepository;
        this.softwareItService = softwareItService;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * Step 1 — New enquiry
     * A customer asks for HRMS software for 500 employees through the company website.
     * The AI captures the enquiry and creates LEAD-5001.
     * API: POST /api/v1/leads
     */
    @Transactional
    public Map<String, Object> step1CaptureEnquiry(LeadCreateDto dto) {
        Lead lead = new Lead();
        lead.setName(dto.getName());
        lead.setEmail(dto.getEmail());
        lead.setPhone(dto.getPhone());
        lead.setCompanyName(dto.getCompanyName() != null ? dto.getCompanyName() : "Tech Solutions Inc.");
        lead.setSource(dto.getSource() != null ? dto.getSource() : "WEBSITE_AI_CHAT");
        lead.setRequirement(dto.getRequirement() != null ? dto.getRequirement() : "Enterprise HRMS & Payroll for 500 employees");
        lead.setBudget(dto.getBudget() != null ? dto.getBudget() : 500000.0);
        lead.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "INR");
        lead.setStage("NEW");
        lead.setStatus("NEW");
        lead.setScore(88);
        lead.setTenant(tenantSecurityService.getCurrentCompany());
        lead.setOwnerId(dto.getOwnerId() != null ? dto.getOwnerId() : tenantSecurityService.getCurrentUser().getId());

        Lead saved = leadRepository.save(lead);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("step", 1);
        res.put("leadId", saved.getId());
        res.put("name", saved.getName());
        res.put("companyName", saved.getCompanyName());
        res.put("score", saved.getScore());
        res.put("productInterest", saved.getRequirement());
        res.put("budget", saved.getBudget());
        res.put("stage", saved.getStage());
        res.put("summary", "AI captured inquiry from website for 500 employee HRMS");
        res.put("apiEndpoint", "POST /api/v1/leads");
        return res;
    }

    /**
     * Step 2 — Qualify the lead
     * The executive checks budget, employee count, required modules and purchase timeline.
     * API: GET /api/v1/leads/LEAD-5001, PATCH /api/v1/leads/LEAD-5001/stage
     */
    @Transactional
    public Map<String, Object> step2QualifyLead(String leadId, LeadStageUpdateDto dto) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        lead.setStage("QUALIFIED");
        lead.setStatus("QUALIFIED");
        lead.setScore(94);
        lead.setNotes((lead.getNotes() != null ? lead.getNotes() + "\n" : "") +
                "[Qualification Verified] Headcount: " + (dto.getEmployeeCount() != null ? dto.getEmployeeCount() : 500) +
                ", Timeline: " + (dto.getPurchaseTimeline() != null ? dto.getPurchaseTimeline() : "3 weeks") +
                ", Budget: ₹" + (dto.getVerifiedBudget() != null ? dto.getVerifiedBudget() : 500000.0));

        leadRepository.save(lead);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("step", 2);
        res.put("leadId", lead.getId());
        res.put("stage", lead.getStage());
        res.put("score", lead.getScore());
        res.put("employeeCount", dto.getEmployeeCount() != null ? dto.getEmployeeCount() : 500);
        res.put("verifiedBudget", dto.getVerifiedBudget() != null ? dto.getVerifiedBudget() : 500000.0);
        res.put("timeline", dto.getPurchaseTimeline() != null ? dto.getPurchaseTimeline() : "3 weeks");
        res.put("apiEndpoint", "PATCH /api/v1/leads/" + leadId + "/stage");
        return res;
    }

    /**
     * Step 3 — Schedule a demo
     * The executive schedules an HRMS demonstration and creates a preparation task.
     * API: POST /api/v1/appointments, POST /api/v1/tasks
     */
    @Transactional
    public Map<String, Object> step3ScheduleDemo(String leadId, String scheduledAt) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        // Create appointment
        Appointment apt = new Appointment();
        apt.setTitle("Enterprise HRMS 500-Seat Demonstration for " + lead.getCompanyName());
        apt.setLeadId(lead.getId());
        apt.setType("PRODUCT_DEMO");
        apt.setChannel("GOOGLE_MEET");
        apt.setStartAt(scheduledAt != null ? scheduledAt : LocalDateTime.now().plusDays(1).withHour(11).withMinute(0).toString());
        apt.setStatus("SCHEDULED");
        apt.setAssignedTo(tenantSecurityService.getCurrentUser().getFullName());
        apt.setTenant(lead.getTenant());
        Appointment savedApt = appointmentRepository.save(apt);

        // Create preparation task
        Task task = new Task();
        task.setTitle("Prepare HRMS Multi-Shift & Biometric Sandbox for Demo");
        task.setLeadId(lead.getId());
        task.setStatus("PENDING");
        task.setPriority("HIGH");
        task.setDueDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).toString());
        task.setTenant(lead.getTenant());
        Task savedTask = taskRepository.save(task);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("step", 3);
        res.put("leadId", lead.getId());
        res.put("appointmentId", savedApt.getId());
        res.put("appointmentTitle", savedApt.getTitle());
        res.put("meetingLink", "https://meet.google.com/zen-hrms-" + savedApt.getId());
        res.put("taskId", savedTask.getId());
        res.put("taskTitle", savedTask.getTitle());
        res.put("apiEndpoints", "POST /api/v1/appointments, POST /api/v1/tasks");
        return res;
    }

    /**
     * Step 4 — Send a proposal
     * After demo, executive prepares proposal with approved pricing and requests discount approval.
     * API: POST /api/v1/it/proposals, POST /api/v1/it/proposals/{id}/approval-requests
     */
    @Transactional
    public Map<String, Object> step4SendProposal(String leadId, double subtotal, double discountPercent) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        // Create Opportunity
        Opportunity opp = new Opportunity();
        opp.setName("HRMS 500 Seats - " + lead.getCompanyName());
        opp.setLeadId(lead.getId());
        opp.setAmount(subtotal * (1 - discountPercent / 100.0) * 1.18);
        opp.setCurrency("INR");
        opp.setStage("PROPOSAL");
        opp.setProbabilityPercent(75);
        opp.setTenant(lead.getTenant());
        Opportunity savedOpp = opportunityRepository.save(opp);

        com.zenelait.crm.dto.ItProposalDto dto = new com.zenelait.crm.dto.ItProposalDto();
        dto.setLeadId(lead.getId());
        dto.setOpportunityId(savedOpp.getId());
        dto.setTitle("Enterprise HRMS Cloud Proposal (500 Seats) - " + lead.getCompanyName());
        dto.setProduct("Enterprise HRMS & Payroll Suite");
        dto.setSubtotal(subtotal);
        dto.setDiscountPercent(discountPercent);
        dto.setCurrency("INR");

        Map<String, Object> proposal = softwareItService.createProposal(dto);

        if (discountPercent > 0) {
            com.zenelait.crm.dto.ProposalApprovalRequestDto appDto = new com.zenelait.crm.dto.ProposalApprovalRequestDto();
            appDto.setDiscountPercent(discountPercent);
            appDto.setReason("500-seat upfront annual commitment");
            softwareItService.requestProposalApproval((String) proposal.get("id"), appDto);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("step", 4);
        res.put("opportunityId", savedOpp.getId());
        res.put("proposalId", proposal.get("id"));
        res.put("totalAmount", proposal.get("totalAmount"));
        res.put("discountPercent", discountPercent);
        res.put("approvalStatus", discountPercent > 0 ? "PENDING_MANAGER_APPROVAL" : "NOT_REQUIRED");
        res.put("apiEndpoints", "POST /api/v1/it/proposals, POST /api/v1/it/proposals/{id}/approval-requests");
        return res;
    }

    /**
     * Step 5 — Close the deal
     * When customer accepts and approvals are complete, executive updates opportunity to WON.
     * API: PATCH /api/v1/opportunities/{opportunityId}/stage
     */
    @Transactional
    public Map<String, Object> step5CloseDeal(String opportunityId, String proposalId) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Opportunity opp = opportunityRepository.findByIdAndTenantId(opportunityId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + opportunityId));

        opp.setStage("WON");
        opp.setProbabilityPercent(100);
        opportunityRepository.save(opp);

        if (proposalId != null) {
            try {
                softwareItService.updateProposalStatus(proposalId, "ACCEPTED");
            } catch (Exception ignored) {}
        }

        // Convert lead to active customer
        if (opp.getLeadId() != null) {
            Lead lead = leadRepository.findByIdAndTenantId(opp.getLeadId(), tenantId).orElse(null);
            if (lead != null) {
                lead.setStage("WON");
                leadRepository.save(lead);

                Customer customer = new Customer();
                customer.setName(lead.getName());
                customer.setEmail(lead.getEmail());
                customer.setPhone(lead.getPhone());
                customer.setCompany(lead.getCompanyName());
                customer.setPlan("Enterprise HRMS Annual");
                customer.setStatus("Active");
                customer.setTenant(lead.getTenant());
                customerRepository.save(customer);
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("step", 5);
        res.put("opportunityId", opp.getId());
        res.put("stage", opp.getStage());
        res.put("amount", opp.getAmount());
        res.put("status", "CLOSED_WON");
        res.put("summary", "Deal Closed WON & Customer Handover to Implementation initiated");
        res.put("apiEndpoint", "PATCH /api/v1/opportunities/" + opportunityId + "/stage");
        return res;
    }
}
