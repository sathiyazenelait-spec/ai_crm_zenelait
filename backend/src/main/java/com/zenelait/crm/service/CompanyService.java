package com.zenelait.crm.service;

import com.zenelait.crm.dto.CompanyCreateRequest;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Role;
import com.zenelait.crm.model.User;
import com.zenelait.crm.repository.CompanyRepository;
import com.zenelait.crm.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Optional<Company> getCompanyById(String id) {
        return companyRepository.findById(id);
    }

    /**
     * Search companies by user input without case sensitivity or whitespace constraints.
     * E.g. "  abc   tech " -> matches "ABC Technologies"
     */
    public List<Company> searchCompanies(String query) {
        if (query == null || query.trim().isEmpty()) {
            return companyRepository.findAll();
        }

        // Normalized clean query (lowercase without whitespace)
        String cleanQuery = Company.normalizeName(query.trim());
        
        // Match either normalized clean query or partial name match
        List<Company> results = companyRepository.searchCompaniesFuzzy(cleanQuery);
        if (results.isEmpty()) {
            results = companyRepository.searchCompaniesFuzzy(query.trim().toLowerCase());
        }
        return results;
    }

    /**
     * Find exact matching company by name regardless of case or spaces.
     */
    public Optional<Company> findByNameFuzzy(String name) {
        if (name == null || name.trim().isEmpty()) return Optional.empty();

        // 1. Try exact ignore case
        Optional<Company> direct = companyRepository.findByNameIgnoreCase(name.trim());
        if (direct.isPresent()) return direct;

        // 2. Try normalized clean name
        String clean = Company.normalizeName(name.trim());
        return companyRepository.findByCleanName(clean);
    }

    /**
     * Super Admin creates a new company and its default Company Owner account.
     */
    @Transactional
    public Company createCompanyWithAdmin(CompanyCreateRequest request) {
        String companyId = "tenant-" + UUID.randomUUID().toString().substring(0, 8);
        
        Company company = new Company(
                companyId,
                request.getName(),
                request.getIndustryId() != null ? request.getIndustryId() : "software_it",
                request.getIndustryName() != null ? request.getIndustryName() : "General Industry",
                request.getPlan() != null ? request.getPlan() : "Professional",
                request.getSeats() != null ? request.getSeats() : 25,
                request.getHrContact(),
                request.getColor() != null ? request.getColor() : "#2563eb"
        );
        company.setPhone(request.getPhone());
        company.setAddress(request.getAddress());

        Company savedCompany = companyRepository.save(company);

        // If Super Admin provided Owner info, provision the primary Company Admin account
        if (request.getHrContact() != null && !request.getHrContact().isEmpty()) {
            String ownerEmail = request.getHrContact().toLowerCase().trim();
            if (!userRepository.existsByEmailIgnoreCase(ownerEmail)) {
                String rawPassword = (request.getOwnerPassword() != null && !request.getOwnerPassword().isEmpty()) 
                        ? request.getOwnerPassword() 
                        : "Password@123";
                
                String ownerName = (request.getOwnerName() != null && !request.getOwnerName().isEmpty()) 
                        ? request.getOwnerName() 
                        : ownerEmail.split("@")[0].replace(".", " ");

                User owner = new User(
                        "usr-" + UUID.randomUUID().toString().substring(0, 8),
                        ownerEmail,
                        passwordEncoder.encode(rawPassword), // BCrypt hash
                        ownerName,
                        Role.COMPANY_ADMIN,
                        savedCompany
                );
                userRepository.save(owner);
            }
        }

        return savedCompany;
    }
}
