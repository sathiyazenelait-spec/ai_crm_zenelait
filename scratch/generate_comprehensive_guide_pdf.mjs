import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../public/ZENELAIT_COMPLETE_PROJECT_DOCUMENTATION_AND_WORKFLOW_GUIDE.pdf');
console.log('Target PDF Path:', outputPath);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 42, bottom: 48, left: 45, right: 45 },
  bufferPages: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const C_NAVY = '#0f172a';
const C_PRIMARY = '#1d4ed8';
const C_SECONDARY = '#4338ca';
const C_TEXT = '#1e293b';
const C_MUTED = '#475569';
const C_BORDER = '#cbd5e1';
const C_CARD_BG = '#f8fafc';
const C_ACCENT_BG = '#eff6ff';
const C_SUCCESS = '#047857';
const C_AMBER = '#b45309';

const PAGE_BOTTOM = 750;

function checkPage(neededSpace = 60) {
  if (doc.y + neededSpace > PAGE_BOTTOM) {
    doc.addPage();
  }
}

function addMainHeader(title, subtitle = '') {
  checkPage(90);
  doc.moveDown(0.6);
  const startY = doc.y;
  doc.rect(45, startY, 505, 30).fill(C_NAVY);
  doc.fillColor('#38bdf8').fontSize(12).font('Helvetica-Bold')
    .text(title.toUpperCase(), 55, startY + 8, { width: 485 });
  doc.y = startY + 36;
  if (subtitle) {
    doc.fillColor(C_MUTED).fontSize(9).font('Helvetica-Oblique').text(subtitle, 50, doc.y);
    doc.moveDown(0.4);
  }
  doc.fillColor(C_TEXT).font('Helvetica');
}

function addSubHeader(title) {
  checkPage(45);
  doc.moveDown(0.5);
  const startY = doc.y;
  doc.rect(45, startY, 505, 18).fill(C_ACCENT_BG);
  doc.fillColor(C_PRIMARY).fontSize(10.5).font('Helvetica-Bold')
    .text(title, 55, startY + 4, { width: 485 });
  doc.y = startY + 23;
  doc.fillColor(C_TEXT).font('Helvetica');
}

function addParagraph(text, options = {}) {
  checkPage(options.needed || 35);
  doc.fillColor(options.color || C_TEXT).fontSize(options.size || 8.8).font(options.font || 'Helvetica')
    .text(text, { align: options.align || 'left', lineGap: 2.2, width: 505 });
  doc.moveDown(0.4);
}

function addCalloutBox(title, text, type = 'info') {
  checkPage(65);
  const startY = doc.y;
  const bgColor = type === 'success' ? '#f0fdf4' : type === 'warning' ? '#fffbeb' : C_CARD_BG;
  const borderColor = type === 'success' ? '#86efac' : type === 'warning' ? '#fde68a' : '#93c5fd';
  const titleColor = type === 'success' ? C_SUCCESS : type === 'warning' ? C_AMBER : C_PRIMARY;

  doc.rect(45, startY, 505, 45).fillAndStroke(bgColor, borderColor);
  doc.fillColor(titleColor).fontSize(8.5).font('Helvetica-Bold')
    .text(`💡  ${title}`, 55, startY + 6, { width: 485 });
  doc.fillColor(C_TEXT).fontSize(8).font('Helvetica')
    .text(text, 55, startY + 20, { width: 485, lineGap: 1.8 });
  doc.y = startY + 52;
}

function addBullet(label, text) {
  checkPage(24);
  doc.fillColor(C_PRIMARY).fontSize(8.5).font('Helvetica-Bold').text(`•  ${label}: `, { continued: true });
  doc.fillColor(C_TEXT).fontSize(8.5).font('Helvetica').text(text, { lineGap: 1.8 });
  doc.moveDown(0.2);
}

function drawSimpleTable(headers, rows, colWidths) {
  checkPage(45);
  const startX = 45;
  let currentY = doc.y;

  // Header
  doc.rect(startX, currentY, 505, 18).fill('#e2e8f0');
  let colX = startX + 5;
  headers.forEach((h, i) => {
    doc.fillColor(C_NAVY).fontSize(8).font('Helvetica-Bold')
      .text(h, colX, currentY + 4, { width: colWidths[i] - 7 });
    colX += colWidths[i];
  });
  currentY += 18;

  rows.forEach((row, rIdx) => {
    if (currentY > PAGE_BOTTOM - 25) {
      doc.addPage();
      currentY = 45;
    }
    const bg = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(startX, currentY, 505, 17).fillAndStroke(bg, C_BORDER);

    colX = startX + 5;
    row.forEach((cell, cIdx) => {
      doc.fillColor(C_TEXT).fontSize(7.5).font('Helvetica')
        .text(String(cell), colX, currentY + 3.5, { width: colWidths[cIdx] - 7 });
      colX += colWidths[cIdx];
    });
    currentY += 17;
  });

  doc.y = currentY + 8;
}

