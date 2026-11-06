package com.zenelait.crm.controller;

import com.zenelait.crm.dto.CompanyCreateRequest;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.User;
import com.zenelait.crm.repository.UserRepository;
import com.zenelait.crm.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'PLATFORM_SUPER_ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private final CompanyService companyService;
    private final UserRepository userRepository;

    public AdminController(CompanyService companyService, UserRepository userRepository) {
        this.companyService = companyService;
        this.userRepository = userRepository;
    }

    /**
     * POST /api/admin/companies
     * Super Admin creates a new company and gives the initial owner account to them.
     */
    @PostMapping("/companies")
    public ResponseEntity<?> createCompany(@RequestBody CompanyCreateRequest request) {
        try {
            Company created = companyService.createCompanyWithAdmin(request);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Company " + created.getName() + " created and Owner account provisioned!",
                    "company", created
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of(
                    "status", "ERROR",
                    "message", ex.getMessage()
            ));
        }
    }

    /**
     * GET /api/admin/users
     * List all platform users across all companies.
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
