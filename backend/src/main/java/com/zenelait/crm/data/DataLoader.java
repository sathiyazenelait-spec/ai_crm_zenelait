package com.zenelait.crm.data;

import com.zenelait.crm.model.*;
import com.zenelait.crm.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataLoader implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OpportunityRepository opportunityRepository;
    private final AppointmentRepository appointmentRepository;
    private final TaskRepository taskRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AiAgentRepository aiAgentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            LeadRepository leadRepository,
            CustomerRepository customerRepository,
            OpportunityRepository opportunityRepository,
            AppointmentRepository appointmentRepository,
            TaskRepository taskRepository,
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            AiAgentRepository aiAgentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.opportunityRepository = opportunityRepository;
        this.appointmentRepository = appointmentRepository;
        this.taskRepository = taskRepository;
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.aiAgentRepository = aiAgentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String defaultHashedPassword = passwordEncoder.encode("Password@123");

        // 1. Software / IT Tenant
        Company itCompany = seedCompany("TEN-IT-001", "ABC Technologies", "SOFTWARE_IT", "Software / IT", "#3b82f6", "rahul@abctech.com");
        seedUser("USR-ROOT-001", "root@zenelait.ai", defaultHashedPassword, "Sathiyaseelan (Root)", Role.ULTRA_SUPER_ADMIN, itCompany);
        seedUser("USR-SUPER-002", "superadmin@zenelait.ai", defaultHashedPassword, "Platform Admin", Role.PLATFORM_SUPER_ADMIN, itCompany);
        seedUser("USR-ADMIN-003", "admin@abctech.com", defaultHashedPassword, "Sathiyaseelan", Role.COMPANY_ADMIN, itCompany);
        seedUser("USR-101", "rahul@abctech.com", defaultHashedPassword, "Rahul Sharma", Role.SALES_MANAGER, itCompany);
        seedUser("USR-102", "anita@abctech.com", defaultHashedPassword, "Anita Sharma", Role.SALES_REP, itCompany);
        seedUser("USR-103", "priya.support@abctech.com", defaultHashedPassword, "Priya Nair", Role.SUPPORT_MANAGER, itCompany);
        seedUser("USR-104", "karthik.agent@abctech.com", defaultHashedPassword, "Karthik Raja", Role.SUPPORT_AGENT, itCompany);
        seedUser("USR-105", "sneha.marketing@abctech.com", defaultHashedPassword, "Sneha Verma", Role.MARKETING_MANAGER, itCompany);
        seedUser("USR-106", "arjun.analyst@abctech.com", defaultHashedPassword, "Arjun Raman", Role.ANALYST, itCompany);

        // 2. Real Estate Tenant
        Company reCompany = seedCompany("TEN-RE-002", "Skyline Properties", "REAL_ESTATE", "Real Estate", "#10b981", "sales@skylineprops.com");
        seedUser("USR-RE-101", "sales@skylineprops.com", defaultHashedPassword, "Vikram Singhania", Role.SALES_MANAGER, reCompany);
        seedUser("USR-RE-102", "vikrant@skylineprops.com", defaultHashedPassword, "Vikrant Roy", Role.SALES_REP, reCompany);
        seedUser("USR-RE-103", "support@skylineprops.com", defaultHashedPassword, "Suresh Support", Role.SUPPORT_AGENT, reCompany);

        // 3. E-commerce Tenant
        Company ecCompany = seedCompany("TEN-EC-003", "ShopEase Online", "ECOMMERCE", "E-commerce", "#f59e0b", "sales@shopease.com");
        seedUser("USR-EC-101", "sales@shopease.com", defaultHashedPassword, "Rohan Sen", Role.SALES_MANAGER, ecCompany);

        // 4. Travel Tenant
        Company trCompany = seedCompany("TEN-TR-004", "WanderPro Travels", "TRAVEL", "Travel & Tourism", "#06b6d4", "sales@wanderpro.com");
        seedUser("USR-TR-101", "sales@wanderpro.com", defaultHashedPassword, "Sunita Rao", Role.SALES_MANAGER, trCompany);

        // 5. Manufacturing / B2B Tenant
        Company mfgCompany = seedCompany("TEN-MFG-005", "Global Industries", "MANUFACTURING_B2B", "Manufacturing / B2B", "#6366f1", "sales@globalind.com");
        seedUser("USR-MFG-101", "sales@globalind.com", defaultHashedPassword, "Amit Verma", Role.SALES_MANAGER, mfgCompany);

        // 6. Financial Services Tenant
        Company finCompany = seedCompany("TEN-FIN-006", "SecureWealth Finance", "FINANCIAL_SERVICES", "Financial Services", "#ec4899", "sales@securewealth.com");
        seedUser("USR-FIN-101", "sales@securewealth.com", defaultHashedPassword, "Neha Kapoor", Role.SALES_MANAGER, finCompany);
        seedUser("USR-FIN-102", "aditya@securewealth.com", defaultHashedPassword, "Aditya Birla", Role.SALES_REP, finCompany);

        // 7. Education / Training Tenant
        Company eduCompany = seedCompany("TEN-EDU-001", "ABC Training Institute", "EDUCATION_TRAINING", "Education & Training", "#8b5cf6", "admissions@abctraining.com");
        seedUser("USR-EDU-101", "admission.mgr@abctraining.com", defaultHashedPassword, "Suresh Raman (Manager)", Role.ADMISSION_MANAGER, eduCompany);
        seedUser("USR-EDU-102", "priya.exec@abctraining.com", defaultHashedPassword, "Priya (Executive)", Role.ADMISSION_EXECUTIVE, eduCompany);
        seedUser("USR-EDU-103", "support@abctraining.com", defaultHashedPassword, "Deepak (Student Support)", Role.STUDENT_SUPPORT_AGENT, eduCompany);
        seedUser("USR-EDU-104", "counsellor@abctraining.com", defaultHashedPassword, "Dr. Ananya (Counsellor)", Role.COUNSELLOR, eduCompany);

        // Seed Sample Records for Software / IT
        seedLead("LEAD-5001", "Priya Sharma", "priya@example.com", "+919876543210", "Tech Solutions Inc", "QUALIFIED", 92, 500000.0, "INR", "USR-102", "Enterprise HRMS software", itCompany);
        seedOpportunity("OPP-7001", "LEAD-5001", "Enterprise HRMS Implementation", 500000.0, "INR", "QUALIFICATION", 25, "2026-11-30", itCompany);
        seedAppointment("APT-8001", "LEAD-5001", "HRMS Product Demo", "PRODUCT_DEMO", "2026-10-15T11:00:00+05:30", "2026-10-15T11:45:00+05:30", "USR-102", "VIDEO_CALL", itCompany);
        seedConversation("CONV-901", "Priya Sharma", "priya@example.com", "Website", "Can we schedule an HRMS demo?", "ASSIGNED", "USR-102", itCompany);
        seedAiAgent("agent-it-1", "AI Software SDR", "Sales Agent", "Captures cloud requirements and books demos", "🤖", itCompany);

        // Seed Sample Records for Real Estate
        seedLead("LEAD-RE-1001", "Aakash Mehta", "aakash@mehta.org", "+919822334455", "Self Employed", "QUALIFIED", 95, 7000000.0, "INR", "USR-RE-102", "2BHK Chennai Apartment", reCompany);

        // Seed Sample Records for E-Commerce
        seedCustomer("CUS-EC-501", "Kavita Reddy", "kavita@reddy.com", "+919811223344", "Retail Buyer", "VIP Consumer", ecCompany);

        // Seed Sample Records for Travel
        seedLead("LEAD-TR-1001", "Rajesh Khanna", "rajesh@khanna.com", "+919844556677", "Family Vacation", "NEW", 88, 250000.0, "INR", "USR-TR-101", "Dubai 5 Days 4 Adults", trCompany);

        // Seed Sample Records for Manufacturing
        seedLead("LEAD-MFG-1001", "ABC Industrial Ltd", "procurement@abcind.com", "+919866778899", "ABC Industrial Ltd", "NEW", 90, 4250000.0, "INR", "USR-MFG-101", "500 Induction Motors 5.5KW", mfgCompany);

        // Seed Sample Records for Financial Services
        seedLead("LEAD-FIN-1001", "Sanjay Singhal", "sanjay@singhal.com", "+919877889900", "HNI Investor", "NEW", 94, 5000000.0, "INR", "USR-FIN-102", "Wealth Management Portfolio", finCompany);

        System.out.println("✅ All 6 CRM Tenants & Sample Catalogs Successfully Seeded into Database!");
    }

    private Company seedCompany(String id, String name, String industryId, String industryName, String color, String email) {
        return companyRepository.findById(id).orElseGet(() -> {
            Company c = new Company(id, name, industryId, industryName, "Professional", 25, email, color);
            return companyRepository.save(c);
        });
    }

    private void seedUser(String id, String email, String passwordHash, String name, Role role, Company company) {
        User u = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (u == null) {
            u = new User(id, email, passwordHash, name, role, company);
            userRepository.save(u);
        } else {
            u.setPasswordHash(passwordHash);
            userRepository.save(u);
        }
    }

    private void seedLead(String id, String name, String email, String phone, String comp, String stage, int score, Double budget, String currency, String owner, String req, Company company) {
        if (!leadRepository.existsById(id)) {
            Lead l = new Lead();
            l.setId(id);
            l.setName(name);
            l.setEmail(email);
            l.setPhone(phone);
            l.setCompanyName(comp);
            l.setStage(stage);
            l.setStatus(stage);
            l.setScore(score);
            l.setBudget(budget);
            l.setCurrency(currency);
            l.setOwnerId(owner);
            l.setRequirement(req);
            l.setTenant(company);
            leadRepository.save(l);
        }
    }

    private void seedOpportunity(String id, String leadId, String name, Double amount, String currency, String stage, int prob, String closeDate, Company company) {
        if (!opportunityRepository.existsById(id)) {
            Opportunity o = new Opportunity(id, leadId, name, amount, currency, stage, prob, company);
            o.setExpectedCloseDate(closeDate);
            opportunityRepository.save(o);
        }
    }

    private void seedAppointment(String id, String leadId, String title, String type, String startAt, String endAt, String assignedTo, String channel, Company company) {
        if (!appointmentRepository.existsById(id)) {
            Appointment a = new Appointment(id, leadId, title, type, startAt, endAt, assignedTo, channel, company);
            appointmentRepository.save(a);
        }
    }

    private void seedConversation(String id, String customer, String email, String channel, String msg, String status, String assignee, Company company) {
        if (!conversationRepository.existsById(id)) {
            Conversation c = new Conversation(id, customer, email, null, channel, msg, status, company);
            c.setAssigneeId(assignee);
            Conversation saved = conversationRepository.save(c);
            ChatMessage m = new ChatMessage("customer", msg, null, saved);
            chatMessageRepository.save(m);
        }
    }

    private void seedAiAgent(String id, String name, String role, String desc, String avatar, Company company) {
        if (!aiAgentRepository.existsById(id)) {
            AiAgent a = new AiAgent(id, name, role, desc, avatar, "Website, WhatsApp", company);
            aiAgentRepository.save(a);
        }
    }

    private void seedCustomer(String id, String name, String email, String phone, String comp, String plan, Company company) {
        if (!customerRepository.existsById(id)) {
            Customer c = new Customer(id, name, email, phone, comp, plan, company);
            customerRepository.save(c);
        }
    }
}