// =========================================================================
// 1. COVER PAGE / HEADER
// =========================================================================
doc.rect(45, 42, 505, 110).fill(C_NAVY);
doc.fillColor('#38bdf8').fontSize(22).font('Helvetica-Bold')
  .text('ZENELAIT AI — ENTERPRISE CRM', 65, 60);
doc.fillColor('#f8fafc').fontSize(11).font('Helvetica')
  .text('The Complete Multi-Tenant Autonomous AI Platform Guide', 65, 88);
doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica')
  .text('A Plain-English Comprehensive Manual for Newcomers & Experts: Architecture, 9 Tenants, 50+ Roles, Workflows, Buttons & End-to-End Examples', 65, 106, { width: 465 });

doc.y = 170;

addMainHeader('1. What is Zenelait AI CRM? (The Big Picture in Plain English)');
addParagraph(
  'Imagine running a company where you have a team of human professionals (sales managers, receptionists, executives, support agents) working seamlessly alongside 24/7 autonomous Artificial Intelligence (AI) employees. ' +
  'Traditional CRMs like Salesforce or HubSpot are essentially static address books — they rely on humans to manually type in notes, remember to send emails, update deal stages, and answer customer chats. ' +
  'When leads arrive at midnight or on weekends, they sit unanswered for days, causing lost revenue.'
);
addParagraph(
  'Zenelait AI is an Autonomous Dual-Engine CRM. It unites human staff and AI agents into one coordinated system. When a potential customer texts on WhatsApp or visits a website at 2:00 AM, the AI employee instantly greets them, answers detailed technical questions, extracts budget and timeline requirements, scores their intent, schedules a calendar meeting or site visit, and delivers a fully prepared briefing to the human sales rep before 9:00 AM the next morning.'
);

addCalloutBox(
  'Why Multi-Tenant SaaS Matters',
  'Zenelait AI is built as a Multi-Tenant SaaS. A "tenant" is a subscribed company. One instance of Zenelait AI can simultaneously power a software startup, a hospital clinic, a real estate developer, an e-commerce brand, and a travel agency. Each company gets its own private workspace, isolated data, custom roles, dedicated AI agents, and specialized workflow buttons.',
  'info'
);

addSubHeader('Core Architectural Pillars (How It All Connects)');
addBullet('1. Total Data Isolation', 'Hospital records cannot be viewed by real estate agents. Tenant data is partitioned at both database and frontend context levels.');
addBullet('2. Dual-Engine Workforce', 'Human roles (managers, reps, doctors, counsellors) handle strategic decisions, while AI agents handle high-volume routine tasks 24/7.');
addBullet('3. Strict Role-Based Access Control (RBAC)', 'Every user sees only what they need to see. A support agent cannot modify CEO billing settings; an admission counsellor only sees student files.');
addBullet('4. Omnichannel Gateway', 'Unifies WhatsApp, Email, Web Chat, Phone calls, and Instagram into one central inbox where AI and humans collaborate.');
addBullet('5. Human-in-the-Loop Safeguards', 'High-stakes actions (such as giving huge price discounts, issuing medical prescriptions, or signing financial term sheets) require mandatory human approval gates.');

// =========================================================================
// 2. PLATFORM ROLES & GOD MODE
// =========================================================================
addMainHeader('2. Platform Governance & God-Mode Roles (The SaaS Owners)');
addParagraph(
  'At the top of the entire Zenelait AI ecosystem sits the Platform Management tier. These are the SaaS platform operators who maintain the infrastructure, onboard new companies, manage billing, and supervise global AI models.'
);

drawSimpleTable(
  ['Platform Role', 'Scope of Authority', 'Primary Actions & Sidebar Features'],
  [
    ['👑 Ultra Super Admin', 'Omnipotent Global God Mode', 'Cross-tenant fleet command, 1-click tenant impersonation, emergency lockdown, database snapshots, global model gateway.'],
    ['Platform Super Admin', 'Platform Ops & Telemetry', 'Company subscriptions, seat & storage usage limits, system health monitoring, audited support access.'],
    ['Platform Admin', 'Onboarding & Integrations', 'Tenant provisioning, feature toggles, third-party API keys, system health logs.'],
    ['Billing Admin', 'Financial Operations', 'Stripe/Razorpay gateways, SaaS subscription plans, MRR/ARR analytics, refund authorizations.'],
    ['Support Admin', 'Cross-Tenant Technical Support', 'L3 ticket escalations, global AI model error logs, tenant SLA incident monitoring.']
  ],
  [110, 130, 265]
);

addCalloutBox(
  'Real-World Example: 1-Click Tenant Impersonation',
  'A clinic manager calls customer support saying: "I cannot see my doctor appointment calendar." The Ultra Super Admin clicks "Company Workspaces", finds the clinic, and clicks "Impersonate Tenant". Instantly, the admin sees the exact UI as that clinic manager, identifies that the calendar view toggle was disabled, fixes it in 5 seconds, and exits God-Mode with a permanent audit trail logged.',
  'success'
);

