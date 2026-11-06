// ============================================================================
// ZENELAIT AI CRM - 9 TENANT-WISE AUTONOMOUS AI EMPLOYEE FLEETS & WORK QUEUES
// ============================================================================

export const TENANT_AI_EMPLOYEES_MAP = {
  // --------------------------------------------------------------------------
  // 1. SOFTWARE & IT VERTICAL (TEN-IT-001)
  // --------------------------------------------------------------------------
  software_it: [
    {
      id: 'emp-it-1',
      code: 'SDR_ARIA',
      name: 'Aria Sharma',
      avatar: '🤖',
      role: 'Senior Inbound SDR & Lead Qualification Executive',
      roleCategory: 'SALES_SDR',
      department: 'Sales & Business Development',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet + Gemini 1.5 Pro',
      shiftHours: '24/7 Continuous Autonomous Shift',
      workingHoursLabel: 'Always Active (Avg Response <30s)',
      hourlyRateEquivalent: '₹120/hr equivalent',
      experienceYears: 'AI Tier 4 (1.4M B2B Sales Conversations)',
      accuracyScore: '98.8%',
      tasksCompletedToday: 38,
      pipelineGeneratedToday: '₹8,50,000',
      avgResponseSpeed: '0.7s',
      color: '#3b82f6',
      accentLight: 'rgba(59, 130, 246, 0.12)',
      bio: 'Autonomous SDR executing immediate inbound qualification, BANT scoring, company enrichment, and scheduling high-intent demos for Account Executives.',
      guardrails: [
        'Strict SOC2 & Indian DPDP Data Privacy Enforcement',
        'No discounts >15% without VP Sales sign-off',
        'Instant human handoff if sentiment drops below -0.4'
      ],
      capabilities: [
        { name: 'BANT Lead Scoring', desc: 'Evaluates Budget, Authority, Need, and Timeline against ICP.' },
        { name: 'Instant Inbound Triage', desc: 'Greets and engages website visitors and inbound forms within 15 seconds.' },
        { name: 'CRM Pipeline Push', desc: 'Directly creates and qualifies CRM leads, updating deal values and stages.' },
        { name: 'Enrichment Engine', desc: 'Extracts company size, tech stack, and LinkedIn profiles autonomously.' }
      ]
    },
    {
      id: 'emp-it-2',
      code: 'SUPPORT_KAVITA',
      name: 'Kavita Rao',
      avatar: '🎧',
      role: 'L1/L2 Technical Support & Ticket Resolution Specialist',
      roleCategory: 'CUSTOMER_SUPPORT',
      department: 'Customer Experience & Success',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'GPT-4o + Custom Technical Knowledge Embeddings',
      shiftHours: '24/7 Autonomous Shift',
      workingHoursLabel: 'Round-the-Clock Desk (SLA: 30m response / 2h resolution)',
      hourlyRateEquivalent: '₹110/hr equivalent',
      experienceYears: 'AI Tier 4 (85,000 Support Tickets & API Specs)',
      accuracyScore: '97.9%',
      tasksCompletedToday: 48,
      pipelineGeneratedToday: '₹0 (CSAT: 4.92 / 5.0)',
      avgResponseSpeed: '0.9s',
      color: '#06b6d4',
      accentLight: 'rgba(6, 182, 212, 0.12)',
      bio: 'Dedicated autonomous support engineer handling incident triage, knowledge-base retrieval, API troubleshooting, automated issue resolution, and CSAT tracking.',
      guardrails: [
        'Never reveal database connection strings or internal API keys',
        'Refund requests >₹5,000 routed directly to Support Director',
        'Automatic engineering escalation if recurring error signature detected'
      ],
      capabilities: [
        { name: 'Semantic KB Search', desc: 'Matches customer queries against internal technical docs & release notes.' },
        { name: 'API Diagnostics', desc: 'Explains webhook payloads, OAuth token expirations, and JSON errors.' },
        { name: 'One-Click Auto-Resolve', desc: 'Closes validated tickets with verified resolution steps and audit notes.' }
      ]
    },
    {
      id: 'emp-it-3',
      code: 'FOLLOWUP_VIKRAM',
      name: 'Vikram Singh',
      avatar: '🎯',
      role: 'Autonomous Pipeline Nurture & Deal Recovery Specialist',
      roleCategory: 'PIPELINE_NURTURE',
      department: 'Revenue Operations & Growth',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet (Conversational Nurture Engine)',
      shiftHours: '09:00 AM - 08:00 PM (Respects Quiet Hours)',
      workingHoursLabel: 'Business Hours Cadence (Strict TRAI / DND Compliance)',
      hourlyRateEquivalent: '₹130/hr equivalent',
      experienceYears: 'AI Tier 4 (620,000 Multi-Touch Nurture Sequences)',
      accuracyScore: '96.5%',
      tasksCompletedToday: 52,
      pipelineGeneratedToday: '₹14,50,000',
      avgResponseSpeed: '1.1s',
      color: '#10b981',
      accentLight: 'rgba(16, 185, 129, 0.12)',
      bio: 'Multi-channel outbound specialist executing timed drip sequences across WhatsApp, Email, and SMS to revive stalled opportunities and overcome commercial objections.',
      guardrails: [
        'Never message customers before 09:00 AM or after 08:00 PM local time',
        'Immediate suppression upon receiving STOP, UNSUBSCRIBE, or DO NOT CONTACT',
        'Max 3 automated follow-up attempts per stage without human approval'
      ],
      capabilities: [
        { name: 'Multi-Touch Drips', desc: 'Orchestrates Day 1 WhatsApp, Day 3 Email, and Day 7 SMS re-engagement.' },
        { name: 'Objection Overcomer', desc: 'Addresses common pricing, timeline, and migration hesitations smoothly.' },
        { name: 'Stalled Deal Re-activator', desc: 'Scans CRM for deals inactive >10 days and sends value-added check-ins.' }
      ]
    },
    {
      id: 'emp-it-4',
      code: 'APPOINTMENT_ELENA',
      name: 'Elena Das',
      avatar: '📅',
      role: 'Executive Demo Booking & Calendar Coordinator',
      roleCategory: 'APPOINTMENTS',
      department: 'Sales Enablement & Logistics',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Gemini 1.5 Pro (Timezone & Calendar Reasoning)',
      shiftHours: '24/7 Real-Time Availability',
      workingHoursLabel: 'Round-the-Clock Time Slot Coordinator',
      hourlyRateEquivalent: '₹105/hr equivalent',
      experienceYears: 'AI Tier 4 (Managed over 42,000 Calendar Appointments)',
      accuracyScore: '99.2%',
      tasksCompletedToday: 26,
      pipelineGeneratedToday: '₹6,20,000',
      avgResponseSpeed: '0.6s',
      color: '#8b5cf6',
      accentLight: 'rgba(139, 92, 246, 0.12)',
      bio: 'High-precision scheduling coordinator handling calendar invites, timezone calculations, conflict resolution, Google Meet/Zoom video links, and pre-meeting reminder sequences.',
      guardrails: [
        'Minimum 2-hour buffer between consecutive executive sales demos',
        'Ensure account executive calendar availability is verified in real-time',
        'Always include agenda and discovery notes inside Google Meet invite body'
      ],
      capabilities: [
        { name: 'Conversational Booking', desc: 'Finds mutually convenient meeting times in under 2 conversational turns.' },
        { name: '2-Way Calendar Sync', desc: 'Reads and writes events to Google Calendar and Outlook in real time.' },
        { name: 'Meeting Link Generation', desc: 'Auto-provisions Google Meet or Zoom conferencing URLs with dial-in codes.' }
      ]
    },
    {
      id: 'emp-it-5',
      code: 'REVOPS_MARCUS',
      name: 'Marcus Chen',
      avatar: '📈',
      role: 'Revenue Operations & Fleet Intelligence Analyst',
      roleCategory: 'REVOPS_ANALYTICS',
      department: 'Executive Office & Strategic Growth',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet + Custom CRM Vector Mesh',
      shiftHours: 'Continuous Real-Time Auditing',
      workingHoursLabel: '24/7 Strategic Monitoring & EOD Executive Briefings',
      hourlyRateEquivalent: '₹180/hr equivalent',
      experienceYears: 'AI Tier 4 (Financial & Pipeline Modeling Specialist)',
      accuracyScore: '99.4%',
      tasksCompletedToday: 18,
      pipelineGeneratedToday: '₹22,00,000',
      avgResponseSpeed: '1.4s',
      color: '#f59e0b',
      accentLight: 'rgba(245, 158, 11, 0.12)',
      bio: 'Autonomous executive intelligence analyst that audits pipeline velocity, spots deal-closing bottlenecks, flags high-churn risks, and compiles daily End-of-Day shift performance briefings for management.',
      guardrails: [
        'Strict read-only access to payroll and equity data',
        'Flag deal anomalies exceeding 50% deviation from historical averages',
        'Deliver daily executive summary to CXO inbox at 07:00 PM IST sharp'
      ],
      capabilities: [
        { name: 'Pipeline Bottleneck Detection', desc: 'Highlights opportunities stuck in Discovery or Proposal stages.' },
        { name: 'Win-Rate Forecasting', desc: 'Computes predictive closing odds based on buyer engagement signals.' },
        { name: 'End-of-Day Shift Briefing', desc: 'Synthesizes all fleet actions, won revenue, and unresolved bottlenecks.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 2. REAL ESTATE & PROPERTY VERTICAL (TEN-RE-002)
  // --------------------------------------------------------------------------
  real_estate: [
    {
      id: 'emp-re-1',
      code: 'RE_SDR_ROHAN',
      name: 'Rohan Varma',
      avatar: '🏡',
      role: 'Property Matchmaker & Buyer Qualification Executive',
      roleCategory: 'SALES_SDR',
      department: 'Residential & Commercial Sales',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet + Real Estate Vector Store',
      shiftHours: '24/7 Autonomous Buyer Triage',
      workingHoursLabel: 'Instant Lead Qualification (<20s)',
      hourlyRateEquivalent: '₹140/hr equivalent',
      experienceYears: 'AI Tier 4 (Trained on 450,000 Property Inquiries)',
      accuracyScore: '98.5%',
      tasksCompletedToday: 42,
      pipelineGeneratedToday: '₹4,80,00,000',
      avgResponseSpeed: '0.8s',
      color: '#06b6d4',
      accentLight: 'rgba(6, 182, 212, 0.12)',
      bio: 'Matches inbound property seekers with available inventory based on budget, BHK configuration, preferred micromarkets, and ready-to-move timelines.',
      guardrails: [
        'Strict RERA registration compliance on all unit quotations',
        'Never disclose seller distress sale margins without Sales Director consent',
        'Auto-escalate buyer inquiries exceeding ₹5 Crore to Senior Partner'
      ],
      capabilities: [
        { name: 'Inventory Matching', desc: 'Filters 1,200+ property listings by carpet area, facing, and budget in 0.5s.' },
        { name: 'BHK & Budget Triage', desc: 'Validates buyer loan pre-approval and down-payment readiness.' },
        { name: 'Digital Brochure Push', desc: 'Delivers high-resolution floor plans and price sheets via WhatsApp.' }
      ]
    },
    {
      id: 'emp-re-2',
      code: 'RE_SITE_ANANYA',
      name: 'Ananya Sen',
      avatar: '🚗',
      role: 'Site Visit & Cab Dispatch Coordinator',
      roleCategory: 'APPOINTMENTS',
      department: 'Site Operations & Logistics',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Gemini 1.5 Pro (Location & Scheduling)',
      shiftHours: '08:00 AM - 08:00 PM Active Dispatch',
      workingHoursLabel: 'Real-Time Weekend Site Visit Desk',
      hourlyRateEquivalent: '₹115/hr equivalent',
      experienceYears: 'AI Tier 4 (Coordinated 28,000+ Property Tours)',
      accuracyScore: '99.1%',
      tasksCompletedToday: 29,
      pipelineGeneratedToday: '₹2,60,00,000',
      avgResponseSpeed: '0.6s',
      color: '#3b82f6',
      accentLight: 'rgba(59, 130, 246, 0.12)',
      bio: 'Coordinates physical and virtual site tours, dispatches Uber/chauffeur pick-ups for prospective buyers, and generates digital security gate entry passes.',
      guardrails: [
        'Must re-confirm weekend site visit via WhatsApp 3 hours prior',
        'Cab pick-up radius limited to 45km from project site without manager approval',
        'Ensure site relationship executive is assigned before gate pass generation'
      ],
      capabilities: [
        { name: 'Instant Cab Dispatch', desc: 'Integrates with corporate mobility APIs to book buyer pick-ups.' },
        { name: 'Digital Gate Passes', desc: 'Generates QR-code security passes for construction site entry.' },
        { name: 'Weekend Route Batching', desc: 'Groups nearby buyers to optimize sales executive demo availability.' }
      ]
    },
    {
      id: 'emp-re-3',
      code: 'RE_LOAN_SAMEER',
      name: 'Sameer Deshmukh',
      avatar: '🏦',
      role: 'Mortgage & Home Loan Financial Advisor',
      roleCategory: 'PIPELINE_NURTURE',
      department: 'Banking & Financial Partnerships',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet (Financial & Loan Math)',
      shiftHours: '09:00 AM - 07:00 PM',
      workingHoursLabel: 'Banking Hours (HDFC, SBI, ICICI Rates)',
      hourlyRateEquivalent: '₹150/hr equivalent',
      experienceYears: 'AI Tier 4 (Calculated 90,000+ Mortgage Scenarios)',
      accuracyScore: '99.6%',
      tasksCompletedToday: 31,
      pipelineGeneratedToday: '₹1,90,00,000',
      avgResponseSpeed: '1.0s',
      color: '#10b981',
      accentLight: 'rgba(16, 185, 129, 0.12)',
      bio: 'Assesses buyer CIBIL scores, calculates monthly EMI affordability, pre-screens home loan eligibility across partnered banks, and resolves down-payment hesitations.',
      guardrails: [
        'Always cite floating vs fixed interest rate disclaimers accurately',
        'Verify minimum 700 CIBIL score before promising sub-8.5% interest rates',
        'Keep buyer ITR and financial salary documents strictly encrypted'
      ],
      capabilities: [
        { name: 'EMI Calculator', desc: 'Computes tax benefits under Sec 24 & Sec 80C alongside principal schedules.' },
        { name: 'Bank Rate Comparison', desc: 'Surfaces lowest current repo-rate linked lending options.' },
        { name: 'Document Checklist Bot', desc: 'Collects Form 16 and bank statements seamlessly via WhatsApp.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 3. EDUCATION & TRAINING VERTICAL (TEN-EDU-003)
  // --------------------------------------------------------------------------
  education: [
    {
      id: 'emp-edu-1',
      code: 'EDU_PRIYA',
      name: 'Priya Nair',
      avatar: '🎓',
      role: 'Academic Counselor & Course Advisor',
      roleCategory: 'SALES_SDR',
      department: 'Student Counseling & Admissions',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet + Curriculum Database',
      shiftHours: '24/7 Student Advisory Desk',
      workingHoursLabel: 'Always Active for Student Inquiries',
      hourlyRateEquivalent: '₹110/hr equivalent',
      experienceYears: 'AI Tier 4 (Advised 180,000+ Students)',
      accuracyScore: '98.7%',
      tasksCompletedToday: 56,
      pipelineGeneratedToday: '₹28,00,000',
      avgResponseSpeed: '0.7s',
      color: '#8b5cf6',
      accentLight: 'rgba(139, 92, 246, 0.12)',
      bio: 'Analyzes student career aspirations and educational background, maps them to suitable degree and certification cohorts, and shares personalized syllabus guides.',
      guardrails: [
        'Accurately state university accreditation (UGC, AICTE, NAAC A++)',
        'No false placement guarantees (quote audited median packages only)',
        'Check minimum graduation percentage requirements before qualification'
      ],
      capabilities: [
        { name: 'Eligibility Triage', desc: 'Verifies degree requirements and prerequisite work experience.' },
        { name: 'Syllabus Dispatcher', desc: 'Sends comprehensive module brochures and capstone project portfolios.' },
        { name: 'Scholarship Assessor', desc: 'Calculates merit discounts based on entrance test scores.' }
      ]
    },
    {
      id: 'emp-edu-2',
      code: 'EDU_RAHUL',
      name: 'Rahul Joshi',
      avatar: '📝',
      role: 'Admissions & Fee Installment Coordinator',
      roleCategory: 'PIPELINE_NURTURE',
      department: 'Registrar & Admissions Operations',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Gemini 1.5 Pro (Admissions & Payment)',
      shiftHours: '09:00 AM - 08:00 PM',
      workingHoursLabel: 'Admissions Support & EMI Desk',
      hourlyRateEquivalent: '₹100/hr equivalent',
      experienceYears: 'AI Tier 4 (Processed 45,000+ Student Enrollments)',
      accuracyScore: '99.2%',
      tasksCompletedToday: 38,
      pipelineGeneratedToday: '₹18,50,000',
      avgResponseSpeed: '0.8s',
      color: '#3b82f6',
      accentLight: 'rgba(59, 130, 246, 0.12)',
      bio: 'Guides accepted candidates through application form completion, zero-cost EMI loan tie-ups, seat-reservation deposits, and deadline reminders.',
      guardrails: [
        'Enforce batch seat reservation expiry rules strictly (48 hours)',
        'Provide fee refund policy terms in writing with every payment link',
        'Verify identity proof prior to final registration confirmation'
      ],
      capabilities: [
        { name: 'Zero-Cost EMI Setup', desc: 'Sets up 6, 9, and 12-month installment payment options via Razorpay.' },
        { name: 'Batch Seat Hold', desc: 'Locks seat inventory upon receipt of token commitment deposit.' },
        { name: 'Deadline Alerts', desc: 'Sends timed WhatsApp reminders before cohort registration closure.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 4. HOSPITALS & HEALTHCARE VERTICAL (TEN-MED-004)
  // --------------------------------------------------------------------------
  hospitals: [
    {
      id: 'emp-hosp-1',
      code: 'HOSP_ANITA',
      name: 'Dr. Anita Rao',
      avatar: '🩺',
      role: 'AI Medical Receptionist & Symptom Triage Desk',
      roleCategory: 'CUSTOMER_SUPPORT',
      department: 'Front Desk & Emergency Triage',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'GPT-4o (Clinical Triage Embeddings)',
      shiftHours: '24/7 Round-the-Clock Emergency Triage',
      workingHoursLabel: 'Immediate Emergency Response (<10s)',
      hourlyRateEquivalent: '₹160/hr equivalent',
      experienceYears: 'AI Tier 4 (Trained on Clinical Triage Protocols)',
      accuracyScore: '99.8%',
      tasksCompletedToday: 64,
      pipelineGeneratedToday: 'OPD Flow +22%',
      avgResponseSpeed: '0.5s',
      color: '#ef4444',
      accentLight: 'rgba(239, 68, 68, 0.12)',
      bio: 'Evaluates patient chief complaints, assesses symptom urgency, identifies emergency red-flags (chest pain, stroke signs), and directs patients to proper medical specialties.',
      guardrails: [
        'EMERGENCY RULE: If severe trauma or chest pain reported, immediately prompt 108 / Emergency ER contact',
        'Never prescribe Schedule H prescription drugs or formulate definitive diagnoses',
        'Maintain strict patient HIPAA & Indian Digital Health Data Privacy standards'
      ],
      capabilities: [
        { name: 'Specialty Routing', desc: 'Maps symptoms to Cardiology, Orthopedics, Neurology, or General Medicine.' },
        { name: 'Red-Flag Detection', desc: 'Recognizes life-threatening symptoms and triggers priority alerts.' },
        { name: 'Patient Registration', desc: 'Generates digital UHID patient cards and OPD appointment tokens.' }
      ]
    },
    {
      id: 'emp-hosp-2',
      code: 'HOSP_KARAN',
      name: 'Karan Mehta',
      avatar: '🏥',
      role: 'Doctor OPD Appointment & Schedule Coordinator',
      roleCategory: 'APPOINTMENTS',
      department: 'OPD Clinics & Diagnostic Scheduling',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Gemini 1.5 Pro (Doctor Schedules)',
      shiftHours: '24/7 Scheduling Desk',
      workingHoursLabel: 'Real-Time Doctor Availability Desk',
      hourlyRateEquivalent: '₹110/hr equivalent',
      experienceYears: 'AI Tier 4 (Managed 60,000+ OPD Consultations)',
      accuracyScore: '99.4%',
      tasksCompletedToday: 49,
      pipelineGeneratedToday: '₹1,85,000 OPD Fees',
      avgResponseSpeed: '0.6s',
      color: '#3b82f6',
      accentLight: 'rgba(59, 130, 246, 0.12)',
      bio: 'Manages doctor OPD schedules, coordinates follow-up consultations, issues digital queue tokens, and dispatches 2-hour pre-visit WhatsApp reminders.',
      guardrails: [
        'Limit maximum 18 patients per doctor morning OPD shift to avoid delays',
        'Verify doctor on-leave status in Hospital Information System (HIS)',
        'Prompt patient to bring previous lab reports and prescription history'
      ],
      capabilities: [
        { name: 'Token Allocation', desc: 'Assigns queue numbers and estimated consultation times in real time.' },
        { name: '2-Hour SMS Reminder', desc: 'Reduces clinic no-shows to under 3% with interactive confirm buttons.' },
        { name: 'Reschedule Assistant', desc: 'Auto-reschedules patients seamlessly when emergency surgeries occur.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 5. E-COMMERCE & RETAIL VERTICAL (TEN-ECOM-005)
  // --------------------------------------------------------------------------
  ecommerce: [
    {
      id: 'emp-ecom-1',
      code: 'ECOM_TARA',
      name: 'Tara Kapoor',
      avatar: '🛍️',
      role: 'Cart Recovery & Conversational Sales Agent',
      roleCategory: 'SALES_SDR',
      department: 'Growth Marketing & D2C Sales',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet (E-Commerce Catalog & Persuasion)',
      shiftHours: '24/7 Real-Time Cart Sentinel',
      workingHoursLabel: 'Automated 15-Minute Abandoned Cart Triggers',
      hourlyRateEquivalent: '₹130/hr equivalent',
      experienceYears: 'AI Tier 4 (Recovered ₹6.5 Cr in Abandoned Carts)',
      accuracyScore: '98.2%',
      tasksCompletedToday: 78,
      pipelineGeneratedToday: '₹4,20,000 Recovered',
      avgResponseSpeed: '0.6s',
      color: '#ec4899',
      accentLight: 'rgba(236, 72, 153, 0.12)',
      bio: 'Monitors dropped checkout funnels, dispatches personalized WhatsApp checkout links with 1-click payment, offers limited-time coupons, and answers sizing questions.',
      guardrails: [
        'Never offer discounts exceeding 15% without dynamic coupon authorization',
        'Maximum 2 recovery messages per cart session to prevent spam flags',
        'Respect customer opt-out immediately if reply indicates "Not interested"'
      ],
      capabilities: [
        { name: '1-Click Checkout Links', desc: 'Pre-fills shipping address and shopping basket into Razorpay link.' },
        { name: 'Sizing & Style Advice', desc: 'Recommends matching apparel items and cross-sells related accessories.' },
        { name: 'Inventory Scarcity Alert', desc: 'Notifies buyers when cart items reach critical low-stock status.' }
      ]
    },
    {
      id: 'emp-ecom-2',
      code: 'ECOM_ARJUN',
      name: 'Arjun Das',
      avatar: '📦',
      role: 'Order Tracking & Logistics Coordinator',
      roleCategory: 'CUSTOMER_SUPPORT',
      department: 'Fulfillment & Logistics',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'GPT-4o (Courier APIs: Delhivery, BlueDart, Shiprocket)',
      shiftHours: '24/7 Logistics Desk',
      workingHoursLabel: 'Live Courier Telemetry Sync',
      hourlyRateEquivalent: '₹105/hr equivalent',
      experienceYears: 'AI Tier 4 (Tracked 320,000+ Shipments)',
      accuracyScore: '99.5%',
      tasksCompletedToday: 92,
      pipelineGeneratedToday: '99.2% On-Time Delivery',
      avgResponseSpeed: '0.5s',
      color: '#10b981',
      accentLight: 'rgba(16, 185, 129, 0.12)',
      bio: 'Resolves "Where is my order?" inquiries instantly, coordinates with courier partners for address changes and re-attempts, and processes automated delivery notifications.',
      guardrails: [
        'Verify registered mobile number OTP before revealing customer address',
        'Flag courier transit delays exceeding 72 hours for logistics manager review',
        'Auto-initiate replacement shipment if package declared lost by carrier'
      ],
      capabilities: [
        { name: 'Real-Time AWB Tracking', desc: 'Fetches live GPS dispatch coordinates from courier webhooks.' },
        { name: 'Delivery Rescheduling', desc: 'Allows customers to choose alternate delivery dates via WhatsApp.' },
        { name: 'RTO Prevention', desc: 'Confirms Cash-on-Delivery orders prior to warehouse dispatch.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 6. HOTELS & HOSPITALITY VERTICAL (TEN-HOSP-006)
  // --------------------------------------------------------------------------
  hospitality: [
    {
      id: 'emp-hosp-1',
      code: 'HOTEL_ADITYA',
      name: 'Aditya Singhal',
      avatar: '🏨',
      role: 'Room Reservation & Suite Upgrade Specialist',
      roleCategory: 'SALES_SDR',
      department: 'Front Office & Room Reservations',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet (Hospitality & Revenue Management)',
      shiftHours: '24/7 Real-Time Reservation Desk',
      workingHoursLabel: 'Always Active for Direct Bookings',
      hourlyRateEquivalent: '₹125/hr equivalent',
      experienceYears: 'AI Tier 4 (Handled 75,000+ Guest Bookings)',
      accuracyScore: '98.9%',
      tasksCompletedToday: 44,
      pipelineGeneratedToday: '₹12,40,000 Bookings',
      avgResponseSpeed: '0.7s',
      color: '#f59e0b',
      accentLight: 'rgba(245, 158, 11, 0.12)',
      bio: 'Checks live room availability, recommends suite upgrades, calculates seasonal breakfast/spa packages, and secures direct credit-card reservations without OTA commissions.',
      guardrails: [
        'Enforce standard 02:00 PM check-in and 11:00 AM check-out policies',
        'Clearly state cancellation deadlines (e.g. Free cancellation up to 48h)',
        'Check child age policies before adding complimentary extra bedding'
      ],
      capabilities: [
        { name: 'Direct Booking Engine', desc: 'Locks room inventory and issues instant confirmation vouchers.' },
        { name: 'Suite Upgrade Upsell', desc: 'Offers premium sea-view / executive upgrades at personalized rates.' },
        { name: 'Package Customizer', desc: 'Bundles airport transfers and dining credits into reservations.' }
      ]
    },
    {
      id: 'emp-hosp-2',
      code: 'HOTEL_MAYA',
      name: 'Maya Fernandez',
      avatar: '🛎️',
      role: '24/7 Guest Concierge Specialist',
      roleCategory: 'CUSTOMER_SUPPORT',
      department: 'Guest Relations & Concierge',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'GPT-4o (Hospitality Amenities & Local Guides)',
      shiftHours: '24/7 Guest Care Desk',
      workingHoursLabel: 'Instant In-Stay Service Dispatch (<1m)',
      hourlyRateEquivalent: '₹115/hr equivalent',
      experienceYears: 'AI Tier 4 (Resolved 110,000+ Guest Requests)',
      accuracyScore: '99.4%',
      tasksCompletedToday: 68,
      pipelineGeneratedToday: 'CSAT: 4.96 / 5.0',
      avgResponseSpeed: '0.6s',
      color: '#8b5cf6',
      accentLight: 'rgba(139, 92, 246, 0.12)',
      bio: 'Assists in-house guests with room service orders, extra amenities, spa and cab bookings, Wi-Fi connectivity, and curated local tourist itineraries.',
      guardrails: [
        'Verify room number and guest primary name before logging service tickets',
        'Route urgent plumbing or electrical maintenance directly to engineering duty officer',
        'Ensure dietary allergies are highlighted on all dining orders'
      ],
      capabilities: [
        { name: 'Housekeeping Dispatch', desc: 'Directs linen and amenity requests to on-duty floor attendants.' },
        { name: 'Spa & Dining Booking', desc: 'Reserves tables at in-house restaurants and books therapist slots.' },
        { name: 'Local Curated Guides', desc: 'Shares directions to top historic landmarks and shopping spots.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 7. TRAVEL & TOURISM VERTICAL (TEN-TRV-007)
  // --------------------------------------------------------------------------
  travel: [
    {
      id: 'emp-trv-1',
      code: 'TRV_FARHAN',
      name: 'Farhan Akhtar',
      avatar: '✈️',
      role: 'Custom Itinerary & Tour Package Specialist',
      roleCategory: 'SALES_SDR',
      department: 'Outbound Holidays & Custom Itineraries',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet (Global Destinations & Pricing)',
      shiftHours: '24/7 Holiday Advisory Desk',
      workingHoursLabel: 'Rapid Custom Tour Quotes (<45s)',
      hourlyRateEquivalent: '₹135/hr equivalent',
      experienceYears: 'AI Tier 4 (Generated 60,000+ Travel Plans)',
      accuracyScore: '98.6%',
      tasksCompletedToday: 36,
      pipelineGeneratedToday: '₹32,50,000 Bookings',
      avgResponseSpeed: '0.9s',
      color: '#06b6d4',
      accentLight: 'rgba(6, 182, 212, 0.12)',
      bio: 'Crafts tailored day-by-day travel itineraries based on destination preferences, traveler count, hotel star-ratings, and budget constraints.',
      guardrails: [
        'Always verify passport validity requirements (minimum 6 months from travel date)',
        'Check visa processing lead times before confirming short-notice departures',
        'Clearly outline flight cancellation and airline baggage allowance policies'
      ],
      capabilities: [
        { name: 'Day-Wise Itinerary Engine', desc: 'Generates detailed activity schedules with maps and meal plans.' },
        { name: 'Multi-City Flight Bundling', desc: 'Optimizes airfares and hotel combinations to match target budgets.' },
        { name: 'Visa & Forex Advisor', desc: 'Shares mandatory documentation checklists and forex card rates.' }
      ]
    },
    {
      id: 'emp-trv-2',
      code: 'TRV_SIMRAN',
      name: 'Simran Kaur',
      avatar: '🌍',
      role: 'Flight, Hotel & Visa Coordinator',
      roleCategory: 'APPOINTMENTS',
      department: 'Ticketing & Operations',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Gemini 1.5 Pro (GDS Ticketing & Consular Rules)',
      shiftHours: '08:00 AM - 10:00 PM',
      workingHoursLabel: 'Real-Time Flight & Visa Desk',
      hourlyRateEquivalent: '₹120/hr equivalent',
      experienceYears: 'AI Tier 4 (Issued 40,000+ Air Tickets & Visas)',
      accuracyScore: '99.3%',
      tasksCompletedToday: 41,
      pipelineGeneratedToday: '₹19,20,000 Confirmed',
      avgResponseSpeed: '0.7s',
      color: '#10b981',
      accentLight: 'rgba(16, 185, 129, 0.12)',
      bio: 'Issues confirmed airline PNRs, hotel vouchers, and visa appointment dates, while keeping travelers updated on flight status and terminal changes.',
      guardrails: [
        'Verify traveler name spelling matches passport identity line exactly',
        'Flag schedule changes or flight cancellations to traveler immediately',
        'Prompt purchase of comprehensive international travel insurance'
      ],
      capabilities: [
        { name: 'Voucher Generation', desc: 'Issues branded PDF travel vouchers with QR codes for hotel check-in.' },
        { name: 'Web Check-In Assistant', desc: 'Assists travelers with airline seat selection and boarding pass download.' },
        { name: 'Flight Tracker Alerts', desc: 'Monitors gate changes and flight delays in real time.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 8. MANUFACTURING & B2B VERTICAL (TEN-MFG-008)
  // --------------------------------------------------------------------------
  manufacturing_b2b: [
    {
      id: 'emp-mfg-1',
      code: 'MFG_VIKRAMADITYA',
      name: 'Vikramaditya Rao',
      avatar: '⚙️',
      role: 'Industrial RFQ & Bulk Quotation Specialist',
      roleCategory: 'SALES_SDR',
      department: 'Industrial Sales & Key Accounts',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet (Bill of Materials & Volume Pricing)',
      shiftHours: '24/7 Global RFQ Ingestion Desk',
      workingHoursLabel: 'Automated Commercial Costing (<30s)',
      hourlyRateEquivalent: '₹170/hr equivalent',
      experienceYears: 'AI Tier 4 (Calculated ₹850 Cr in Industrial RFQs)',
      accuracyScore: '99.4%',
      tasksCompletedToday: 28,
      pipelineGeneratedToday: '₹95,00,000 Pipeline',
      avgResponseSpeed: '1.2s',
      color: '#d97706',
      accentLight: 'rgba(217, 119, 6, 0.12)',
      bio: 'Extracts engineering drawings and specifications from RFQs, calculates volume-tiered pricing based on Minimum Order Quantities (MOQ), and delivers formal commercial bids.',
      guardrails: [
        'Never quote below baseline factory cost threshold without Plant GM approval',
        'Verify raw material commodity price volatility clause (Alloy/Steel Index)',
        'Ensure international Incoterms (FOB, CIF, EXW) are explicitly defined'
      ],
      capabilities: [
        { name: 'RFQ Drawing Parser', desc: 'Extracts dimensions, tolerances, and material grades from CAD specs.' },
        { name: 'Volume Tier Pricing', desc: 'Computes cost curves for 1,000, 5,000, and 25,000-unit batches.' },
        { name: 'Pro-Forma Invoice Bot', desc: 'Generates GST-compliant formal quotations with payment terms.' }
      ]
    },
    {
      id: 'emp-mfg-2',
      code: 'MFG_SUNIL',
      name: 'Sunil Patil',
      avatar: '🚛',
      role: 'Supply Chain & Dispatch Coordinator',
      roleCategory: 'CUSTOMER_SUPPORT',
      department: 'Logistics & Dispatch Operations',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'GPT-4o (Freight & Transport Telematics)',
      shiftHours: '06:00 AM - 10:00 PM Plant Dispatch Hours',
      workingHoursLabel: 'Live Factory Dispatch & E-Way Bill Desk',
      hourlyRateEquivalent: '₹125/hr equivalent',
      experienceYears: 'AI Tier 4 (Tracked 48,000+ Industrial Shipments)',
      accuracyScore: '99.7%',
      tasksCompletedToday: 35,
      pipelineGeneratedToday: '100% On-Time Dispatch',
      avgResponseSpeed: '0.8s',
      color: '#3b82f6',
      accentLight: 'rgba(59, 130, 246, 0.12)',
      bio: 'Coordinates freight transport, generates government e-way bills and excise gate passes, tracks trailer shipments, and confirms dock deliveries.',
      guardrails: [
        'Verify e-way bill validity distance matches delivery route before departure',
        'Ensure vehicle driver license and insurance documents are logged',
        'Auto-alert plant manager if shipment transit delayed >4 hours'
      ],
      capabilities: [
        { name: 'E-Way Bill Generation', desc: 'Generates GST portal compliant e-way bills with HSN codes.' },
        { name: 'Truck Telematics Sync', desc: 'Monitors GPS transit of heavy freight containers to client docks.' },
        { name: 'Delivery POD Archive', desc: 'Uploads stamped proof-of-delivery receipts into ERP automatically.' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 9. FINANCIAL & CONSULTING SERVICES VERTICAL (TEN-FIN-009)
  // --------------------------------------------------------------------------
  financial_services: [
    {
      id: 'emp-fin-1',
      code: 'FIN_SANJAY',
      name: 'Sanjay Kothari',
      avatar: '💼',
      role: 'Wealth Management & Portfolio Advisor',
      roleCategory: 'SALES_SDR',
      department: 'Private Wealth & Advisory',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'Claude 3.5 Sonnet + Financial Vector Store',
      shiftHours: '24/7 High-Net-Worth Advisory Desk',
      workingHoursLabel: 'Always Active for Investor Inquiries',
      hourlyRateEquivalent: '₹220/hr equivalent',
      experienceYears: 'AI Tier 4 (Modeled ₹1,200 Cr in Private Portfolios)',
      accuracyScore: '99.6%',
      tasksCompletedToday: 22,
      pipelineGeneratedToday: '₹3,40,00,000 AUM',
      avgResponseSpeed: '1.1s',
      color: '#059669',
      accentLight: 'rgba(5, 150, 105, 0.12)',
      bio: 'Analyzes investor risk appetite, evaluates tax-efficient asset allocations (Equity, Debt, Real Estate REITS, Gold), and drafts tailored wealth advisory proposals.',
      guardrails: [
        'SEBI COMPLIANCE: Include statutory risk disclosure on all market investments',
        'Never guarantee fixed returns on market-linked securities or mutual funds',
        'Strict confidential encryption on client net-worth and bank balance data'
      ],
      capabilities: [
        { name: 'Risk Profiler', desc: 'Assesses conservative, moderate, or aggressive investment horizons.' },
        { name: 'Asset Allocation Engine', desc: 'Calculates optimal portfolio diversification across asset classes.' },
        { name: 'Tax Harvest Advisor', desc: 'Identifies Long-Term and Short-Term Capital Gains exemptions.' }
      ]
    },
    {
      id: 'emp-fin-2',
      code: 'FIN_MEERA',
      name: 'Meera Iyer',
      avatar: '🛡️',
      role: 'KYC & Regulatory Compliance Onboarding Agent',
      roleCategory: 'CUSTOMER_SUPPORT',
      department: 'Risk, Legal & Compliance',
      status: 'ON_DUTY',
      isAutoPilotActive: true,
      modelMesh: 'GPT-4o (Regulatory & Verification APIs)',
      shiftHours: '09:00 AM - 08:00 PM',
      workingHoursLabel: 'Live CIBIL, PAN & Aadhaar Verification Desk',
      hourlyRateEquivalent: '₹140/hr equivalent',
      experienceYears: 'AI Tier 4 (Verified 80,000+ Investor Accounts)',
      accuracyScore: '99.9%',
      tasksCompletedToday: 37,
      pipelineGeneratedToday: '100% AML/KYC Clean',
      avgResponseSpeed: '0.7s',
      color: '#8b5cf6',
      accentLight: 'rgba(139, 92, 246, 0.12)',
      bio: 'Verifies PAN, Aadhaar, and CIBIL credit records, checks anti-money laundering (AML) and politically exposed persons (PEP) watchlists, and prepares compliant client dossiers.',
      guardrails: [
        'Reject accounts with active sanctions or PEP matches and flag to Chief Compliance Officer',
        'Ensure Aadhaar masking (display last 4 digits only) per UIDAI directives',
        'Verify document freshness (ITR filed within last 2 financial years)'
      ],
      capabilities: [
        { name: 'Instant CIBIL Verification', desc: 'Fetches live credit score and repayment history via API.' },
        { name: 'DigiLocker OCR Sync', desc: 'Verifies government identity cards with optical character recognition.' },
        { name: 'AML Watchlist Check', desc: 'Screens international financial intelligence and sanctions databases.' }
      ]
    }
  ]
};

// ----------------------------------------------------------------------------
// 9 TENANT-SPECIFIC INITIAL WORK QUEUE TASKS
// ----------------------------------------------------------------------------
export const TENANT_AI_TASKS_MAP = {
  software_it: [
    {
      id: 'tsk-sdr-01',
      agentId: 'emp-it-1',
      roleCategory: 'SALES_SDR',
      title: 'Qualify High-Intent Inbound Lead: Rajesh Kulkarni',
      clientName: 'Rajesh Kulkarni',
      clientCompany: 'Apex Retailers India',
      contactEmail: 'rajesh@apexretailers.in',
      contactPhone: '+91 98201 44521',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'Website Live Chat',
      details: 'Inquired about replacing legacy Salesforce for 45 sales reps. Budget indicated: ₹6,00,000/yr. Urgency: Q1 rollout.',
      suggestedAction: 'Evaluate BANT criteria, set Lead score to 96, assign to Senior AE, and advance to Proposal stage.',
      status: 'PENDING',
      createdAt: '8m ago',
      estimatedImpact: '+₹6,00,000 Pipeline'
    },
    {
      id: 'tsk-sup-01',
      agentId: 'emp-it-2',
      roleCategory: 'CUSTOMER_SUPPORT',
      title: 'Triage & Resolve Ticket #TKT-9102: Webhook signature mismatch',
      clientName: 'Deepak Verma',
      clientCompany: 'FinTech Secure',
      contactEmail: 'deepak@fintechsecure.in',
      contactPhone: '+91 98110 33490',
      type: 'SUPPORT_RESOLUTION',
      priority: 'URGENT',
      channel: 'Support Portal',
      details: 'Customer reports HMAC-SHA256 signature verification fails on inbound payment webhook callbacks. Blocking test transactions.',
      suggestedAction: 'Retrieve API signature specification docs, provide exact NodeJS/Python verification code snippet, and auto-resolve ticket.',
      status: 'PENDING',
      createdAt: '5m ago',
      estimatedImpact: 'SLA Save (<15m Resolution)'
    },
    {
      id: 'tsk-fol-01',
      agentId: 'emp-it-3',
      roleCategory: 'PIPELINE_NURTURE',
      title: 'Day-3 WhatsApp Cadence: Amit Patel (Quotation Follow-Up)',
      clientName: 'Amit Patel',
      clientCompany: 'Patel Logistics Solutions',
      contactEmail: 'amit@patellogistics.com',
      contactPhone: '+91 98450 12345',
      type: 'FOLLOW_UP_OUTBOUND',
      priority: 'HIGH',
      channel: 'WhatsApp',
      details: 'Quotation of ₹4,20,000 sent on Tuesday. Commercial proposal viewed 4 times, but no reply in 48 hours.',
      suggestedAction: 'Send personalized WhatsApp message with 3-bullet ROI summary and invite him to a 10-min implementation planning call.',
      status: 'PENDING',
      createdAt: '15m ago',
      estimatedImpact: '₹4,20,000 Deal Acceleration'
    }
  ],

  real_estate: [
    {
      id: 'tsk-re-01',
      agentId: 'emp-re-1',
      roleCategory: 'SALES_SDR',
      title: 'Qualify High-Net-Worth Buyer: Suresh Singhania',
      clientName: 'Suresh Singhania',
      clientCompany: 'Singhania Industrial Holdings',
      contactEmail: 'suresh@singhaniagroup.in',
      contactPhone: '+91 98200 44102',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'MagicBricks Inbound',
      details: 'Looking for 3BHK + Study in Whitefield or Sarjapur Road. Budget: ₹1.8 Crore - ₹2.2 Crore. Ready to move within 60 days.',
      suggestedAction: 'Match with 2 available units at Prestige Oasis, qualify lead score to 98, and push to Active Opportunities.',
      status: 'PENDING',
      createdAt: '6m ago',
      estimatedImpact: '+₹1,80,00,000 Pipeline'
    },
    {
      id: 'tsk-re-02',
      agentId: 'emp-re-2',
      roleCategory: 'APPOINTMENTS',
      title: 'Schedule Site Visit & Uber Pick-Up: Ananya Gupta',
      clientName: 'Ananya Gupta',
      clientCompany: 'EdTech Solutions',
      contactEmail: 'ananya@edtech.co',
      contactPhone: '+91 97410 88219',
      type: 'APPOINTMENT_BOOKING',
      priority: 'HIGH',
      channel: 'WhatsApp',
      details: 'Buyer requested physical inspection of model flat at Skyline Azure on Saturday at 11:30 AM with family.',
      suggestedAction: 'Issue QR gate pass, assign site executive Sameer, and dispatch chauffeur pick-up confirmation.',
      status: 'PENDING',
      createdAt: '18m ago',
      estimatedImpact: 'Confirmed Weekend Tour'
    },
    {
      id: 'tsk-re-03',
      agentId: 'emp-re-3',
      roleCategory: 'PIPELINE_NURTURE',
      title: 'Assess Home Loan Eligibility: Vikram Malhotra (CIBIL 780)',
      clientName: 'Vikram Malhotra',
      clientCompany: 'Cisco Systems India',
      contactEmail: 'vikram.m@cisco.com',
      contactPhone: '+91 99201 55670',
      type: 'FOLLOW_UP_OUTBOUND',
      priority: 'MEDIUM',
      channel: 'WhatsApp & Email',
      details: 'Evaluating 2BHK unit worth ₹85 Lakhs. Requires bank pre-approval comparison between SBI (8.40%) and HDFC (8.50%).',
      suggestedAction: 'Send side-by-side EMI comparison sheet with tax savings calculations and schedule banker call.',
      status: 'PENDING',
      createdAt: '35m ago',
      estimatedImpact: '₹68,00,000 Loan Tie-up'
    }
  ],

  education: [
    {
      id: 'tsk-edu-01',
      agentId: 'emp-edu-1',
      roleCategory: 'SALES_SDR',
      title: 'Academic Counseling: Ankit Sharma (Executive MBA Candidate)',
      clientName: 'Ankit Sharma',
      clientCompany: 'Infosys Ltd (Sr. Tech Lead)',
      contactEmail: 'ankit.s@infosys.com',
      contactPhone: '+91 98451 88310',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'Website Form',
      details: '7 years work experience. Inquired about Weekend Executive MBA cohort. Wants to verify placement track record.',
      suggestedAction: 'Evaluate eligibility criteria, qualify to 95%, dispatch curriculum PDF, and invite to Alumni Webinar.',
      status: 'PENDING',
      createdAt: '9m ago',
      estimatedImpact: '+₹6,50,000 Tuition Fee'
    },
    {
      id: 'tsk-edu-02',
      agentId: 'emp-edu-2',
      roleCategory: 'PIPELINE_NURTURE',
      title: 'Process Application & Zero-Cost EMI: Meenakshi Sundaram',
      clientName: 'Meenakshi Sundaram',
      clientCompany: 'Cognizant',
      contactEmail: 'meenakshi@gmail.com',
      contactPhone: '+91 98110 33419',
      type: 'FOLLOW_UP_OUTBOUND',
      priority: 'HIGH',
      channel: 'WhatsApp',
      details: 'Offered merit scholarship of ₹40,000 for Data Science cohort. Seat hold expires tomorrow at 06:00 PM.',
      suggestedAction: 'Send 9-month zero-interest EMI registration link via Razorpay and reserve batch seat.',
      status: 'PENDING',
      createdAt: '25m ago',
      estimatedImpact: '₹2,25,000 Enrollment'
    }
  ],

  hospitals: [
    {
      id: 'emp-hosp-tsk-01',
      agentId: 'emp-hosp-1',
      roleCategory: 'CUSTOMER_SUPPORT',
      title: 'Triage Outpatient Inquiry: Meera Joshi (Chest Pain & Fatigue)',
      clientName: 'Meera Joshi',
      clientCompany: 'Private Patient',
      contactEmail: 'meera.j@gmail.com',
      contactPhone: '+91 98200 11984',
      type: 'SUPPORT_RESOLUTION',
      priority: 'URGENT',
      channel: 'Hospital Mobile App',
      details: 'Patient reports mild chest tightness and shortness of breath after climbing stairs. Age: 58.',
      suggestedAction: 'Priority Flag: Allocate immediate emergency slot with Dr. Balakrishnan (Cardiology OPD) and alert ER desk.',
      status: 'PENDING',
      createdAt: '3m ago',
      estimatedImpact: 'Critical Patient Triage'
    },
    {
      id: 'emp-hosp-tsk-02',
      agentId: 'emp-hosp-2',
      roleCategory: 'APPOINTMENTS',
      title: 'Confirm Dr. Balakrishnan OPD Slot & Send Token: Ramesh Kumar',
      clientName: 'Ramesh Kumar',
      clientCompany: 'Private Patient',
      contactEmail: 'ramesh.k@gmail.com',
      contactPhone: '+91 97410 22340',
      type: 'APPOINTMENT_BOOKING',
      priority: 'HIGH',
      channel: 'WhatsApp',
      details: 'Confirmed slot for tomorrow at 10:30 AM. Patient needs parking token and preparation guidelines for fasting blood test.',
      suggestedAction: 'Generate Digital OPD Token #C-14, send Google Maps clinic pin, and dispatch fasting guidelines.',
      status: 'PENDING',
      createdAt: '14m ago',
      estimatedImpact: 'Confirmed OPD Consultation'
    }
  ],

  ecommerce: [
    {
      id: 'tsk-ecom-01',
      agentId: 'emp-ecom-1',
      roleCategory: 'SALES_SDR',
      title: 'Recover High-Value Abandoned Cart: Pooja Hegde (₹14,999)',
      clientName: 'Pooja Hegde',
      clientCompany: 'D2C Consumer',
      contactEmail: 'pooja.h@gmail.com',
      contactPhone: '+91 98199 44321',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'WhatsApp',
      details: 'Dropped cart containing Designer Leather Handbag and Silk Scarf. Checkout stopped at payment step 20m ago.',
      suggestedAction: 'Send 1-click Razorpay checkout link with dynamic 10% coupon code "VIP10" valid for 2 hours.',
      status: 'PENDING',
      createdAt: '12m ago',
      estimatedImpact: '+₹13,499 Recovered'
    },
    {
      id: 'tsk-ecom-02',
      agentId: 'emp-ecom-2',
      roleCategory: 'CUSTOMER_SUPPORT',
      title: 'Reschedule Courier Delivery & Address Update: Order #ORD-8821',
      clientName: 'Rohan Deshmukh',
      clientCompany: 'D2C Consumer',
      contactEmail: 'rohan.d@gmail.com',
      contactPhone: '+91 98210 99401',
      type: 'SUPPORT_RESOLUTION',
      priority: 'HIGH',
      channel: 'WhatsApp',
      details: 'Customer is out of station today; requested delivery reschedule to Friday at office address.',
      suggestedAction: 'Update Delhivery courier API telemetry with new delivery date and office landmark.',
      status: 'PENDING',
      createdAt: '28m ago',
      estimatedImpact: 'RTO Prevention'
    }
  ],

  hospitality: [
    {
      id: 'tsk-hosp-01',
      agentId: 'emp-hosp-1',
      roleCategory: 'SALES_SDR',
      title: 'Direct Reservation & Honeymoon Suite Upgrade: Siddharth Malhotra',
      clientName: 'Siddharth Malhotra',
      clientCompany: 'Luxury Guest',
      contactEmail: 'siddharth@gmail.com',
      contactPhone: '+91 98201 77310',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'Website Chat',
      details: 'Inquiring for 4-night stay in November. Considering Deluxe Sea-View Room. Wants candlelight beach dinner setup.',
      suggestedAction: 'Offer Presidential Villa honeymoon upgrade package with complimentary airport Mercedes transfer.',
      status: 'PENDING',
      createdAt: '10m ago',
      estimatedImpact: '+₹1,85,000 Direct Booking'
    },
    {
      id: 'tsk-hosp-02',
      agentId: 'emp-hosp-2',
      roleCategory: 'CUSTOMER_SUPPORT',
      title: 'In-Stay Concierge Request: Room #402 (Private Yacht Tour)',
      clientName: 'David H. Miller',
      clientCompany: 'In-House Guest',
      contactEmail: 'david.m@miller-holdings.com',
      contactPhone: '+1 415 882 9901',
      type: 'SUPPORT_RESOLUTION',
      priority: 'HIGH',
      channel: 'Guest Concierge Tablet',
      details: 'Guest requests 2-hour sunset yacht cruise tomorrow evening for family of 4 with champagne service.',
      suggestedAction: 'Coordinate with Marina partner, confirm 05:00 PM departure, and bill ₹28,000 to Room #402 folio.',
      status: 'PENDING',
      createdAt: '22m ago',
      estimatedImpact: '5-Star Concierge CSAT'
    }
  ],

  travel: [
    {
      id: 'tsk-trv-01',
      agentId: 'emp-trv-1',
      roleCategory: 'SALES_SDR',
      title: 'Custom Europe Holiday Itinerary: Dr. Rajiv Sen & Family (6 Pax)',
      clientName: 'Dr. Rajiv Sen',
      clientCompany: 'Apollo Hospitals Senior Consultant',
      contactEmail: 'rajiv.sen@apollo.com',
      contactPhone: '+91 98450 11980',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'Website Form',
      details: '12-day customized vacation across Switzerland & France in May. Budget: ₹12 Lakhs - ₹15 Lakhs for family of 6.',
      suggestedAction: 'Generate day-by-day Swiss Rail pass + 4-star boutique hotel itinerary and dispatch quote.',
      status: 'PENDING',
      createdAt: '15m ago',
      estimatedImpact: '+₹14,50,000 Tour Package'
    },
    {
      id: 'tsk-trv-02',
      agentId: 'emp-trv-2',
      roleCategory: 'APPOINTMENTS',
      title: 'Confirm Schengen Visa Biometrics & Ticket Issuance: Priya Batra',
      clientName: 'Priya Batra',
      clientCompany: 'Batra Textiles',
      contactEmail: 'priya@batratex.com',
      contactPhone: '+91 98110 44590',
      type: 'APPOINTMENT_BOOKING',
      priority: 'HIGH',
      channel: 'WhatsApp',
      details: 'VFS Global appointment confirmed for Tuesday in Mumbai. Need confirmed round-trip dummy air tickets and hotel vouchers.',
      suggestedAction: 'Generate compliant flight itinerary and verified hotel reservation vouchers for visa embassy submission.',
      status: 'PENDING',
      createdAt: '30m ago',
      estimatedImpact: 'Visa Clearance Dossier'
    }
  ],

  manufacturing_b2b: [
    {
      id: 'tsk-mfg-01',
      agentId: 'emp-mfg-1',
      roleCategory: 'SALES_SDR',
      title: 'Process Industrial RFQ #RFQ-8821: 15,000 Precision Gears',
      clientName: 'Rajeshwar Patil',
      clientCompany: 'Mahindra Heavy Automotive',
      contactEmail: 'r.patil@mahindra-heavy.in',
      contactPhone: '+91 98200 33490',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'Vendor B2B Portal',
      details: 'Requires 15,000 CNC machined bevel gears (Grade EN353) with carburized heat treatment. Monthly staggered dispatch.',
      suggestedAction: 'Calculate tiered volume pricing (₹420/unit @ 15,000 units), generate formal quotation, and advance deal.',
      status: 'PENDING',
      createdAt: '11m ago',
      estimatedImpact: '+₹63,00,000 Annual Contract'
    },
    {
      id: 'tsk-mfg-02',
      agentId: 'emp-mfg-2',
      roleCategory: 'CUSTOMER_SUPPORT',
      title: 'Dispatch E-Way Bill & Transit Confirmation: Trailer #MH-12-QB-8810',
      clientName: 'Sunil Jadhav',
      clientCompany: 'Tata Motors Pune Plant',
      contactEmail: 's.jadhav@tatamotors.com',
      contactPhone: '+91 98199 22019',
      type: 'SUPPORT_RESOLUTION',
      priority: 'HIGH',
      channel: 'WhatsApp & SMS',
      details: 'Trailer carrying 500 hydraulic pump casings dispatched from factory gate. Driver mobile: +91 94220 11980.',
      suggestedAction: 'Generate government e-way bill #EB-901123, attach excise invoice, and share live vehicle GPS tracking link.',
      status: 'PENDING',
      createdAt: '24m ago',
      estimatedImpact: 'Verified Dock Transit'
    }
  ],

  financial_services: [
    {
      id: 'tsk-fin-01',
      agentId: 'emp-fin-1',
      roleCategory: 'SALES_SDR',
      title: 'Private Wealth Advisory: Harshvardhan Goenka (₹2.5 Cr Portfolio)',
      clientName: 'Harshvardhan Goenka',
      clientCompany: 'Goenka Enterprises',
      contactEmail: 'h.goenka@goenka-holdings.com',
      contactPhone: '+91 98201 11094',
      type: 'LEAD_QUALIFICATION',
      priority: 'URGENT',
      channel: 'Private Wealth Inbound',
      details: 'Exiting commercial real estate asset; seeking tax-exempt re-investment across alternate debt funds and bluechip equity.',
      suggestedAction: 'Generate asset-allocation model (50% Debt, 35% Multi-cap Equity, 15% Gold REIT), qualify lead, and book partner call.',
      status: 'PENDING',
      createdAt: '8m ago',
      estimatedImpact: '+₹2,50,00,000 AUM Inflow'
    },
    {
      id: 'tsk-fin-02',
      agentId: 'emp-fin-2',
      roleCategory: 'CUSTOMER_SUPPORT',
      title: 'KYC & CIBIL Verification for Working Capital Loan: Apex Industrial',
      clientName: 'Anil Singhal',
      clientCompany: 'Apex Industrial Gears Pvt Ltd',
      contactEmail: 'anil@apexgears.in',
      contactPhone: '+91 97410 88319',
      type: 'SUPPORT_RESOLUTION',
      priority: 'HIGH',
      channel: 'WhatsApp Verification Portal',
      details: 'Applying for ₹50,00,000 clean working capital credit line. PAN and GST returns submitted.',
      suggestedAction: 'Verify CIBIL commercial rating (785), complete MCA registry director check, and approve for RM term sheet.',
      status: 'PENDING',
      createdAt: '20m ago',
      estimatedImpact: 'KYC Approval Cleared'
    }
  ]
};

// Default Initial Fallbacks
export const INITIAL_AI_EMPLOYEES = TENANT_AI_EMPLOYEES_MAP.software_it;
export const INITIAL_AI_EMPLOYEE_TASKS = TENANT_AI_TASKS_MAP.software_it;

export const INITIAL_AI_EXECUTION_LOG = [
  {
    id: 'exec-log-1',
    taskId: 'tsk-prev-01',
    agentId: 'emp-it-1',
    agentName: 'Aria Sharma',
    roleCategory: 'SALES_SDR',
    clientName: 'Rohan Sharma (TechVentures)',
    taskTitle: 'Qualify Enterprise Lead: Rohan Sharma',
    completedAt: '14m ago',
    durationMs: 780,
    impact: '+₹4,50,000 Pipeline Created',
    crmRecordUpdated: 'Lead #LD-102 -> Status: Qualified (Score: 95/100) | Opp #OPP-302 Created',
    reasoningTrace: [
      { step: '1. Ingest Payload', detail: 'Received web inquiry via website chat: "Need 25 CRM seats with WhatsApp automation".' },
      { step: '2. Domain Enrichment', detail: 'Verified company techventures.in (Series A FinTech, 65 employees, headquarters Mumbai).' },
      { step: '3. BANT Matrix Check', detail: 'Budget: ₹5L+ (Met), Authority: VP Tech (Met), Need: High (Met), Timeline: <30 Days (Met).' },
      { step: '4. Action & CRM Mutation', detail: 'Advanced lead status to "Qualified", created Deal "TechVentures - 25 Seats" for ₹4,50,000, and queued demo slot.' }
    ]
  },
  {
    id: 'exec-log-2',
    taskId: 'tsk-prev-02',
    agentId: 'emp-it-2',
    agentName: 'Kavita Rao',
    roleCategory: 'CUSTOMER_SUPPORT',
    clientName: 'Anil Mehta (Mehta Logistics)',
    taskTitle: 'Auto-Resolve Ticket #TKT-8091: CSV Import Failure',
    completedAt: '28m ago',
    durationMs: 920,
    impact: 'Resolved in 2.4 mins (SLA Saved)',
    crmRecordUpdated: 'Ticket #TKT-8091 -> Status: Closed | CSAT: 5/5 Stars Recorded',
    reasoningTrace: [
      { step: '1. Error Diagnosis', detail: 'Inspected customer CSV upload failure: column header "Mobile Number" was formatted with spaces.' },
      { step: '2. Auto-Remediation', detail: 'Cleaned CSV schema in temporary memory buffer, re-mapped headers to standard phone column.' },
      { step: '3. Customer Notification', detail: 'Sent resolution reply with fixed file and instructions via WhatsApp.' },
      { step: '4. Ticket Closure', detail: 'Ticket marked Resolved. Customer confirmed with 5-star emoji rating.' }
    ]
  }
];

export function getTenantAiEmployees(industryId) {
  return TENANT_AI_EMPLOYEES_MAP[industryId] || TENANT_AI_EMPLOYEES_MAP.software_it;
}

export function getTenantAiTasks(industryId) {
  return TENANT_AI_TASKS_MAP[industryId] || TENANT_AI_TASKS_MAP.software_it;
}
