-- ===================================================================
-- ZENELAIT AI MULTI-TENANT SAAS CRM - MYSQL DATABASE INITIALIZATION
-- ===================================================================

CREATE DATABASE IF NOT EXISTS zenelait_crm_db;
USE zenelait_crm_db;

-- 1. Companies Table (9 Multi-Tenant Industry Workspaces)
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    clean_name VARCHAR(150) NOT NULL, -- Normalized lowercase without spaces for fuzzy search
    industry_id VARCHAR(50) NOT NULL,
    industry_name VARCHAR(100) NOT NULL,
    plan VARCHAR(50) DEFAULT 'Professional',
    seats INT DEFAULT 25,
    mrr VARCHAR(50) DEFAULT '₹5,999/mo',
    hr_contact VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    logo_letter VARCHAR(10),
    color VARCHAR(20),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_clean_name (clean_name)
);

-- 2. Users Table with BCrypt Hashed Passwords and Tenant Isolation
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Stored as BCrypt hash: $2a$10$...
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ULTRA_SUPER_ADMIN, COMPANY_ADMIN, HR_MANAGER, SALES_MANAGER, SALES_REP, SUPPORT_AGENT, ANALYST
    department VARCHAR(50) DEFAULT 'Operations',
    company_id VARCHAR(50),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    phone VARCHAR(50),
    avatar_letter VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- 3. Public User Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    business_email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(150) NOT NULL,
    industry_id VARCHAR(50) NOT NULL,
    team_size VARCHAR(50),
    message TEXT,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED_PROVISIONED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by VARCHAR(100) NULL
);

-- ===================================================================
-- SEED DATA: 9 PRE-REGISTERED MULTI-TENANT COMPANIES
-- ===================================================================
INSERT INTO companies (id, name, clean_name, industry_id, industry_name, plan, seats, mrr, hr_contact, color, logo_letter)
VALUES 
('tenant-1', 'ABC Technologies', 'abctechnologies', 'software_it', 'Software / IT Company', 'Professional', 12, '₹5,999/mo', 'admin@abctech.com', '#3b82f6', 'ABC'),
('tenant-2', 'Prestige Skyline Realty', 'prestigeskylinerealty', 'real_estate', 'Real Estate & Properties', 'Enterprise Pro', 35, '$2,900/mo', 'sanjay@skylineproperties.in', '#10b981', 'PS'),
('tenant-3', 'Apex Coding Academy', 'apexcodingacademy', 'education', 'Education & EdTech', 'Growth Plan', 22, '$1,450/mo', 'admin@apexacademy.edu', '#8b5cf6', 'AA'),
('tenant-4', 'Apollo Zenith Clinic', 'apollozenithclinic', 'hospitals', 'Healthcare & Clinics', 'Enterprise Pro', 40, '$3,200/mo', 'admin@zenithhealth.org', '#ef4444', 'AZ'),
('tenant-5', 'UrbanStyle E-Commerce', 'urbanstyleecommerce', 'ecommerce', 'E-Commerce & Retail', 'Growth Plan', 28, '$1,800/mo', 'ops@urbanstyle.shop', '#ec4899', 'US'),
('tenant-6', 'Grand Azure Resort', 'grandazureresort', 'hospitality', 'Hotels & Hospitality', 'Growth Plan', 18, '$1,600/mo', 'gm@grandazureresort.com', '#f59e0b', 'GA'),
('tenant-7', 'Wanderlust Expeditions', 'wanderlustexpeditions', 'travel', 'Travel & Tourism', 'Starter Plan', 14, '$950/mo', 'hr@wanderlusttours.com', '#06b6d4', 'WE'),
('tenant-8', 'Apex Industrial Gear', 'apexindustrialgear', 'manufacturing_b2b', 'Manufacturing & B2B', 'Enterprise Pro', 30, '$2,400/mo', 'dealers@apexindustrialgear.com', '#d97706', 'AI'),
('tenant-9', 'Zenith Wealth & Legal Advisory', 'zenithwealthlegaladvisory', 'financial_services', 'Financial Services', 'Enterprise Pro', 25, '$3,100/mo', 'compliance@zenithwealth.com', '#059669', 'ZW')
ON DUPLICATE KEY UPDATE name=name;

-- 4. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(150),
    designation VARCHAR(100),
    company_size VARCHAR(50),
    source VARCHAR(50) DEFAULT 'Website',
    status VARCHAR(50) DEFAULT 'New', -- New, Contacted, Qualified, Proposal, Won, Lost
    score INT DEFAULT 60,
    assigned_to VARCHAR(100),
    assignee_role VARCHAR(100),
    ai_summary TEXT,
    recommended_action TEXT,
    notes TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_lead_tenant (tenant_id),
    INDEX idx_lead_status (status)
);

-- 5. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(150),
    segment VARCHAR(50) DEFAULT 'Enterprise',
    plan VARCHAR(50) DEFAULT 'Growth Plan',
    mrr VARCHAR(50) DEFAULT '₹35,000/mo',
    status VARCHAR(30) DEFAULT 'Active',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_customer_tenant (tenant_id)
);

-- 6. Opportunities / Deals Table
CREATE TABLE IF NOT EXISTS opportunities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(150),
    value VARCHAR(50) DEFAULT '₹2,50,000',
    stage VARCHAR(50) DEFAULT 'Proposal',
    probability INT DEFAULT 60,
    owner VARCHAR(100),
    expected_close VARCHAR(50),
    description TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_opp_tenant (tenant_id)
);

-- 7. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer VARCHAR(150) NOT NULL,
    company VARCHAR(150),
    date_time VARCHAR(100) NOT NULL,
    type VARCHAR(100) DEFAULT 'Product Demo',
    host VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Confirmed',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_apt_tenant (tenant_id)
);

-- 8. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    related_to VARCHAR(150),
    priority VARCHAR(50) DEFAULT 'Medium',
    due_date VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 9. AI Agents Table
CREATE TABLE IF NOT EXISTS ai_agents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    leads_handled INT DEFAULT 0,
    appointments_booked INT DEFAULT 0,
    accuracy VARCHAR(20) DEFAULT '99%',
    performance INT DEFAULT 90,
    channels VARCHAR(150) DEFAULT 'Website, WhatsApp',
    avatar VARCHAR(10) DEFAULT '🤖',
    system_prompt TEXT,
    temperature DOUBLE DEFAULT 0.3,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 10. Conversations & Messages Tables
CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    channel VARCHAR(50) DEFAULT 'Website',
    last_message TEXT,
    status VARCHAR(50) DEFAULT 'AI Responded',
    assigned_to VARCHAR(100) DEFAULT 'AI Agent',
    tenant_id VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    badge VARCHAR(100),
    conversation_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- 11. Knowledge Documents Table
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) DEFAULT 'PDF',
    size VARCHAR(50) DEFAULT '1.5 MB',
    uploaded_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    vectors VARCHAR(100) DEFAULT 'Indexed (Sub-20ms RAG)',
    raw_content LONGTEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 12. Automations Table