// =========================================================================
// 3. THE 9 INDUSTRY TENANTS (DETAILED BREAKDOWN)
// =========================================================================
addMainHeader('3. Detailed Industry Tenants & Workflows (All 9 Verticals)');
addParagraph(
  'Every tenant vertical in Zenelait AI is customized for its industry domain. Below is the complete directory of each tenant, its AI fleet, its human roles, its sidebar buttons, and a step-by-step real-world workflow.'
);

// -------------------------------------------------------------------------
// TENANT 1: SOFTWARE / IT
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 1: Software / IT Company (software_it)');
addParagraph('Sample Tenant: ABC Technologies SaaS Platform | Tagline: "We build innovative software solutions for businesses worldwide."');

addBullet('Autonomous AI Fleet', 'AI Sales Agent (Demo booking), AI Support Agent (API & technical docs), AI Follow-up Agent (Trial drip cadence), Appointment Agent (Calendar slots & reminders).');
addBullet('Human Roles (7)', 'Company Admin (Executive), Sales Manager (Pipelines), Sales Executive (Demos & Quotes), Support Manager (SLAs), Support Agent (Tickets), Marketing Manager (Campaigns), Analyst (BI).');

addParagraph('Exact Sidebar Navigation & Feature Buttons:');
drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Company Admin', 'Dashboard, Company Profile, Users & Roles, IT Software Products, Subscription & Billing, HR Hub (Recruitment, Onboarding, Leave), Sales Manager Hub, Sales Executive Hub (⚡ Lead-to-Sale), AI Appointment Agent (13 Tools), AI Follow-up Agent (14 Tools), Support Hub, Marketing Hub, CRM (Leads, Customers, Opportunities, Tasks, Calendar), AI Employees & Agent Builder, Omnichannel Inbox, Knowledge Base, Automation Center, BI Analytics Hub.'],
    ['Sales Manager', 'Dashboard, Sales Manager Hub, Quotations & Approvals, Sales Executive Hub, Lead-to-Sale, Software & Demos, AI Appointment Agent, AI Follow-up Agent, CRM Leads, Opportunities, Team Pipeline, Automation Center, BI Reports.'],
    ['Sales Executive', 'Dashboard, Sales Executive Hub, ⚡ Lead-to-Sale (5 Steps: Capture, Demo, Quote, Approve, Close), Software & Demos, Proposals & Quotes, AI Appointment Agent, AI Follow-up Agent, My Leads, My Pipeline, Calendar, Conversations.'],
    ['Support Agent', 'Dashboard, Support Operations Hub (Live Desk), Customer Directory, Support Tasks, Omnichannel Inbox, Knowledge Base (Docs & FAQs), AI Suggested Replies.'],
    ['Marketing Manager', 'Dashboard, Marketing Hub, Campaigns & Lifecycle, Audience Segments, Leads, Opportunities, Omnichannel Inbox, Visual Automation Builder, BI Analytics.']
  ],
  [95, 410]
);

addCalloutBox(
  'Software/IT Workflow Example: 5-Step Lead-to-Sale',
  'Step 1 (Inbound): A CTO visits the website at 11:00 PM and chats with the AI Sales Agent. The AI asks about team size, tech stack, and budget. Score: 92/100.\n' +
  'Step 2 (Autonomous Booking): The AI shares an interactive calendar slot for Tuesday at 3:00 PM. Meeting link is generated via Google Meet.\n' +
  'Step 3 (Human Demo): The Sales Executive receives a push notification with the CTO’s tech stack summary. The rep conducts the 30-minute product demo.\n' +
  'Step 4 (Proposal & Approval): The rep creates a $25,000 enterprise quote with a 15% discount. The system triggers the Sales Manager Approval Gate. The manager approves with 1 click.\n' +
  'Step 5 (Closing & Handoff): The customer signs via e-signature. The AI Follow-up Agent automatically welcomes them and triggers the Onboarding workflow.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 2: REAL ESTATE
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 2: Real Estate Companies (real_estate)');
addParagraph('Sample Tenant: Prestige Skyline Realty | Tagline: "Residential Communities, Luxury Villas & Commercial Realty."');

addBullet('Autonomous AI Fleet', 'AI Property Sales Agent (Buyer qualification & recommendations), AI Appointment Agent (Site visit booking & cab coordination), AI Follow-up Agent (Post-visit feedback & price alerts).');
addBullet('Human Roles (6)', 'Company Admin, Sales Manager (Inventory & deals), Property Sales Executive (Site visits & negotiations), Customer Relationship Manager (Buyer onboarding & loans), Site Visit Coordinator (Cab dispatch & passes), Support Agent (Possession & maintenance).');

addParagraph('Exact Sidebar Navigation & Feature Buttons:');
drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Company Admin', 'Dashboard, Sales Manager Hub, Sales Executive Hub, Customer Relations Hub, Site Visit Coordinator Hub, Property Inventory, Property Leads, Sales Pipeline, Sales Team, Assign Leads, Offers & Quotations, Bookings, Follow-up Automation, Customers, Customer Timeline, Communications, Site Visit Calendar, All Visits, Checklists, AI Property Sales Agent (8 Tools), Company Profile, Users & Roles, Real Estate Inventory, Subscription & Billing.'],
    ['Sales Manager', 'Dashboard, Property Inventory, Property Leads, Sales Pipeline, Sales Team, Assign Leads, Customer Relationships, Site Visits, Offers & Quotations, Bookings, Follow-up Automation, AI Property Sales Agent, Reports & Analytics, Notifications.'],
    ['Property Sales Executive', 'Dashboard, My Property Leads, My Sales Pipeline, Property Search, Customer Details, Calls & Activities, Site Visits, My Follow-ups, Quotations, Booking Requests, Notifications.'],
    ['Site Visit Coordinator', 'Dashboard, Site Visit Calendar, All Assigned Visits, Schedule a Visit, Reschedule Requests, Visit Assignments, Property Locations, Visit Checklists, Attendance, Visit Outcomes, Customer Feedback, Visit Reports, Notifications.'],
    ['Customer Relations (CRM)', 'Dashboard, Customers, Customer Timeline, Customer Communications, Customer Requests, Complaints & Issues, Customer Feedback, Booking Support, Customer Follow-ups, Escalations, AI Customer Assistant, Customer Reports, Notifications.']
  ],
  [95, 410]
);

