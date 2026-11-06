package com.zenelait.crm.tenant;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Role;
import com.zenelait.crm.model.User;
import com.zenelait.crm.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TenantSecurityService {

    private final TenantResolver tenantResolver;
    private final CompanyRepository companyRepository;

    public TenantSecurityService(TenantResolver tenantResolver, CompanyRepository companyRepository) {
        this.tenantResolver = tenantResolver;
        this.companyRepository = companyRepository;
    }

    public String getCurrentTenantId() {
        return tenantResolver.resolveCurrentTenantId();
    }

    public User getCurrentUser() {
        return tenantResolver.requireAuthenticatedUser();
    }

    public Company getCurrentCompany() {
        String tenantId = getCurrentTenantId();
        return companyRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for tenant: " + tenantId));
    }

    /**
     * Enforce tenant isolation. Checks that the resource's tenantId matches current user's tenantId.
     * Ultra Super Admin can bypass, but Sales Manager and others are strictly isolated.
     */
    public void validateTenantOwnership(String resourceTenantId) {
        User user = getCurrentUser();
        if (user.getRole() == Role.ULTRA_SUPER_ADMIN || user.getRole() == Role.PLATFORM_SUPER_ADMIN) {
            return;
        }

        String currentTenantId = getCurrentTenantId();
        if (resourceTenantId == null || !resourceTenantId.equalsIgnoreCase(currentTenantId)) {
            throw new ForbiddenException("Access denied: You do not have permission to access another company's records.");
        }
    }

    public List<String> getPermissionsForUser(User user) {
        List<String> perms = new ArrayList<>();
        Role role = user.getRole();

        if (role == null) {
            return perms;
        }

        switch (role) {
            case ULTRA_SUPER_ADMIN:
            case PLATFORM_SUPER_ADMIN:
                perms.addAll(List.of("ALL_ACCESS", "GLOBAL_ADMIN", "LEAD_VIEW", "LEAD_CREATE", "LEAD_ASSIGN", "OPPORTUNITY_VIEW", "REPORT_VIEW"));
                break;
            case COMPANY_ADMIN:
                perms.addAll(List.of("COMPANY_ADMIN", "LEAD_VIEW", "LEAD_CREATE", "LEAD_ASSIGN", "OPPORTUNITY_VIEW", "OPPORTUNITY_CREATE", "REPORT_VIEW", "USER_MANAGE", "SETTINGS_MANAGE"));
                break;
            case SALES_MANAGER:
                perms.addAll(List.of("LEAD_VIEW", "LEAD_CREATE", "LEAD_ASSIGN", "OPPORTUNITY_VIEW", "OPPORTUNITY_CREATE", "REPORT_VIEW", "CALENDAR_VIEW", "CONVERSATION_ASSIGN"));
                break;
            case SALES_REP:
                perms.addAll(List.of("LEAD_VIEW", "LEAD_CREATE", "OPPORTUNITY_VIEW", "CALENDAR_VIEW"));
                break;
            case SUPPORT_MANAGER:
                perms.addAll(List.of("TICKET_VIEW", "TICKET_CREATE", "TICKET_MANAGE", "COMPLAINT_VIEW", "KNOWLEDGE_VIEW", "REPORT_VIEW", "REAL_ESTATE_SUPPORT_VIEW"));
                break;
            case SUPPORT_AGENT:
                perms.addAll(List.of("SUPPORT_AGENT", "TICKET_VIEW", "TICKET_CREATE", "TICKET_MANAGE", "COMPLAINT_VIEW", "KNOWLEDGE_VIEW", "REAL_ESTATE_SUPPORT_VIEW"));
                break;
            case ADMISSION_MANAGER:
                perms.addAll(List.of("ADMISSION_MANAGER", "ADMISSION_DASHBOARD_VIEW", "ADMISSION_ENQUIRIES_VIEW", "ADMISSION_APPLICATIONS_VIEW", "ADMISSION_ASSIGN", "ADMISSION_TARGETS_MANAGE", "ADMISSION_REPORTS_VIEW", "ADMISSION_REVIEW", "AI_ADMISSION_VIEW", "AI_FOLLOWUPS_VIEW"));
                break;
            case ADMISSION_EXECUTIVE:
                perms.addAll(List.of("ADMISSION_EXECUTIVE", "ADMISSION_ENQUIRIES_VIEW", "ADMISSION_ENQUIRIES_MANAGE", "ADMISSION_APPLICATIONS_VIEW", "ADMISSION_APPLICATIONS_MANAGE", "FOLLOWUP_MANAGE", "AI_FOLLOWUPS_VIEW"));
                break;
            case STUDENT_SUPPORT_AGENT:
                perms.addAll(List.of("STUDENT_SUPPORT_AGENT", "STUDENT_SUPPORT_VIEW", "TICKET_VIEW", "TICKET_CREATE", "TICKET_MANAGE", "COMPLAINT_VIEW", "KNOWLEDGE_VIEW", "SUPPORT_REPORT_VIEW", "AI_SUPPORT_VIEW"));
                break;
            case COUNSELLOR:
                perms.addAll(List.of("COUNSELLOR", "COUNSELLING_VIEW", "STUDENT_PROFILE_VIEW", "ASSESSMENT_MANAGE", "APPOINTMENT_MANAGE", "ACTION_PLAN_MANAGE", "COURSE_RECOMMEND", "REFERRAL_CREATE", "AI_COUNSELLING_VIEW"));
                break;
            case ANALYST:
                perms.addAll(List.of("LEAD_VIEW", "OPPORTUNITY_VIEW", "REPORT_VIEW"));
                break;
            default:
                perms.addAll(List.of("LEAD_VIEW", "TASK_VIEW"));
                break;
        }
        return perms;
    }

    public void checkPermission(String requiredPermission) {
        User user = getCurrentUser();
        List<String> perms = getPermissionsForUser(user);
        if (!perms.contains("ALL_ACCESS") && !perms.contains(requiredPermission)) {
            throw new ForbiddenException("Authenticated user lacks permission: " + requiredPermission);
        }
    }
}
