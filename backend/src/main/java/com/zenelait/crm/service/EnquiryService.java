package com.zenelait.crm.service;

import com.zenelait.crm.dto.CompanyCreateRequest;
import com.zenelait.crm.dto.EnquiryRequest;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Enquiry;
import com.zenelait.crm.repository.EnquiryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final CompanyService companyService;

    public EnquiryService(EnquiryRepository enquiryRepository, CompanyService companyService) {
        this.enquiryRepository = enquiryRepository;
        this.companyService = companyService;
    }

    /**
     * Public user submits software enquiry.
     */
    public Enquiry submitEnquiry(EnquiryRequest request) {
        Enquiry enquiry = new Enquiry(
                "enq-" + UUID.randomUUID().toString().substring(0, 8),
                request.getFullName(),
                request.getBusinessEmail(),
                request.getPhone(),
                request.getCompanyName(),
                request.getIndustryId(),
                request.getTeamSize(),
                request.getMessage()
        );
        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Super Admin approves an enquiry and automatically provisions the company + Company Owner account!
     */
    @Transactional
    public Company approveAndProvisionCompany(String enquiryId, String adminEmail) {
        Enquiry enquiry = enquiryRepository.findById(enquiryId)
                .orElseThrow(() -> new IllegalArgumentException("Enquiry not found: " + enquiryId));

        CompanyCreateRequest createReq = new CompanyCreateRequest();
        createReq.setName(enquiry.getCompanyName());
        createReq.setIndustryId(enquiry.getIndustryId());
        createReq.setIndustryName(enquiry.getIndustryId());
        createReq.setHrContact(enquiry.getBusinessEmail());
        createReq.setOwnerName(enquiry.getFullName());
        createReq.setPhone(enquiry.getPhone());
        createReq.setPlan("Professional");

        Company newCompany = companyService.createCompanyWithAdmin(createReq);

        enquiry.setStatus("APPROVED_PROVISIONED");
        enquiry.setProcessedAt(LocalDateTime.now());
        enquiry.setProcessedBy(adminEmail);
        enquiryRepository.save(enquiry);

        return newCompany;
    }
}