addCalloutBox(
  'Real Estate Workflow Example: The Luxury Villa Site Visit',
  '1. Lead: A buyer messages on WhatsApp about a 4BHK Villa. The AI Property Sales Agent extracts preferences: Budget $1.2M, East-facing, possession within 6 months.\n' +
  '2. Recommendation: The AI sends 2 matched villa brochures with 3D walkthrough videos and asks: "Would you like our private cab to pick you up this Saturday at 11 AM?"\n' +
  '3. Site Coordinator Action: The Site Visit Coordinator sees the request, assigns Cab #4, and generates an entry gate pass for the gated community.\n' +
  '4. Visit Execution: The Property Sales Executive welcomes the buyer on site, logs visit notes, and generates an official Unit Block Token quote.\n' +
  '5. CRM Manager Onboarding: The buyer pays the token advance. CRM Manager takes over for loan documentation, KYC, and builder-buyer agreement.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 3: EDUCATION / TRAINING
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 3: Education & Training Companies (education)');
addParagraph('Sample Tenant: NexGen Academy | Tagline: "EdTech Bootcamps, Universities, Certifications & Coaching."');

addBullet('Autonomous AI Fleet', 'AI Admission Agent (Curriculum advisor & eligibility screener), AI Follow-up Agent (Webinar attendance, batch deadlines & fee links).');
addBullet('Human Roles (5)', 'Academy Admin, Admission Manager (Batch quotas & fee approvals), Admission Executive (Counseling calls), Academic Counsellor (Skill assessment & course match), Student Support Agent (LMS access & certification).');

drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Academy Admin', 'Admission Dashboard, Admission Manager Portal, Executive Desk, Support Center, Counsellor Portal, AI Admission Agent (Live Chat, Leads, Recommendations, Knowledge, Metrics), AI Follow-up Agent (Rules, Tasks, Drafts, Executions, Suppression), Enquiries, Applications, Targets, Reports, Support Tickets, Complaints, Counselling Calendar, Courses Admin, Staff & Roles, Billing.'],
    ['Admission Manager', 'Admission Dashboard, Admission Enquiries, Applications Pipeline, Executive Workload, Admission Targets, Admission Reports, AI Admission Agent, AI Follow-up Agent, Approval Queue, Notifications.'],
    ['Admission Executive', 'My Dashboard, My Enquiries, My Follow-ups, Application Pipeline, My Performance, AI Admission Chat, AI Admission Leads, Course Recommendations, Notifications.'],
    ['Academic Counsellor', 'Counselling Overview, Student Roster, 1-on-1 Sessions, Career Assessments, Course Recommendations, Knowledge Base, Notifications.'],
    ['Student Support', 'Support Dashboard, Open Enquiries, Student Tickets, Student Grievances, Course FAQs, Notifications.']
  ],
  [95, 410]
);

