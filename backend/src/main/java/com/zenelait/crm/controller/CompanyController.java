package com.zenelait.crm.controller;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * GET /api/companies/public
     * List all active registered companies for public directory / picker.
     */
    @GetMapping("/public")
    public ResponseEntity<List<Company>> getPublicCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    /**
     * GET /api/companies/search?query=...
     * Fuzzy search for registration: case-insensitive & space-insensitive auto-complete.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Company>> searchCompanies(@RequestParam(required = false, defaultValue = "") String query) {
        List<Company> matches = companyService.searchCompanies(query);
        return ResponseEntity.ok(matches);
    }

    /**
     * GET /api/companies/{id}/public
     */
    @GetMapping("/{id}/public")
    public ResponseEntity<?> getCompanyById(@PathVariable String id) {
        return companyService.getCompanyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