CREATE TABLE IF NOT EXISTS automations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL,
    conditions TEXT,
    action_event VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    runs_count INT DEFAULT 0,
    success_rate VARCHAR(20) DEFAULT '100%',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ===================================================================
-- SEED DATA: LEADS, AI AGENTS, APPOINTMENTS, DEALS
-- ===================================================================
INSERT INTO leads (name, email, phone, company, status, score, assigned_to, ai_summary, tenant_id)
VALUES
('Rohit Verma', 'rohit.v@techcorp.in', '+91 98765 00001', 'TechCorp Solutions', 'Qualified', 94, 'Rahul Kumar', 'Enterprise customer seeking 120 AI agent seats.', 'tenant-1'),
('Karthik Subramanian', 'karthik.sub@gmail.com', '+91 98401 22334', 'Individual Buyer', 'Qualified', 95, 'Sanjay Dutt', 'High intent 2BHK buyer under 60 Lakh.', 'tenant-2'),
('Rohan Deshmukh', 'rohan.desh@gmail.com', '+91 97654 88990', 'Student Profile', 'Proposal', 88, 'Dr. Ramesh Sharma', 'Java Full Stack Bootcamp with placement guarantee.', 'tenant-3')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO ai_agents (name, role, description, accuracy, channels, tenant_id)
VALUES
('Sales Qualification AI', 'Autonomous Sales Agent', 'Qualifies inbound inquiries, calculates BANT score, books calendar demos.', '99.4%', 'Website, WhatsApp', 'tenant-1'),
('Real Estate Concierge AI', 'Property Match & Booking', 'Instant BHK verification, floor plan delivery, and site visit passes.', '98.8%', 'WhatsApp, 99acres', 'tenant-2'),
('Admissions Counselor AI', 'Course Consultant', 'Syllabus explanation, fee EMI calculator, and demo class booking.', '99.1%', 'Website, Instagram', 'tenant-3')
ON DUPLICATE KEY UPDATE name=name;