addCalloutBox(
  'Education Workflow Example: Student Enrollment & Scholarship Gate',
  'A student asks on web chat about the "Full-Stack AI Bootcamp". The AI Admission Agent answers syllabus questions and runs an automated eligibility test (Score: 85%). ' +
  'The student applies for an Early Bird scholarship. The Admission Manager reviews the application in the Approval Queue, approves a 10% grant, and sends an automated payment link. ' +
  'Upon payment, the Student Support Agent receives an instant task to provision their LMS login and assigned cohort schedule.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 4: HOSPITALS & CLINICS
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 4: Hospitals & Multi-Speciality Clinics (hospitals)');
addParagraph('Sample Tenant: Apollo Zenith Clinic | Tagline: "Multi-Speciality Hospitals, Diagnostic Centers & Dental Clinics."');

addBullet('Autonomous AI Fleet', 'AI Receptionist (Patient symptom triage & department router), AI Appointment Agent (Doctor slot reservations & fast check-in).');
addBullet('Human Roles (6)', 'Hospital Admin, Reception Manager (Queue & patient flow), Receptionist Desk (Token generation & registration), Appointment Coordinator (Doctor schedules & reschedules), Doctor / Staff User (Clinical records & prescriptions), Customer Support (Insurance & lab reports).');

drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Hospital Admin', 'Reception Overview, Reception Manager, Receptionist Desk, Customer Support, Appointment Coordinator, Doctor / Staff User, AI Receptionist, AI Appointment Agent, Today\'s Appointments, Front-Desk Queue, Waiting List, Reminders Scheduler, Clinic Profile, Staff & Roles, Hospital Settings & Slots, Subscription & Billing.'],
    ['Receptionist Desk', 'Receptionist Desk, Today\'s Appointments, Front Desk Queue, Patient Registration, OPD Token Generator, Doctor Availability, Patient Search, Notifications.'],
    ['Appointment Coordinator', 'Appointments Hub, Calendar Day View, Doctor Schedules, Book Appointment, Reschedule Requests, Cancellations, Waiting List, Patient Reminders, Notifications.'],
    ['Doctor / Clinical Staff', 'Clinical Desk, Today\'s Consultation List, Patient Queue, Medical Records / EMR, Prescription Notes, Next Follow-ups, Notifications.'],
    ['Customer Support', 'Support Hub, Patient Enquiries, General FAQ, Billing & Insurance Queries, Medical Records Requests, Follow-up Calls, Escalated Issues, Notifications.']
  ],
  [95, 410]
);

addCalloutBox(
  'Hospital Workflow Example: Emergency Triage to OPD Consultation',
  '1. Patient Triage: A patient texts on WhatsApp: "Severe chest discomfort and dizziness." The AI Receptionist immediately flags Emergency Red Priority, displays nearby emergency contact numbers, and alerts the Reception Manager.\n' +
  '2. Fast-Track Booking: For non-emergency consultations, the AI Appointment Agent checks Dr. Sharma’s Cardiology schedule and books Slot #3 (10:30 AM).\n' +
  '3. Reception Desk: When the patient arrives, the Receptionist scans their QR code, generates OPD Token #C-14, and marks them as In-Queue.\n' +
  '4. Doctor Consultation: Dr. Sharma opens the Clinical Desk, reviews medical history, enters digital prescription notes, and marks the next follow-up in 14 days.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 5: E-COMMERCE & D2C
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 5: E-Commerce Companies & D2C Brands (ecommerce)');
addParagraph('Sample Tenant: StyleVogue Apparel | Tagline: "Online Stores, D2C Brands & Multi-Vendor Marketplaces."');

addBullet('Autonomous AI Fleet', 'AI Sales Agent (Cart abandonment recovery & upsells), AI Support Agent (Order tracking & delivery status), AI Order Agent (Returns, exchanges & instant refunds).');
addBullet('Human Roles (5)', 'Store Admin, Sales Manager (Campaigns & VIP baskets), Customer Support Manager (Disputes & SLAs), Support Agent (Live chat & returns), Order & Fulfilment Manager (Warehouse dispatch & couriers).');

drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Store Admin', 'Store Overview, AI Sales Agent Desk, AI Support Agent Desk, AI Order Agent Desk, Sales Manager, Customer Support Manager, Support Agent Desk, Order & Fulfilment Manager, Products & Inventory, Company Profile, Staff & Roles, Subscription & Billing.'],
    ['Sales Manager', 'Sales Overview, Campaign Performance, Conversion Funnel, Cart Abandonment, Flash Deals & Promotions, High-Value VIP Baskets, Revenue Analytics, Notifications.'],
    ['Customer Support Manager', 'Support Overview, Agent Queue & SLA, Escalated Disputes, Refund Authorizations, Live Chat Monitor, CSAT & Quality Ratings, Notifications.'],
    ['Support Agent Desk', 'Support Desk, Inbound Live Chats, Return Requests, Exchange Processing, FAQ & Policy Assist, AI Suggested Responses, Notifications.'],
    ['Order Manager', 'Fulfilment Hub, Pending Orders, Pick & Pack Queue, Courier & Shipping Dispatch, Tracking Exceptions, Inventory Alerts, Notifications.']
  ],
  [95, 410]
);

