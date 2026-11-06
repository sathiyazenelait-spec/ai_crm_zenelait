package com.zenelait.crm.tenant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenelait.crm.auth.dto.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TenantIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").doesNotExist()) // token envelope
                .andReturn();

        String json = result.getResponse().getContentAsString();
        Map<?, ?> map = objectMapper.readValue(json, Map.class);
        return (String) map.get("accessToken");
    }

    @Test
    @DisplayName("1. Authenticate Sales Manager & Assert Tenant Context")
    public void testSalesManagerAuthentication() throws Exception {
        LoginRequest req = new LoginRequest("rahul@abctech.com", "ExamplePassword123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.id").value("USR-101"))
                .andExpect(jsonPath("$.user.name").value("Rahul Sharma"))
                .andExpect(jsonPath("$.user.role").value("SALES_MANAGER"))
                .andExpect(jsonPath("$.user.tenantId").value("TEN-IT-001"))
                .andExpect(jsonPath("$.user.industry").value("SOFTWARE_IT"));
    }

    @Test
    @DisplayName("2. Verify /api/v1/users/me returns exact profile and permissions")
    public void testUserProfileAndPermissions() throws Exception {
        String token = loginAndGetToken("rahul@abctech.com", "ExamplePassword123");

        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("USR-101"))
                .andExpect(jsonPath("$.name").value("Rahul Sharma"))
                .andExpect(jsonPath("$.role").value("SALES_MANAGER"))
                .andExpect(jsonPath("$.tenant.id").value("TEN-IT-001"))
                .andExpect(jsonPath("$.tenant.companyName").value("ABC Technologies"))
                .andExpect(jsonPath("$.tenant.industry").value("SOFTWARE_IT"))
                .andExpect(jsonPath("$.permissions", hasItems("LEAD_VIEW", "LEAD_CREATE", "LEAD_ASSIGN", "OPPORTUNITY_VIEW", "REPORT_VIEW")));
    }

    @Test
    @DisplayName("3. Verify Tenant Isolation on Leads query")
    public void testTenantIsolationOnLeads() throws Exception {
        String itToken = loginAndGetToken("rahul@abctech.com", "ExamplePassword123");

        // Rahul (IT) sees LEAD-5001 (Tech Solutions Inc) but does NOT see LEAD-RE-1001 (Real Estate)
        mockMvc.perform(get("/api/v1/leads")
                        .header("Authorization", "Bearer " + itToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.items[*].id", hasItem("LEAD-5001")))
                .andExpect(jsonPath("$.items[*].id", not(hasItem("LEAD-RE-1001"))));
    }

    @Test
    @DisplayName("4. Verify Cross-Tenant Access Rejection")
    public void testCrossTenantAccessRejection() throws Exception {
        String itToken = loginAndGetToken("rahul@abctech.com", "ExamplePassword123");

        // Attempt to fetch Real Estate lead LEAD-RE-1001 with IT token -> 404 Not Found in this tenant
        mockMvc.perform(get("/api/v1/leads/LEAD-RE-1001")
                        .header("Authorization", "Bearer " + itToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("5. Verify Industry Configuration for Software/IT")
    public void testIndustryConfiguration() throws Exception {
        String token = loginAndGetToken("rahul@abctech.com", "ExamplePassword123");

        mockMvc.perform(get("/api/v1/company/industry-config")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.industry").value("SOFTWARE_IT"))
                .andExpect(jsonPath("$.enabledModules", hasItems("IT_DEMOS", "IT_REQUIREMENTS", "IT_PROPOSALS")))
                .andExpect(jsonPath("$.pipelineStages", hasItems("NEW", "QUALIFIED", "DEMO", "PROPOSAL", "WON")));
    }

    @Test
    @DisplayName("6. Verify Software/IT Demo & Proposal Endpoints")
    public void testSoftwareItEndpoints() throws Exception {
        String token = loginAndGetToken("rahul@abctech.com", "ExamplePassword123");

        mockMvc.perform(get("/api/v1/it/demos")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem("DEMO-IT-2001")));

        mockMvc.perform(get("/api/v1/it/proposals/PROP-IT-3001")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("PROP-IT-3001"))
                .andExpect(jsonPath("$.subtotal").value(500000));
    }

    @Test
    @DisplayName("7. Verify Real Estate Industry APIs (TEN-RE-002)")
    public void testRealEstateEndpoints() throws Exception {
        String token = loginAndGetToken("sales@skylineprops.com", "ExamplePassword123");

        mockMvc.perform(get("/api/v1/real-estate/properties")
                        .param("location", "Chennai")
                        .param("bedrooms", "2")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[0].id").value("PROP-RE-101"));

        mockMvc.perform(post("/api/v1/real-estate/buyer-requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"leadId\":\"LEAD-RE-1001\",\"location\":\"Chennai\",\"bedrooms\":2,\"maxBudget\":7000000}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("REQ-RE-2001"))
                .andExpect(jsonPath("$.matchingPropertiesCount").value(2));
    }

    @Test
    @DisplayName("8. Verify E-Commerce Industry APIs (TEN-EC-003)")
    public void testEcommerceEndpoints() throws Exception {
        String token = loginAndGetToken("sales@shopease.com", "ExamplePassword123");

        mockMvc.perform(get("/api/v1/ecommerce/sales-funnel")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.funnel.visitors").value(12480))
                .andExpect(jsonPath("$.funnel.purchases").value(436));

        mockMvc.perform(get("/api/v1/ecommerce/carts/abandoned")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value("CART-EC-101"))
                .andExpect(jsonPath("$.items[0].cartValue").value(79999));
    }

    @Test
    @DisplayName("9. Verify Travel Industry APIs (TEN-TR-004)")
    public void testTravelEndpoints() throws Exception {
        String token = loginAndGetToken("sales@wanderpro.com", "ExamplePassword123");

        mockMvc.perform(post("/api/v1/travel/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"leadId\":\"LEAD-TR-1001\",\"destination\":\"Dubai\",\"adults\":4,\"budget\":250000}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("ENQ-TR-2001"))
                .andExpect(jsonPath("$.destination").value("Dubai"));

        mockMvc.perform(post("/api/v1/travel/package-matches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enquiryId\":\"ENQ-TR-2001\",\"maxBudget\":250000}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches[0].packageId").value("PKG-TR-101"))
                .andExpect(jsonPath("$.matches[0].matchScore").value(94));
    }

    @Test
    @DisplayName("10. Verify Manufacturing Industry APIs (TEN-MFG-005)")
    public void testManufacturingEndpoints() throws Exception {
        String token = loginAndGetToken("sales@globalind.com", "ExamplePassword123");

        mockMvc.perform(get("/api/v1/manufacturing/rfqs")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("RFQ-MFG-2001"))
                .andExpect(jsonPath("$[0].buyerCompany").value("ABC Industrial Ltd"));

        mockMvc.perform(get("/api/v1/manufacturing/purchase-orders")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("PO-MFG-4001"))
                .andExpect(jsonPath("$[0].purchaseOrderNumber").value("ABC-PO-2026-501"));
    }

    @Test
    @DisplayName("11. Verify Financial Services Industry APIs (TEN-FIN-006)")
    public void testFinancialEndpoints() throws Exception {
        String token = loginAndGetToken("sales@securewealth.com", "ExamplePassword123");

        mockMvc.perform(post("/api/v1/financial/prospect-requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"leadId\":\"LEAD-FIN-1001\",\"serviceInterest\":\"WEALTH_MANAGEMENT\",\"consentToContact\":true}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("REQ-FIN-2001"))
                .andExpect(jsonPath("$.serviceInterest").value("WEALTH_MANAGEMENT"));

        mockMvc.perform(get("/api/v1/financial/approvals")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("APR-FIN-5001"))
                .andExpect(jsonPath("$[0].assignedQueue").value("AUTHORIZED_REVIEWERS"));
    }

    @Test
    @DisplayName("12. Verify Real Estate Support Agent APIs (/api/v1/real-estate/support)")
    public void testRealEstateSupportAgentEndpoints() throws Exception {
        String token = loginAndGetToken("support@skylineprops.com", "ExamplePassword123");

        // Dashboard
        mockMvc.perform(get("/api/v1/real-estate/support/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.openTickets").isNotEmpty());

        // Create Ticket
        mockMvc.perform(post("/api/v1/real-estate/support/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerId\":\"CUS-4001\",\"category\":\"BOOKING_ENQUIRY\",\"subject\":\"Request booking update\",\"priority\":\"NORMAL\",\"channel\":\"EMAIL\"}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ticketId").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("OPEN"));

        // Knowledge Search
        mockMvc.perform(get("/api/v1/real-estate/support/knowledge/search?q=booking")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items").isArray());
    }

    @Test
    @DisplayName("13. Verify Real Estate AI Property Sales Agent APIs (/api/v1/real-estate/ai/property-sales)")
    public void testRealEstateAiPropertySalesEndpoints() throws Exception {
        String token = loginAndGetToken("sales@skylineprops.com", "ExamplePassword123");

        // Start session
        mockMvc.perform(post("/api/v1/real-estate/ai/property-sales/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"channel\":\"WEBSITE_CHAT\",\"initialMessage\":\"Looking for 3BHK in Chennai\"}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sessionId").isNotEmpty());

        // Property Recommendations
        mockMvc.perform(post("/api/v1/real-estate/ai/property-sales/property-recommendations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"criteria\":{\"city\":\"Chennai\",\"area\":\"OMR\",\"budgetMax\":8000000}}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.recommendations").isArray());
    }

    @Test
    @DisplayName("14. Verify Software/IT AI Appointment Agent APIs (/api/v1/software/ai/appointments)")
    public void testSoftwareAiAppointmentEndpoints() throws Exception {
        String token = loginAndGetToken("rahul@abctech.com", "ExamplePassword123");

        // Availability check
        mockMvc.perform(get("/api/v1/software/ai/appointments/availability?date=2026-10-27&durationMinutes=30")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slots").isArray());

        // Metrics
        mockMvc.perform(get("/api/v1/software/ai/appointments/metrics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.appointmentsRequested").value(320));
    }

    @Test
    @DisplayName("15. Verify Software/IT AI Follow-up Agent APIs (/api/v1/software/ai/follow-ups)")
    public void testSoftwareAiFollowUpEndpoints() throws Exception {
        String token = loginAndGetToken("rahul@abctech.com", "ExamplePassword123");

        // Config
        mockMvc.perform(get("/api/v1/software/ai/follow-ups/config")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.enabled").value(true));

        // Rules
        mockMvc.perform(get("/api/v1/software/ai/follow-ups/rules")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("16. Verify Education Admission Manager APIs (/api/v1/education/admission-manager)")
    public void testEducationAdmissionManagerEndpoints() throws Exception {
        String token = loginAndGetToken("admission.mgr@abctraining.com", "ExamplePassword123");

        // Dashboard
        mockMvc.perform(get("/api/v1/education/admission-manager/dashboard?from=2026-10-01&to=2026-10-31")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.summary.totalEnquiries").isNumber())
                .andExpect(jsonPath("$.data.conversion.enquiryToApplicationPercent").isNumber());

        // Enquiries
        mockMvc.perform(get("/api/v1/education/admission-manager/enquiries")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());

        // Applications
        mockMvc.perform(get("/api/v1/education/admission-manager/applications")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("17. Verify Education Admission Executive APIs (/api/v1/education/admission-executive)")
    public void testEducationAdmissionExecutiveEndpoints() throws Exception {
        String token = loginAndGetToken("priya.exec@abctraining.com", "ExamplePassword123");

        // Dashboard
        mockMvc.perform(get("/api/v1/education/admission-executive/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.executive.name").value("Priya"))
                .andExpect(jsonPath("$.data.summary.assignedEnquiries").isNumber());

        // Follow-ups
        mockMvc.perform(get("/api/v1/education/admission-executive/follow-ups")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("18. Verify Education Student Support Agent APIs (/api/v1/education/student-support)")
    public void testEducationStudentSupportEndpoints() throws Exception {
        String token = loginAndGetToken("support@abctraining.com", "ExamplePassword123");

        // Dashboard
        mockMvc.perform(get("/api/v1/education/student-support/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.summary.assignedTickets").isNumber());

        // Tickets
        mockMvc.perform(get("/api/v1/education/student-support/tickets")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());

        // Knowledge Search
        mockMvc.perform(get("/api/v1/education/student-support/knowledge/search?q=portal")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("19. Verify Education Counsellor APIs (/api/v1/education/counsellor)")
    public void testEducationCounsellorEndpoints() throws Exception {
        String token = loginAndGetToken("counsellor@abctraining.com", "ExamplePassword123");

        // Dashboard
        mockMvc.perform(get("/api/v1/education/counsellor/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.summary.assignedStudents").isNumber());

        // Appointments
        mockMvc.perform(get("/api/v1/education/counsellor/appointments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        // Course recommendations
        mockMvc.perform(post("/api/v1/education/counsellor/students/3001/course-recommendations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"preferredLearningMode\":\"WEEKEND\",\"interests\":[\"JAVA\"]}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.recommendations").isArray());
    }
}