-- ===================================================================
-- SEED DATA: USERS WITH BCRYPT HASHED PASSWORDS
-- Default raw password for all seed accounts: 'Password@123'
-- BCrypt Hash: $2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a
-- ===================================================================
INSERT INTO users (id, email, password_hash, full_name, role, department, company_id, avatar_letter)
VALUES
('usr-root', 'root@zenelait.ai', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Master Chief', 'ULTRA_SUPER_ADMIN', 'Platform Root', 'tenant-1', 'M'),
('usr-it-1', 'admin@abctech.com', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Sathiyaseelan', 'COMPANY_ADMIN', 'Executive', 'tenant-1', 'S'),
('usr-it-2', 'rahul.mgr@abctech.com', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Rahul Kumar', 'SALES_MANAGER', 'Sales', 'tenant-1', 'R'),
('usr-it-3', 'sneha.rep@abctech.com', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Sneha Iyer', 'SALES_REP', 'Sales', 'tenant-1', 'S'),
('usr-it-4', 'support@abctech.com', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Deepak Sharma', 'SUPPORT_AGENT', 'Support', 'tenant-1', 'D'),
('usr-re-1', 'sanjay@skylineproperties.in', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Sanjay Dutt', 'COMPANY_ADMIN', 'Executive', 'tenant-2', 'S'),
('usr-edu-1', 'admin@apexacademy.edu', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Dr. Ramesh Sharma', 'COMPANY_ADMIN', 'Admissions', 'tenant-3', 'R'),
('usr-health-1', 'admin@zenithhealth.org', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Dr. Anand Raman', 'COMPANY_ADMIN', 'Hospital Executive', 'tenant-4', 'A'),
('usr-ecom-1', 'ops@urbanstyle.shop', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Alex Rivera', 'COMPANY_ADMIN', 'E-Commerce Ops', 'tenant-5', 'A'),
('usr-ecom-2', 'admin@urbanstyle.shop', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Alex Rivera', 'STORE_ADMIN', 'Store Admin', 'tenant-5', 'A'),
('usr-hotel-1', 'admin@grandazure.com', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Rajesh Varma', 'HOTEL_ADMIN', 'Hotel Operations', 'tenant-6', 'R'),
('usr-hotel-2', 'gm@grandazureresort.com', '$2a$10$7Q7jKx00RkXb1mU.i3rOQeK/k.yZ8s1rVf4u0qT1x5hN.8/c3fU4a', 'Rajesh Varma', 'COMPANY_ADMIN', 'General Manager', 'tenant-6', 'R')
ON DUPLICATE KEY UPDATE full_name=full_name;

-- ===================================================================
-- 13. IT SOFTWARE CATALOGUE TABLE (HRMS, ERP, LMS, CRM)
-- ===================================================================
CREATE TABLE IF NOT EXISTS it_products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- HRMS, ERP, LMS, CRM
    sku VARCHAR(50) NOT NULL,
    base_price DOUBLE NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_cycle VARCHAR(50) DEFAULT 'ANNUAL',
    description TEXT,
    modules JSON,
    supported_deployments JSON,
    supported_integrations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO it_products (id, name, category, sku, base_price, currency, description)
VALUES
('PROD-HRMS', 'Enterprise HRMS & Payroll Suite', 'HRMS', 'HRMS-ENT-500', 450000.0, 'INR', 'Automated biometric attendance, statutory payroll, employee portal and appraisals.'),
('PROD-ERP', 'Cloud ERP & Supply Chain Core', 'ERP', 'ERP-CORE-CLD', 750000.0, 'INR', 'Multi-warehouse inventory, procurement workflows, BOM and financial ledger.'),
('PROD-LMS', 'AI-Powered Corporate Learning LMS', 'LMS', 'LMS-AI-ED', 350000.0, 'INR', 'Interactive course builder, SCORM/xAPI player and compliance reports.'),
('PROD-CRM', 'Omnichannel AI CRM & Sales Bot', 'CRM', 'CRM-BOT-OMNI', 320000.0, 'INR', 'Lead inbound auto-routing, WhatsApp bot, CPQ proposals and shared inbox.')
ON DUPLICATE KEY UPDATE name=name;

-- 14. IT Requirements Table
CREATE TABLE IF NOT EXISTS it_requirements (
    id VARCHAR(50) PRIMARY KEY,
    lead_id BIGINT,
    customer_id BIGINT,
    product VARCHAR(50) NOT NULL,
    employee_count INT,
    modules JSON,
    deployment VARCHAR(50) DEFAULT 'CLOUD',
    integrations JSON,
    budget DOUBLE,
    currency VARCHAR(10) DEFAULT 'INR',
    notes TEXT,
    status VARCHAR(50) DEFAULT 'RECEIVED',
    assigned_team VARCHAR(50) DEFAULT 'SOLUTION_ENGINEERING',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 15. IT Demos Table
CREATE TABLE IF NOT EXISTS it_demos (
    id VARCHAR(50) PRIMARY KEY,
    lead_id BIGINT,
    product VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    presenter_id VARCHAR(50),
    presenter_name VARCHAR(100),
    channel VARCHAR(50) DEFAULT 'GOOGLE_MEET',
    meeting_link VARCHAR(255),
    attendees JSON,
    special_focus TEXT,
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
    outcome_status VARCHAR(50), -- POSITIVE_ADVANCING, TECHNICAL_QUESTIONS_PENDING, NOT_A_FIT
    interest_score INT DEFAULT 85,
    questions_asked TEXT,
    objections_faced TEXT,
    next_steps TEXT,
    tech_staff_required BOOLEAN DEFAULT FALSE,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 16. IT Proposals Table
CREATE TABLE IF NOT EXISTS it_proposals (
    id VARCHAR(50) PRIMARY KEY,
    opportunity_id BIGINT,
    lead_id BIGINT,
    title VARCHAR(200) NOT NULL,
    product VARCHAR(150) NOT NULL,
    subscription_plan VARCHAR(100),
    line_items JSON,
    subtotal DOUBLE NOT NULL,
    discount_percent DOUBLE DEFAULT 0.0,
    discount_amount DOUBLE DEFAULT 0.0,
    tax_percent DOUBLE DEFAULT 18.0,
    tax_amount DOUBLE DEFAULT 0.0,
    total_amount DOUBLE NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, SENT, ACCEPTED, REJECTED, EXECUTED
    approval_required BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(50) DEFAULT 'NOT_REQUIRED', -- NOT_REQUIRED, SUBMITTED_TO_MANAGER, APPROVED, REJECTED
    valid_until DATE,
    prepared_by VARCHAR(100),
    notes TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 17. Proposal Approval Requests Table (Discount Gate)
CREATE TABLE IF NOT EXISTS it_proposal_approvals (
    id VARCHAR(50) PRIMARY KEY,
    proposal_id VARCHAR(50) NOT NULL,
    discount_percent DOUBLE NOT NULL,
    requested_discount_amount DOUBLE,
    reason TEXT NOT NULL,
    requested_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, REJECTED
    reviewed_by VARCHAR(100) NULL,
    manager_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (proposal_id) REFERENCES it_proposals(id) ON DELETE CASCADE
);
-- 18. Education Courses Table
CREATE TABLE IF NOT EXISTS education_courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    duration_weeks INT NOT NULL,
    published_fee DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    learning_modes JSON,
    eligibility_summary TEXT,
    eligibility_details JSON,
    status VARCHAR(50) DEFAULT 'PUBLISHED',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 19. Education AI Admission Sessions Table
CREATE TABLE IF NOT EXISTS education_ai_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    channel VARCHAR(50) DEFAULT 'WEBSITE_CHAT',
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, WAITING_FOR_STUDENT, QUALIFIED, HANDOFF_PENDING, HANDED_OFF, CLOSED
    student_name VARCHAR(150),
    visitor_info JSON,
    intent VARCHAR(100),
    lead_id BIGINT NULL,
    assigned_employee_id BIGINT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 20. Education AI Admission Messages Table
CREATE TABLE IF NOT EXISTS education_ai_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(100) UNIQUE NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    sender VARCHAR(50) NOT NULL, -- STUDENT, AI_ADMISSION_AGENT, HUMAN_EXECUTIVE
    content TEXT NOT NULL,
    intent VARCHAR(100),
    course_reference_id INT NULL,
    knowledge_sources JSON,
    requires_human_handoff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES education_ai_sessions(session_id) ON DELETE CASCADE
);

-- 21. Education AI Qualifications Table
CREATE TABLE IF NOT EXISTS education_ai_qualifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    qualification_id BIGINT UNIQUE NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    education_level VARCHAR(100),
    programming_experience VARCHAR(50),
    interested_course_id INT,
    preferred_learning_mode VARCHAR(50),
    expected_joining_date DATE,
    qualification_answers JSON,
    qualification_status VARCHAR(50) DEFAULT 'QUALIFIED',
    next_recommended_action VARCHAR(100),
    requires_human_review BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES education_ai_sessions(session_id) ON DELETE CASCADE
);

-- 22. Education Admission Leads Table
CREATE TABLE IF NOT EXISTS education_admission_leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lead_id BIGINT UNIQUE NOT NULL,
    session_id VARCHAR(100) NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    interested_course_id INT,
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, QUALIFIED, APPLICATION_IN_PROGRESS, APPLICATION_SUBMITTED, ADMITTED, NOT_INTERESTED
    source VARCHAR(50) DEFAULT 'WEBSITE_CHAT',
    assigned_executive_id BIGINT NULL,
    consent JSON,
    notes TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 23. Education Admission Applications Table
CREATE TABLE IF NOT EXISTS education_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_id BIGINT UNIQUE NOT NULL,
    lead_id BIGINT NOT NULL,
    course_id INT NOT NULL,
    academic_year VARCHAR(50),
    intake VARCHAR(50),
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    missing_fields JSON,
    requires_student_completion BOOLEAN DEFAULT TRUE,
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES education_admission_leads(lead_id) ON DELETE CASCADE
);

-- 24. Education Counselling Appointments Table
CREATE TABLE IF NOT EXISTS education_counselling_appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    appointment_request_id BIGINT UNIQUE NOT NULL,
    lead_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_CONFIRMATION', -- PENDING_CONFIRMATION, CONFIRMED, RESCHEDULED, CANCELLED, COMPLETED
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(20) NOT NULL,
    time_zone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    meeting_mode VARCHAR(50) DEFAULT 'ONLINE',
    meeting_link VARCHAR(255),
    reason TEXT,
    assigned_counsellor_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES education_admission_leads(lead_id) ON DELETE CASCADE
);

-- 25. Education Verified Knowledge Sources Table
CREATE TABLE IF NOT EXISTS education_knowledge_sources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    source_type VARCHAR(50) DEFAULT 'DOCUMENT',
    storage_key VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    enabled BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'INDEXED', -- PENDING_INDEXING, INDEXING, INDEXED, FAILED
    last_synced_at TIMESTAMP NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 26. Education AI Follow-up Rules Table
CREATE TABLE IF NOT EXISTS education_followup_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- ENQUIRY_CREATED, APPLICATION_INCOMPLETE, UPCOMING_COUNSELLING, etc.
    delay_minutes INT DEFAULT 1440,
    channel VARCHAR(50) DEFAULT 'EMAIL',
    conditions JSON,
    message_template_id VARCHAR(100),
    requires_approval BOOLEAN DEFAULT TRUE,
    max_executions_per_lead INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, PAUSED, ARCHIVED
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 27. Education Follow-up Tasks Table
CREATE TABLE IF NOT EXISTS education_followup_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT UNIQUE NOT NULL,
    lead_id BIGINT NOT NULL,
    application_id BIGINT NULL,
    rule_id BIGINT NULL,
    task_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) DEFAULT 'EMAIL',
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- PENDING, SCHEDULED, DRAFT_READY, AWAITING_APPROVAL, QUEUED, SENT, DELIVERED, COMPLETED, CANCELLED, FAILED, SUPPRESSED
    scheduled_at TIMESTAMP NOT NULL,
    time_zone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    reason TEXT,
    requires_approval BOOLEAN DEFAULT TRUE,
    outcome VARCHAR(100) NULL,
    notes TEXT,
    created_by VARCHAR(100) DEFAULT 'AI_FOLLOWUP_AGENT',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (lead_id) REFERENCES education_admission_leads(lead_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 28. Education Follow-up Message Drafts Table
CREATE TABLE IF NOT EXISTS education_followup_drafts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    draft_id VARCHAR(100) UNIQUE NOT NULL,
    lead_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    channel VARCHAR(50) DEFAULT 'EMAIL',
    subject VARCHAR(255),
    body TEXT NOT NULL,
    purpose VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, REJECTED, SENT
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    review_comment TEXT,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES education_admission_leads(lead_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES education_followup_tasks(task_id) ON DELETE CASCADE
);

-- 29. Education Follow-up Executions Table
CREATE TABLE IF NOT EXISTS education_followup_executions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    execution_id VARCHAR(100) UNIQUE NOT NULL,
    task_id BIGINT NOT NULL,
    draft_id VARCHAR(100) NOT NULL,
    channel VARCHAR(50) DEFAULT 'EMAIL',
    status VARCHAR(50) DEFAULT 'QUEUED', -- QUEUED, SENT, DELIVERED, FAILED
    delivery_status VARCHAR(50) DEFAULT 'PENDING',
    attempt_count INT DEFAULT 0,
    provider_message_id VARCHAR(100) NULL,
    last_error TEXT NULL,
    idempotency_key VARCHAR(150) UNIQUE NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES education_followup_tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 30. Education Contact Suppressions Table (Opt-Outs)
CREATE TABLE IF NOT EXISTS education_contact_suppressions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    suppression_id VARCHAR(100) UNIQUE NOT NULL,
    lead_id BIGINT NOT NULL,
    channel VARCHAR(50) DEFAULT 'EMAIL',
    scope VARCHAR(100) DEFAULT 'MARKETING_MESSAGES',
    reason VARCHAR(100) DEFAULT 'STUDENT_OPTED_OUT',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    effective_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES education_admission_leads(lead_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 31. Education AI Audit Events Table
CREATE TABLE IF NOT EXISTS education_ai_audit_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    actor_type VARCHAR(50) NOT NULL, -- AI_AGENT, USER
    actor_id VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    payload_summary TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ===================================================================
-- HOSPITAL / CLINIC TENANT SCHEMA: RECEPTION, SUPPORT, COORDINATION
-- ===================================================================

-- 32. Hospital Departments Table
CREATE TABLE IF NOT EXISTS hospital_departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_id VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    floor VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 33. Hospital Doctors Table
CREATE TABLE IF NOT EXISTS hospital_doctors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    specialization VARCHAR(150),
    department VARCHAR(50) NOT NULL,
    booking_enabled BOOLEAN DEFAULT TRUE,
    consultation_duration_minutes INT DEFAULT 15,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 34. Hospital Appointment Slots Table
CREATE TABLE IF NOT EXISTS hospital_appointment_slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    slot_id VARCHAR(50) UNIQUE NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    appointment_type VARCHAR(50) DEFAULT 'CONSULTATION',
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, BOOKED, BLOCKED
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES hospital_doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 35. Hospital Patients Table
CREATE TABLE IF NOT EXISTS hospital_patients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    patient_reference VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(50) NOT NULL,
    phone_masked VARCHAR(50),
    email VARCHAR(150),
    preferred_language VARCHAR(20) DEFAULT 'en',
    registration_source VARCHAR(50) DEFAULT 'FRONT_DESK',
    registration_status VARCHAR(50) DEFAULT 'REGISTERED',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 36. Hospital Appointments Table
CREATE TABLE IF NOT EXISTS hospital_appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    patient_reference VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    slot_id VARCHAR(50) NOT NULL,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'BOOKED', -- BOOKED, CHECKED_IN, COMPLETED, CANCELLED, RESCHEDULED
    confirmation_status VARCHAR(50) DEFAULT 'PENDING',
    checked_in_at TIMESTAMP NULL,
    booking_source VARCHAR(50) DEFAULT 'FRONT_DESK',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES hospital_patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES hospital_doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 37. Hospital Reception Queue Table
CREATE TABLE IF NOT EXISTS hospital_reception_queue (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    queue_entry_id VARCHAR(50) UNIQUE NOT NULL,
    appointment_id VARCHAR(50) NULL,
    patient_id VARCHAR(50) NOT NULL,
    patient_reference VARCHAR(50) NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'WAITING', -- WAITING, CALLED, IN_CONSULTATION, COMPLETED
    administrative_wait_minutes INT DEFAULT 0,
    arrival_channel VARCHAR(50) DEFAULT 'FRONT_DESK',
    tenant_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 38. Hospital Patient Enquiries Table
CREATE TABLE IF NOT EXISTS hospital_patient_enquiries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enquiry_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    patient_reference VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    channel VARCHAR(50) DEFAULT 'PHONE',
    subject VARCHAR(200) NOT NULL,
    summary TEXT,
    priority VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, HIGH, ESCALATED
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ASSIGNED, TRANSFERRED, RESOLVED
    assigned_to_staff_id VARCHAR(50) NULL,
    assigned_team VARCHAR(100) DEFAULT 'RECEPTION',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES hospital_patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 39. Hospital Support Tickets Table
CREATE TABLE IF NOT EXISTS hospital_support_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    channel VARCHAR(50) DEFAULT 'WEBSITE_CHAT',
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'NORMAL',
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to_user_id VARCHAR(50) NULL,
    assigned_team VARCHAR(100) DEFAULT 'CUSTOMER_SUPPORT',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES hospital_patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 40. Hospital AI Reply Drafts Table
CREATE TABLE IF NOT EXISTS hospital_ai_reply_drafts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    draft_id VARCHAR(50) UNIQUE NOT NULL,
    ticket_id VARCHAR(50) NOT NULL,
    reply_goal VARCHAR(255),
    tone VARCHAR(50) DEFAULT 'POLITE_AND_CLEAR',
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'AWAITING_REVIEW', -- AWAITING_REVIEW, APPROVED, REJECTED, QUEUED_FOR_DELIVERY
    requires_human_approval BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(50) NULL,
    approved_at TIMESTAMP NULL,
    review_comment TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES hospital_support_tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 41. Hospital Appointment Reminders Table
CREATE TABLE IF NOT EXISTS hospital_appointment_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reminder_id VARCHAR(50) UNIQUE NOT NULL,
    appointment_id VARCHAR(50) NOT NULL,
    channel VARCHAR(50) DEFAULT 'SMS',
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, SENT, DELIVERED, CANCELLED
    schedule_at TIMESTAMP NOT NULL,
    template_code VARCHAR(100) DEFAULT 'APPOINTMENT_REMINDER_24H',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES hospital_appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 42. Hospital Staff Profiles Table
CREATE TABLE IF NOT EXISTS hospital_staff_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    professional_title VARCHAR(100),
    department VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    employment_status VARCHAR(50) DEFAULT 'ACTIVE',
    profile_status VARCHAR(50) DEFAULT 'VERIFIED',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    preferred_language VARCHAR(20) DEFAULT 'en',
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 43. Hospital Staff Availability Rules Table
CREATE TABLE IF NOT EXISTS hospital_staff_availability_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_id VARCHAR(50) UNIQUE NOT NULL,
    staff_id VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    appointment_duration_minutes INT DEFAULT 20,
    effective_from DATE,
    effective_to DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 44. Hospital Staff Tasks Table
CREATE TABLE IF NOT EXISTS hospital_staff_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id VARCHAR(50) UNIQUE NOT NULL,
    staff_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'NORMAL',
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    due_at TIMESTAMP NULL,
    assigned_by VARCHAR(50),
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 45. Hospital Staff Task Notes Table
CREATE TABLE IF NOT EXISTS hospital_staff_task_notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    note_id VARCHAR(50) UNIQUE NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    visibility VARCHAR(50) DEFAULT 'INTERNAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES hospital_staff_tasks(task_id) ON DELETE CASCADE
);

-- 46. Hospital Staff Notifications Table
CREATE TABLE IF NOT EXISTS hospital_staff_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id VARCHAR(50) UNIQUE NOT NULL,
    staff_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'SCHEDULE_UPDATE',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 47. Hospital AI Receptionist Sessions Table
CREATE TABLE IF NOT EXISTS hospital_ai_receptionist_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    channel VARCHAR(50) DEFAULT 'WEBSITE_CHAT',
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, HANDOFF
    expires_at TIMESTAMP NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 48. Hospital AI Receptionist Messages Table
CREATE TABLE IF NOT EXISTS hospital_ai_receptionist_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    session_id VARCHAR(50) NOT NULL,
    sender_type VARCHAR(50) NOT NULL, -- PATIENT, AI_RECEPTIONIST, HUMAN_STAFF
    content TEXT NOT NULL,
    knowledge_references JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES hospital_ai_receptionist_sessions(session_id) ON DELETE CASCADE
);

-- 49. Hospital AI Receptionist Handoffs Table
CREATE TABLE IF NOT EXISTS hospital_ai_receptionist_handoffs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    handoff_id VARCHAR(50) UNIQUE NOT NULL,
    session_id VARCHAR(50) NOT NULL,
    target_team VARCHAR(100) DEFAULT 'RECEPTION',
    reason VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_ASSIGNMENT', -- PENDING_ASSIGNMENT, ASSIGNED, IN_PROGRESS, RESOLVED, CANCELLED
    assigned_to_staff_id VARCHAR(50) NULL,
    summary TEXT,
    resolution_note TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES hospital_ai_receptionist_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 50. Hospital Knowledge Sources Table
CREATE TABLE IF NOT EXISTS hospital_knowledge_sources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    source_type VARCHAR(50) DEFAULT 'DOCUMENT_COLLECTION',
    description TEXT,
    content_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, PENDING_REVIEW, ARCHIVED
    published_article_count INT DEFAULT 0,
    last_synced_at TIMESTAMP NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 51. Hospital AI Appointment Sessions Table
CREATE TABLE IF NOT EXISTS hospital_ai_appointment_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    language VARCHAR(10) DEFAULT 'en',
    next_step VARCHAR(50) DEFAULT 'SELECT_DEPARTMENT',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 52. E-Commerce Products Table
CREATE TABLE IF NOT EXISTS ecommerce_products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    sku VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 53. E-Commerce Warehouses Table
CREATE TABLE IF NOT EXISTS ecommerce_warehouses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    warehouse_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 54. E-Commerce Product Inventory Table
CREATE TABLE IF NOT EXISTS ecommerce_inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    on_hand_quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    available_quantity INT DEFAULT 0,
    tenant_id VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_prod_warehouse (product_id, warehouse_id),
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 55. E-Commerce Orders Table
CREATE TABLE IF NOT EXISTS ecommerce_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_reference VARCHAR(50) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'CONFIRMED', -- CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    payment_status VARCHAR(50) DEFAULT 'PAID', -- PENDING, PAID, REFUNDED, PARTIALLY_REFUNDED
    fulfilment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, PACKED, SHIPPED, DELIVERED
    currency VARCHAR(10) DEFAULT 'INR',
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_provider_ref VARCHAR(100) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 56. E-Commerce Order Items Table
CREATE TABLE IF NOT EXISTS ecommerce_order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_item_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ecommerce_orders(order_id) ON DELETE CASCADE
);

-- 57. E-Commerce Fulfilment Requests Table
CREATE TABLE IF NOT EXISTS ecommerce_fulfilments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fulfilment_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, PACKED, DISPATCHED, COMPLETED
    priority VARCHAR(50) DEFAULT 'NORMAL',
    item_count INT DEFAULT 1,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ecommerce_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 58. E-Commerce Shipments Table
CREATE TABLE IF NOT EXISTS ecommerce_shipments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shipment_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    carrier_code VARCHAR(100) NOT NULL,
    carrier_name VARCHAR(150) NOT NULL,
    tracking_number VARCHAR(100) NULL,
    status VARCHAR(50) DEFAULT 'CREATION_PENDING', -- CREATION_PENDING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
    estimated_delivery_date DATE NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ecommerce_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 59. E-Commerce Cancellation Requests Table
CREATE TABLE IF NOT EXISTS ecommerce_cancellation_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    reason VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED
    decision_reason TEXT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ecommerce_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 60. E-Commerce Return Requests Table
CREATE TABLE IF NOT EXISTS ecommerce_return_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    return_request_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    reason VARCHAR(150) NOT NULL,
    customer_description TEXT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED, RECEIVED
    return_method VARCHAR(50) DEFAULT 'PICKUP',
    inspection_status VARCHAR(50) DEFAULT 'PENDING',
    inspection_note TEXT NULL,
    received_at TIMESTAMP NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ecommerce_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 61. E-Commerce Refund Requests Table
CREATE TABLE IF NOT EXISTS ecommerce_refund_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    refund_request_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    requested_amount DECIMAL(12, 2) NOT NULL,
    approved_amount DECIMAL(12, 2) NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    reason VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, APPROVED, REJECTED, PROCESSING, SUCCEEDED, FAILED
    refund_execution_id VARCHAR(100) NULL,
    approved_by VARCHAR(50) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ecommerce_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 62. E-Commerce Support Tickets Table
CREATE TABLE IF NOT EXISTS ecommerce_support_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    customer_reference VARCHAR(50) NOT NULL,
    order_reference VARCHAR(50) NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, AWAITING_CUSTOMER, IN_PROGRESS, RESOLVED, CLOSED
    assigned_agent_id VARCHAR(50) NULL,
    queue_id VARCHAR(50) NULL,
    sla_status VARCHAR(50) DEFAULT 'ON_TRACK', -- ON_TRACK, AT_RISK, BREACHED
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 63. E-Commerce Support Messages Table
CREATE TABLE IF NOT EXISTS ecommerce_support_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    ticket_id VARCHAR(50) NOT NULL,
    sender_type VARCHAR(50) NOT NULL, -- CUSTOMER, SUPPORT_AGENT, AI_SUPPORT
    message_type VARCHAR(50) DEFAULT 'PUBLIC_REPLY', -- PUBLIC_REPLY, INTERNAL_NOTE
    content TEXT NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'QUEUED', -- QUEUED, SENT, DELIVERED, FAILED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES ecommerce_support_tickets(ticket_id) ON DELETE CASCADE
);

-- 64. E-Commerce Sales Campaigns Table
CREATE TABLE IF NOT EXISTS ecommerce_sales_campaigns (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    campaign_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    campaign_type VARCHAR(50) DEFAULT 'DISCOUNT',
    channel VARCHAR(50) DEFAULT 'EMAIL',
    audience_segment_id VARCHAR(100) NOT NULL,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, ACTIVE, PAUSED, COMPLETED
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    created_by VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 65. E-Commerce Abandoned Carts Table
CREATE TABLE IF NOT EXISTS ecommerce_abandoned_carts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id VARCHAR(50) UNIQUE NOT NULL,
    customer_reference VARCHAR(50) NOT NULL,
    item_count INT DEFAULT 1,
    cart_value DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    abandoned_at TIMESTAMP NOT NULL,
    recovery_eligible BOOLEAN DEFAULT TRUE,
    previous_recovery_attempts INT DEFAULT 0,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 66. E-Commerce AI Conversations Table
CREATE TABLE IF NOT EXISTS ecommerce_ai_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id VARCHAR(50) UNIQUE NOT NULL,
    channel VARCHAR(50) DEFAULT 'WEBSITE_CHAT',
    customer_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, WAITING_FOR_HUMAN, RESOLVED, CLOSED
    agent_type VARCHAR(50) NOT NULL, -- AI_SALES_AGENT, AI_SUPPORT_AGENT, AI_ORDER_AGENT
    category VARCHAR(100) NULL,
    human_handoff_required BOOLEAN DEFAULT FALSE,
    handoff_reason VARCHAR(100) NULL,
    assigned_queue VARCHAR(100) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 67. E-Commerce AI Conversation Messages Table
CREATE TABLE IF NOT EXISTS ecommerce_ai_conversation_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    sender VARCHAR(50) NOT NULL, -- CUSTOMER, AI_SALES_AGENT, AI_SUPPORT_AGENT, AI_ORDER_AGENT, HUMAN_AGENT
    content TEXT NOT NULL,
    grounded BOOLEAN DEFAULT FALSE,
    source_references JSON NULL,
    requires_verification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ecommerce_ai_conversations(conversation_id) ON DELETE CASCADE
);

-- 68. E-Commerce AI Recommendations Table
CREATE TABLE IF NOT EXISTS ecommerce_ai_recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recommendation_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    conversation_id VARCHAR(50) NULL,
    category VARCHAR(100) NULL,
    budget_min DECIMAL(12, 2) NULL,
    budget_max DECIMAL(12, 2) NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    recommended_products JSON NOT NULL,
    feedback VARCHAR(50) NULL, -- HELPFUL, NOT_HELPFUL
    feedback_notes TEXT NULL,
    catalogue_checked BOOLEAN DEFAULT TRUE,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 69. E-Commerce AI Leads Table
CREATE TABLE IF NOT EXISTS ecommerce_ai_leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lead_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NULL,
    source VARCHAR(50) DEFAULT 'WEBSITE_CHAT',
    interest VARCHAR(150) NULL,
    budget DECIMAL(12, 2) NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    notes TEXT NULL,
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, QUALIFIED, CONVERTED, LOST
    qualification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, QUALIFIED, DISQUALIFIED
    purchase_intent VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    assigned_to VARCHAR(50) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 70. E-Commerce AI Lead Activities Table
CREATE TABLE IF NOT EXISTS ecommerce_ai_lead_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    activity_id VARCHAR(50) UNIQUE NOT NULL,
    lead_id VARCHAR(50) NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- CALL, EMAIL, CHAT, NOTE, QUALIFICATION
    notes TEXT NOT NULL,
    performed_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES ecommerce_ai_leads(lead_id) ON DELETE CASCADE
);

-- 71. E-Commerce AI Automation Runs Table
CREATE TABLE IF NOT EXISTS ecommerce_ai_automation_runs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    run_id VARCHAR(50) UNIQUE NOT NULL,
    agent_type VARCHAR(50) NOT NULL, -- AI_SALES_AGENT, AI_SUPPORT_AGENT, AI_ORDER_AGENT
    task_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED', -- COMPLETED, FAILED, RUNNING, RETRIED
    items_processed INT DEFAULT 0,
    details TEXT NULL,
    error_message TEXT NULL,
    retry_count INT DEFAULT 0,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 72. E-Commerce AI Order Enquiries Table
CREATE TABLE IF NOT EXISTS ecommerce_ai_order_enquiries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enquiry_id VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    enquiry_type VARCHAR(50) NOT NULL, -- STATUS, TRACKING, DELIVERY_DELAY, CANCELLATION, RETURN, REFUND
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ANSWERED, ESCALATED, RESOLVED
    agent_response TEXT NULL,
    escalation_id VARCHAR(50) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 73. Hotel Properties Table
CREATE TABLE IF NOT EXISTS hotel_properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    star_rating INT DEFAULT 5,
    location VARCHAR(200) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    checkin_time VARCHAR(20) DEFAULT '14:00',
    checkout_time VARCHAR(20) DEFAULT '11:00',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 74. Hotel Room Types Table
CREATE TABLE IF NOT EXISTS hotel_room_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_type_id VARCHAR(50) UNIQUE NOT NULL,
    hotel_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    max_adults INT DEFAULT 2,
    max_children INT DEFAULT 1,
    base_price_per_night DECIMAL(12, 2) NOT NULL,
    total_rooms INT DEFAULT 10,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 75. Hotel Rooms Inventory Table
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(50) UNIQUE NOT NULL,
    hotel_id VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type_id VARCHAR(50) NOT NULL,
    floor INT DEFAULT 1,
    operational_status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, OUT_OF_SERVICE
    housekeeping_status VARCHAR(50) DEFAULT 'CLEAN', -- DIRTY, IN_PROGRESS, CLEAN, INSPECTED
    maintenance_status VARCHAR(50) DEFAULT 'AVAILABLE',
    current_reservation_id VARCHAR(50) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 76. Hotel Rate Plans Table
CREATE TABLE IF NOT EXISTS hotel_rate_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rate_plan_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    room_type_id VARCHAR(50) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    price_per_night DECIMAL(12, 2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    refundable BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'APPROVED', -- ACTIVE, APPROVED, PENDING_APPROVAL, ARCHIVED
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 77. Hotel Reservations Table
CREATE TABLE IF NOT EXISTS hotel_reservations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reservation_id VARCHAR(50) UNIQUE NOT NULL,
    confirmation_number VARCHAR(100) UNIQUE NOT NULL,
    guest_id VARCHAR(50) NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    room_type_id VARCHAR(50) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    assigned_room_id VARCHAR(50) NULL,
    assigned_room_number VARCHAR(20) NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults INT DEFAULT 1,
    children INT DEFAULT 0,
    rooms_count INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'CONFIRMED', -- PENDING_CONFIRMATION, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PARTIALLY_PAID, PAID, REFUNDED
    currency VARCHAR(10) DEFAULT 'INR',
    total_amount DECIMAL(12, 2) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 78. Hotel Folios Table
CREATE TABLE IF NOT EXISTS hotel_folios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    folio_id VARCHAR(50) UNIQUE NOT NULL,
    reservation_id VARCHAR(50) NOT NULL,
    guest_id VARCHAR(50) NOT NULL,
    room_charges DECIMAL(12, 2) DEFAULT 0.00,
    taxes DECIMAL(12, 2) DEFAULT 0.00,
    additional_charges DECIMAL(12, 2) DEFAULT 0.00,
    payments_received DECIMAL(12, 2) DEFAULT 0.00,
    balance_due DECIMAL(12, 2) DEFAULT 0.00,
    folio_status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, SETTLED, CLOSED
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 79. Hotel Enquiries Table
CREATE TABLE IF NOT EXISTS hotel_enquiries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enquiry_id VARCHAR(50) UNIQUE NOT NULL,
    guest_id VARCHAR(50) NULL,
    guest_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NULL,
    channel VARCHAR(50) DEFAULT 'WEBSITE',
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ASSIGNED, RESOLVED, CLOSED
    assigned_to VARCHAR(50) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 80. Hotel Support Tickets Table
CREATE TABLE IF NOT EXISTS hotel_support_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    guest_id VARCHAR(50) NOT NULL,
    reservation_id VARCHAR(50) NULL,
    channel VARCHAR(50) DEFAULT 'WEBSITE',
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'ROOM_MAINTENANCE',
    priority VARCHAR(50) DEFAULT 'HIGH',
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ASSIGNED, IN_PROGRESS, WAITING_FOR_GUEST, RESOLVED, CLOSED
    assigned_team VARCHAR(100) DEFAULT 'MAINTENANCE',
    assigned_to VARCHAR(50) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 81. Hotel Service Requests Table
CREATE TABLE IF NOT EXISTS hotel_service_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    guest_id VARCHAR(50) NOT NULL,
    reservation_id VARCHAR(50) NULL,
    category VARCHAR(100) DEFAULT 'HOUSEKEEPING', -- HOUSEKEEPING, MAINTENANCE, ROOM_SERVICE, CONCIERGE
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'NORMAL',
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    assigned_team VARCHAR(100) DEFAULT 'HOUSEKEEPING',
    assigned_to VARCHAR(50) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 82. Hotel Automation Rules Table
CREATE TABLE IF NOT EXISTS hotel_automation_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL,
    conditions JSON NULL,
    actions JSON NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 83. Hotel AI Conversations Table
CREATE TABLE IF NOT EXISTS hotel_ai_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id VARCHAR(50) UNIQUE NOT NULL,
    channel VARCHAR(50) DEFAULT 'WEBSITE_CHAT',
    guest_identifier VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, HUMAN_HANDOFF, RESOLVED, CLOSED
    assigned_agent VARCHAR(50) NOT NULL, -- AI_RESERVATION_AGENT, AI_SUPPORT_AGENT, AI_FOLLOW_UP_AGENT
    intent VARCHAR(100) NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 84. Hotel AI Conversation Messages Table
CREATE TABLE IF NOT EXISTS hotel_ai_conversation_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    sender VARCHAR(50) NOT NULL, -- GUEST, AI_RESERVATION_AGENT, AI_SUPPORT_AGENT, AI_FOLLOW_UP_AGENT, HUMAN_AGENT
    content TEXT NOT NULL,
    intent VARCHAR(100) NULL,
    requires_human_review BOOLEAN DEFAULT FALSE,
    sources JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES hotel_ai_conversations(conversation_id) ON DELETE CASCADE
);

-- 85. Hotel AI Quotes Table
CREATE TABLE IF NOT EXISTS hotel_ai_quotes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quote_id VARCHAR(50) UNIQUE NOT NULL,
    room_type_id VARCHAR(50) NOT NULL,
    guest_id VARCHAR(50) NULL,
    nights INT DEFAULT 1,
    currency VARCHAR(10) DEFAULT 'INR',
    room_subtotal DECIMAL(12, 2) NOT NULL,
    taxes DECIMAL(12, 2) NOT NULL,
    fees DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    cancellation_policy TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CONVERTED, EXPIRED
    expires_at TIMESTAMP NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 86. Hotel AI Handoffs Table
CREATE TABLE IF NOT EXISTS hotel_ai_handoffs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    handoff_id VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(50) NOT NULL,
    assigned_role VARCHAR(50) NOT NULL, -- RESERVATION_EXECUTIVE, SUPPORT_MANAGER, DUTY_MANAGER
    reason VARCHAR(150) NOT NULL,
    summary TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'HUMAN_HANDOFF',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 87. Hotel AI Verification Sessions Table
CREATE TABLE IF NOT EXISTS hotel_ai_verification_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    guest_id VARCHAR(50) NOT NULL,
    reservation_id VARCHAR(50) NULL,
    status VARCHAR(50) DEFAULT 'CHALLENGE_ISSUED', -- CHALLENGE_ISSUED, VERIFIED, EXPIRED
    expires_at TIMESTAMP NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 88. Hotel AI Campaigns Table
CREATE TABLE IF NOT EXISTS hotel_ai_campaigns (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    campaign_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    campaign_type VARCHAR(100) DEFAULT 'QUOTE_CONVERSION', -- QUOTE_CONVERSION, PRE_ARRIVAL, POST_STAY
    channel VARCHAR(50) DEFAULT 'EMAIL',
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED
    eligible_audience_count INT NULL,
    approval_required BOOLEAN DEFAULT TRUE,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 89. Hotel AI Sequences Table
CREATE TABLE IF NOT EXISTS hotel_ai_sequences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sequence_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL, -- ENQUIRY_CREATED, QUOTE_CREATED, RESERVATION_CONFIRMED, CHECKED_OUT
    steps JSON NOT NULL,
    stop_conditions JSON NULL,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, PAUSED
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 90. Hotel AI Follow-up Executions Table
CREATE TABLE IF NOT EXISTS hotel_ai_followup_executions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    execution_id VARCHAR(50) UNIQUE NOT NULL,
    sequence_id VARCHAR(50) NULL,
    campaign_id VARCHAR(50) NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED', -- COMPLETED, FAILED, RETRYING, CANCELLED
    failure_code VARCHAR(100) NULL,
    retryable BOOLEAN DEFAULT FALSE,
    attempt_count INT DEFAULT 1,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
);


-- ===================================================================
-- AUTONOMOUS AI SUPERPOWERS: VOICE CALLS, WHATSAPP & EMAIL COPILOT
-- ===================================================================
CREATE TABLE IF NOT EXISTS voice_call_logs (
    id VARCHAR(64) PRIMARY KEY,
    lead_id VARCHAR(64),
    caller_name VARCHAR(120),
    caller_phone VARCHAR(50),
    call_role VARCHAR(50) DEFAULT 'AI_SDR',
    direction VARCHAR(20) DEFAULT 'INBOUND',
    duration_seconds INT DEFAULT 0,
    full_transcript TEXT,
    qualification_summary TEXT,
    detected_budget DOUBLE,
    sentiment VARCHAR(30) DEFAULT 'POSITIVE',
    scheduled_meeting_time VARCHAR(100),
    status VARCHAR(30) DEFAULT 'COMPLETED',
    tenant_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id VARCHAR(64) PRIMARY KEY,
    sender_phone VARCHAR(50) NOT NULL,
    sender_name VARCHAR(120),
    message_text TEXT NOT NULL,
    direction VARCHAR(20) DEFAULT 'INBOUND',
    status VARCHAR(30) DEFAULT 'RECEIVED',
    media_url VARCHAR(500),
    ai_agent_role VARCHAR(60) DEFAULT 'AI_WHATSAPP_SDR',
    tenant_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_copilot_logs (
    id VARCHAR(64) PRIMARY KEY,
    lead_id VARCHAR(64),
    recipient_email VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(120),
    subject VARCHAR(250) NOT NULL,
    body_text TEXT NOT NULL,
    inferred_sentiment VARCHAR(50) DEFAULT 'GHOSTED_7_DAYS',
    suggested_offer VARCHAR(120),
    status VARCHAR(30) DEFAULT 'AUTO_SENT',
    tenant_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- TIDB VECTOR SEARCH, KNOWLEDGE RAG, DEDUPLICATION & BILLING
-- ===================================================================

-- 1. Tenant Knowledge Base Chunks with Vector Embeddings
CREATE TABLE IF NOT EXISTS tenant_knowledge_chunks (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    content_chunk TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    embedding MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_rag (tenant_id, category)
);

-- 2. Lead Vector Signatures for Smart Deduplication & Fuzzy Matching
CREATE TABLE IF NOT EXISTS lead_vector_signatures (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    lead_id VARCHAR(64) NOT NULL,
    full_name VARCHAR(150),
    company_name VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    normalized_contact_str TEXT,
    contact_vector MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lead_sig (tenant_id, lead_id)
);

-- 3. Tenant SaaS Subscriptions & Usage Metering
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    tenant_id VARCHAR(50) PRIMARY KEY,
    plan_tier VARCHAR(50) DEFAULT 'STARTER',
    gateway VARCHAR(30) DEFAULT 'STRIPE',
    subscription_id VARCHAR(100),
    customer_id VARCHAR(100),
    seats_purchased INT DEFAULT 3,
    ai_credits_total INT DEFAULT 250,
    ai_credits_used INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    amount VARCHAR(50) DEFAULT '$29/mo',
    billing_cycle VARCHAR(30) DEFAULT 'MONTHLY',
    current_period_end TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================================================================
-- PRODUCTIVITY ACCELERATORS: PROPOSALS, CALENDAR SYNC & WORKFLOWS
-- ===================================================================

-- 4. Quotations & E-Sign Proposals
CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    deal_id VARCHAR(64),
    lead_id VARCHAR(64),
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    items_json TEXT NOT NULL,
    subtotal DOUBLE DEFAULT 0.0,
    tax_rate DOUBLE DEFAULT 18.0,
    tax_amount DOUBLE DEFAULT 0.0,
    discount_amount DOUBLE DEFAULT 0.0,
    total_amount DOUBLE DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, SENT, VIEWED, SIGNED, EXPIRED
    digital_signature_data TEXT,
    signed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_quote_tenant (tenant_id, status)
);

-- 5. User Calendar Sync Integrations (Google, Outlook, iCal)
CREATE TABLE IF NOT EXISTS calendar_sync_integrations (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    provider VARCHAR(30) DEFAULT 'GOOGLE', -- GOOGLE, OUTLOOK, ICAL
    sync_email VARCHAR(150),
    access_token TEXT,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    auto_meet_link BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cal_sync (tenant_id, user_id)
);

-- 6. Visual Workflow Definitions
CREATE TABLE IF NOT EXISTS visual_workflow_definitions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(60) NOT NULL,
    nodes_json MEDIUMTEXT NOT NULL,
    edges_json MEDIUMTEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_executions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