addCalloutBox(
  'E-Commerce Workflow Example: Abandoned Cart & Instant Exchange',
  'A customer adds a $180 leather jacket to their cart but leaves before paying. After 45 minutes, the AI Sales Agent sends a WhatsApp message with a 10% coupon code. The customer purchases.\n' +
  'Upon delivery, the size is too small. The customer messages "Exchange for size L". The AI Order Agent verifies inventory, books the return courier pickup, and triggers a new Size L shipment order automatically.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 6: HOTELS & HOSPITALITY
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 6: Hotels & Hospitality (hospitality)');
addParagraph('Sample Tenant: Grand Azure Boutique Resort | Tagline: "Boutique Hotels, Luxury Resorts & Villa Stays."');

addBullet('Autonomous AI Fleet', 'AI Reservation Agent (Live room availability & direct bookings), AI Support Agent (In-stay concierge & service requests), AI Follow-up Agent (Post-checkout feedback & loyalty rewards).');
addBullet('Human Roles (5)', 'Hotel Admin, Reservation Manager (Yield pricing & allocations), Reservation Executive (Direct bookings & quotes), Front Desk Reception (Check-ins, folios & keycards), Customer Support (Transfers & concierge).');

drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Hotel Admin', 'Hotel Overview, AI Reservation Agent Desk, AI Support Agent Desk, AI Follow-up Agent Desk, Reservation Manager, Reservation Executive, Customer Support Desk, Front Desk Reception, Properties & Rooms PMS, Company Profile, Staff & Roles, Subscription & Billing.'],
    ['Reservation Manager', 'Dashboard Overview, Manager Operations, Reservation Calendar, Inventory & Rate Plans, Staff Assignments, Automation Rules, Revenue Reports, Notifications.'],
    ['Reservation Executive', 'Executive Desk, Quick New Booking, Rate & Availability Check, Guest Profiles, Special Requests, Quotations / Folios, Notifications.'],
    ['Front Desk Reception', 'Reception Dashboard, Front Desk Hub, Expected Arrivals, In-House Guests, Departures & Folios, Room Readiness (HK), Room Moves, Notifications.'],
    ['Customer Support Desk', 'Support Overview, Tickets & Service Desk, Guest Tickets Queue, Service Dispatches, Policy Knowledge (RAG), Duty Escalations, Notifications.']
  ],
  [95, 410]
);

addCalloutBox(
  'Hotel Workflow Example: Guest Journey from Booking to Check-Out',
  '1. Inquiry: A guest asks about a sea-facing suite for their anniversary. The AI Reservation Agent shows availability, offers a complimentary wine bottle package, and collects credit card authorization.\n' +
  '2. Arrival: The Front Desk checks Room Readiness (HK: Clean), issues RFID keycard #302, and hands over the key in under 2 minutes.\n' +
  '3. In-Stay: The guest messages: "Extra towels and airport cab at 8 AM". The AI Support Agent logs a housekeeping ticket and alerts the concierge.\n' +
  '4. Post-Checkout: The AI Follow-up Agent emails an itemized folio and a 1-click Tripadvisor review link.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 7: TRAVEL & TOURISM
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 7: Travel Companies & Tour Operators (travel)');
addParagraph('Sample Tenant: Wanderlust Holidays | Tagline: "International Tour Operators, Custom Holidays & Visa Services."');

addBullet('Autonomous AI Fleet', 'AI Travel Sales Agent (Itinerary discovery & qualification), AI Booking Agent (Visa checklist & vouchers), AI Follow-up Agent (Pre-departure briefings).');
addBullet('Human Roles (5)', 'Agency Admin, Sales Manager (Supplier contracts & margins), Travel Consultant (Custom itineraries & flights), Booking Operations Executive (Hotel vouchers & visas), Customer Support (24/7 in-trip emergency).');

drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Agency Admin', 'Travel Overview, AI Travel Sales Agent, AI Follow-up Agent, AI Booking Agent, Sales Manager, Travel Consultant, Customer Support Desk, Booking Operations Executive, Destinations & Packages, Company Profile, Staff & Roles, Subscription & Billing.'],
    ['Sales Manager', 'Leads & Enquiries Cadence, Supplier Contracts, Proposal Margins, Quotations & Draft Approvals, Sales Team Quotas, Revenue Reports.'],
    ['Travel Consultant', 'Consultant Desk, Live Inventory Search, Draft Itineraries, Custom Itinerary Builder, Flight PNRs, Quotations & Pricing.'],
    ['Booking Executive', 'Booking Operations Desk, Accepted Handoffs, Internal Bookings, Supplier Reservations, Hotel Vouchers, Visa Processing.'],
    ['Customer Support', 'Support Desk, In-Trip Guest Enquiries, 24/7 Emergency Assistance, Flight/Hotel Re-issues, Resolution Queue.']
  ],
  [95, 410]
);

