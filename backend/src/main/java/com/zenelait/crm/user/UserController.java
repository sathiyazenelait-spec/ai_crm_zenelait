package com.zenelait.crm.user;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.User;
import com.zenelait.crm.repository.UserRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class UserController {

    private final TenantSecurityService tenantSecurityService;
    private final UserRepository userRepository;

    public UserController(TenantSecurityService tenantSecurityService, UserRepository userRepository) {
        this.tenantSecurityService = tenantSecurityService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/v1/users/me
     * Get current authenticated user profile and permissions
     */
    @GetMapping("/api/v1/users/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        User user = tenantSecurityService.getCurrentUser();
        Company company = user.getCompany();

        Map<String, Object> tenantMap = new LinkedHashMap<>();
        tenantMap.put("id", company != null ? company.getId() : "TEN-IT-001");
        tenantMap.put("companyName", company != null ? company.getName() : "ABC Technologies");
        tenantMap.put("industry", company != null ? company.getIndustryId().toUpperCase() : "SOFTWARE_IT");

        List<String> permissions = tenantSecurityService.getPermissionsForUser(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        response.put("tenant", tenantMap);
        response.put("permissions", permissions);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/teams/members
     * Get team members within the current tenant
     */
    @GetMapping("/api/v1/teams/members")
    public ResponseEntity<List<Map<String, Object>>> getTeamMembers() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        List<User> users = userRepository.findByCompanyId(tenantId);
        
        List<Map<String, Object>> members = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getFullName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("department", u.getDepartment());
            m.put("status", u.getStatus());
            members.add(m);
        }
        return ResponseEntity.ok(members);
    }
}