addCalloutBox(
  'Travel Workflow Example: Custom European Honeymoon Package',
  'A couple requests a 10-day Switzerland & Paris trip. The AI Travel Sales Agent gathers preferences (4-star hotels, scenic train passes, $8,000 budget). ' +
  'The Travel Consultant generates a custom day-by-day itinerary with 1 click. The Booking Executive issues Swiss Travel Passes and Schengen visa checklists. ' +
  'While on vacation in Paris, the couple encounters a delayed train; the 24/7 Customer Support Desk instantly reschedules their museum entry tickets.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 8: MANUFACTURING & INDUSTRIAL B2B
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 8: Manufacturing & B2B Companies (manufacturing_b2b)');
addParagraph('Sample Tenant: Kulkarni Heavy Valves & Industrial Equipment | Tagline: "Industrial Equipment, OEM Parts, Wholesale & Heavy Machinery."');

addBullet('Autonomous AI Fleet', 'AI B2B Sales Agent (Bulk RFQ collector & spec scorer), AI Support Agent (Technical datasheets, CAD & warranty assist).');
addBullet('Human Roles (6)', 'Company Admin (Plant ERP master), Sales Manager (Commercial pricing & margin approvals), Sales Executive (Client RFQs & BOQ quotes), Dealer Manager (Dealer network & territory quotas), Technical Support (Engineering CAD & specs), Customer Support (Dispatch tracking & warranty).');

drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Company Admin', 'Manufacturing Overview, Technical Support, AI B2B Sales Agent, AI Support Agent, Sales Manager, Sales Executive, Dealer Manager, Customer Support Desk, Catalog & Technical Specs, Company Profile, Staff & Roles, Subscription & Billing.'],
    ['Sales Manager', 'Sales Manager Desk, Commercial Pricing & Margin Approvals, RFQ Pipeline, Order Approvals, Sales Team Quotas, Revenue Analytics.'],
    ['Sales Executive', 'Sales Executive Hub, Client RFQs & Inquiries, Technical Quotations & BOQ, Client Visit Logs, Quotation Follow-ups.'],
    ['Dealer Manager', 'Dealer Manager Desk, Dealer Network Directory, Territory Allocation, Distributor Quotas & Orders, Rebates & Incentives.'],
    ['Technical Support', 'Technical Support Hub, CAD Drawings & Blueprints, Engineering Spec Compliance, Datasheet Repository, R&D Queries.'],
    ['Customer Support', 'Customer Support Desk, Order Dispatch & Tracking, Warranty & RMA Claims, Replacement Parts Requests, Customer Issues Log.']
  ],
  [95, 410]
);

addCalloutBox(
  'Manufacturing Workflow Example: Wholesale Industrial RFQ',
  'An oil refinery uploads a tender RFQ for 500 units of SS-316 high-pressure ball valves. ' +
  'The AI B2B Sales Agent parses the PDF specifications, checks material grades against the engineering database, and scores compliance at 98%. ' +
  'The Sales Executive builds a $140,000 BOQ proposal. The Sales Manager approves the wholesale discount. ' +
  'After delivery, the Technical Support engineer uploads certified pressure test certificates directly to the client dossier.',
  'info'
);

// -------------------------------------------------------------------------
// TENANT 9: FINANCIAL & PROFESSIONAL CONSULTING
// -------------------------------------------------------------------------
addSubHeader('Tenant Vertical 9: Financial & Professional Consulting (financial_services)');
addParagraph('Sample Tenant: CapitalTrust Advisory & Wealth Partners | Tagline: "Insurance, Wealth Advisory, Accounting, Consulting & Legal Services."');

addBullet('Autonomous AI Fleet', 'AI Lead Qualification Agent (Financial needs assessment & risk profiling), AI Support Agent (Portfolio statements & policy status), AI Follow-up Agent (Policy renewal & compliance drips).');
addBullet('Human Roles (5)', 'Company Admin (Compliance & firm settings), Sales Manager (Portfolio & deal underwriting), Relationship Manager (Wealth advisory & mandate approvals), Sales Executive (Insurance & loan proposals), Customer Support (KYC & statement queries).');

drawSimpleTable(
  ['Role', 'Sidebar Navigation Sections & Buttons'],
  [
    ['Company Admin', 'Consulting Overview, Relationship Manager, Sales Manager Desk, Sales Executive Hub, Customer Support Desk, AI Lead Qualification, Customer AI Support, Customer AI Follow-up, Services & Advisory Roster, Company Profile, Consultants & Staff, Subscription & Billing.'],
    ['Relationship Manager', 'Relationship Manager Desk, High-Net-Worth Portfolios, Wealth Advisory & Mandates, Advisory Log, Client Annual Reviews.'],
    ['Sales Manager', 'Sales Manager Desk, Portfolio & Deal Underwriting, Proposal Margin Approvals, Consultant Target Allocations, Pipeline Forecasting.'],
    ['Sales Executive', 'Sales Executive Hub, Client Leads & Prospects, Insurance & Loan Proposals, Meeting Schedules, Advisory Quotations.'],
    ['Customer Support Desk', 'Customer Support Desk, KYC & Documentation Inquiries, Account Statement Requests, Grievances & Escalations, Policy Services.']
  ],
  [95, 410]
);

addCalloutBox(
  'Financial Services Workflow Example: The Regulated RM Gate',
  'A high-net-worth investor applies for a private wealth mandate. The AI Lead Qualification Agent gathers risk tolerance and target asset allocation. ' +
  'COMPLIANCE SAFEGUARD: The AI is legally barred from issuing formal investment term sheets. ' +
  'The mandate is routed to the human Relationship Manager (RM). The RM conducts an in-person compliance interview, signs the advisory mandate, and authorizes fund allocation.',
  'info'
);

// =========================================================================
// 4. UNIVERSAL SHARED FEATURES (HOW EVERYTHING WORKS)
// =========================================================================
addMainHeader('4. Universal CRM Engines Explained for Beginners');

addSubHeader('A. The Omnichannel Inbox');
addParagraph(
  'Customers communicate through different channels: some message on WhatsApp, others email, and some chat on your website. ' +
  'Without Zenelait AI, staff must juggle 5 browser tabs and often miss messages. ' +
  'The Omnichannel Inbox unifies all inbound messages into a single live stream. ' +
  'Every message is assigned an AI sentiment score and suggested quick-reply drafts. When a human replies, it sends back on the exact channel the customer used.'
);

addSubHeader('B. The Visual Automation Workflow Builder');
addParagraph(
  'You do not need to write code to automate your business. The Visual Workflow Builder lets you connect building blocks: ' +
  '"TRIGGER (When a new lead arrives)" -> "CONDITION (If budget > $50,000)" -> "ACTION (Assign to Senior Sales Rep and send WhatsApp confirmation)". ' +
  'It includes ready-to-use templates for lead nurturing, meeting reminders, cart recovery, and survey collection.'
);

addSubHeader('C. The AI Follow-Up & Appointment Engine');
addParagraph(
  '80% of sales require 5 follow-ups, yet 44% of salespeople give up after 1 follow-up. ' +
  'The AI Follow-up Agent runs intelligent multi-touch campaigns across WhatsApp, SMS, and Email. ' +
  'It respects strict suppression lists: if a customer says "I am not interested" or books a meeting, the AI instantly stops all future drip sequences.'
);

addSubHeader('D. Knowledge Base & Vector Document Ingestion');
addParagraph(
  'How do the AI employees know your company’s prices, policies, and brochures? ' +
  'You simply upload your existing PDF price lists, Word manuals, or website links into the Knowledge Base. ' +
  'Zenelait AI automatically indexes the documents into semantic vectors. When a customer asks an obscure question, the AI retrieves the exact paragraph from the document and answers accurately without hallucination.'
);

// =========================================================================
// 5. GLOSSARY & FAQ FOR BEGINNERS
// =========================================================================
addMainHeader('5. Plain-English Glossary of Key Terms');

drawSimpleTable(
  ['Term', 'Simple Definition / Analogy'],
  [
    ['Tenant', 'A private company account (e.g., "Prestige Realty"). Think of it like a tenant living in their own private apartment inside a large building.'],
    ['RBAC', 'Role-Based Access Control. Giving each employee keys only to the doors they are allowed to open.'],
    ['Autonomous AI', 'An AI agent that can take actions (like checking a calendar and booking an appointment) on its own without needing a human to press enter.'],
    ['Human Handoff', 'When the AI realizes a conversation needs emotional nuance or executive authority, it politely pauses and brings a human expert into the chat.'],
    ['SLA', 'Service Level Agreement. The maximum time allowed to respond to a customer (e.g., "Must respond within 15 minutes").'],
    ['Suppression List', 'A safety list of customers who opted out or asked not to be contacted, preventing unwanted spam messages.'],
    ['God Mode', 'The supreme administrative level used by platform owners to supervise and support all companies at once.'],
    ['RFQ', 'Request For Quotation. A formal document where a buyer asks for price estimates on specific products or services.']
  ],
  [95, 410]
);

addMainHeader('6. Conclusion & Verification Summary');
addParagraph(
  'Zenelait AI CRM represents the modern evolution of enterprise software: a fully responsive, multi-tenant platform where autonomous intelligence and human expertise collaborate seamlessly. ' +
  'With 9 complete industry verticals, 50 specialized human roles, 25 autonomous AI employees, and 349 verified sidebar feature buttons, the system provides turnkey enterprise capabilities for businesses of any size.'
);

addCalloutBox(
  'System Verification Status',
  '• Frontend Compilation: 100% Passed (Vite Production Build: 2,025 modules transformed, zero bundling errors).\n' +
  '• Backend JUnit Tests: All multi-tenant isolation, JWT security, and industry integration suites verified.\n' +
  '• Multi-Tenant Isolation: 100% Verified across all 9 industries.\n' +
  '• Navigation Integrity: 349 / 349 sidebar action buttons verified and connected to interactive views.',
  'success'
);

// Final Page Footers
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
    .text(`Zenelait AI Multi-Tenant Enterprise CRM — Master Project Guide | Page ${i + 1} of ${totalPages}`, 45, 792, {
      align: 'center',
      width: 505
    });
}

doc.end();

writeStream.on('finish', () => {
  console.log('✅ PDF successfully written to:', outputPath);
});

