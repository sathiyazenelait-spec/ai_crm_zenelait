import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import {
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  PhoneCall,
  Video,
  MessageSquare,
  DollarSign,
  Award,
  Zap,
  ChevronRight,
  FileText,
  UserCheck,
  Send,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';

export function SalesExecutiveDashboard() {
  const {
    companyProfile,
    currentUserName,
    activeIndustryId,
    currentIndustry,
    leads,
    opportunities,
    updateOpportunityStage,
    navigateTo,
    setActiveModal,
    addNotification
  } = useCRM();

  const [completedTasks, setCompletedTasks] = useState({});
  const [quickContacted, setQuickContacted] = useState({});

  // Industry tailored personal target and KPIs
  const getExecutiveMetrics = () => {
    switch (activeIndustryId) {
      case 'real_estate':
        return {
          target: { achieved: '₹85 L', target: '₹1.2 Cr', percent: 71, label: 'Monthly Sales Target' },
          kpis: {
            meetings: { value: '4 Site Visits', change: '2 today', period: 'scheduled', isPositive: true },
            hotLeads: { value: '14 Prospects', change: 'Score > 85', period: 'allocated to you', isPositive: true },
            pendingQuotes: { value: '3 Cost Sheets', change: '₹2.4 Cr value', period: 'awaiting token', isPositive: true },
            commission: { value: '₹1,42,000', change: '+18%', period: 'projected incentive', isPositive: true }
          },
          agenda: [
            { id: 'ag-1', time: '10:30 AM', title: 'Site Inspection - 3BHK Penthouse', client: 'Vikram Malhotra', contact: '+91 98450 12345', location: 'Skyline Meadows Tower B', type: 'in-person', notes: 'Interested in East facing unit with 2 car parking spaces.' },
            { id: 'ag-2', time: '02:00 PM', title: 'Virtual 3D Walkthrough & Floorplan Review', client: 'Dr. Sunita Rao', contact: '+91 97110 88231', location: 'Google Meet', type: 'video', notes: 'NRI buyer looking for rental yield properties in Whitefield.' },
            { id: 'ag-3', time: '04:30 PM', title: 'Price Negotiation & Token Advance', client: 'Rajesh & Pooja Hegde', contact: '+91 98200 44119', location: 'Sales Gallery Conf Room 2', type: 'in-person', notes: 'Ready to book if 2% stamp duty waiver is approved.' }
          ],
          hotLeads: [
            { id: 'hl-1', name: 'Ananya Deshmukh', budget: '₹1.50 - ₹1.80 Cr', score: 96, project: '3BHK Luxury Sky Villa', aiTip: 'AI detected high urgency (moving next month). Pitch ready-to-move inventory with modular kitchen promo.' },
            { id: 'hl-2', name: 'Karthik Narayanan', budget: '₹95 L - ₹1.10 Cr', score: 91, project: '2.5BHK Smart Home', aiTip: 'First-time home buyer looking for 80% bank loan approval assistance.' },
            { id: 'hl-3', name: 'Meera Kapoor', budget: '₹2.40 Cr', score: 88, project: '4BHK Duplex Penthouse', aiTip: 'Requested floor plan and tax exemption calculation.' }
          ]
        };
      case 'hospitals':
        return {
          target: { achieved: '34 Patients', target: '45 Patients', percent: 76, label: 'Weekly Consultations Scheduled' },
          kpis: {
            meetings: { value: '6 Consultations', change: '3 OPD slots', period: 'scheduled today', isPositive: true },
            hotLeads: { value: '18 Inquiries', change: 'Priority High', period: 'symptom triage', isPositive: true },
            pendingQuotes: { value: '4 Surgery Plans', change: 'Cardio & Ortho', period: 'insurance pre-auth', isPositive: true },
            commission: { value: '98.5%', change: '+2.1%', period: 'patient satisfaction', isPositive: true }
          },
          agenda: [
            { id: 'ag-1', time: '11:00 AM', title: 'Cardiology Specialist Pre-Consultation', client: 'Suresh Menon (Age 58)', contact: '+91 98401 22334', location: 'OPD Chamber 104', type: 'in-person', notes: 'Complains of intermittent chest discomfort. ECG reports uploaded.' },
            { id: 'ag-2', time: '01:30 PM', title: 'Tele-Health Video Consultation - Second Opinion', client: 'Ayesha Siddiqui', contact: '+91 99200 77112', location: 'Hospital Video Portal', type: 'video', notes: 'Post-op knee recovery follow-up.' }
          ],
          hotLeads: [
            { id: 'hl-1', name: 'Ramesh Gupta', budget: 'Health Insurance Covered', score: 94, project: 'Knee Replacement Surgery', aiTip: 'Cashless TPA insurance pre-approved. Patient ready for date booking.' },
            { id: 'hl-2', name: 'Deepa Verma', budget: 'Private Pay', score: 89, project: 'Pediatric Allergy Evaluation', aiTip: 'Child has recurring pollen allergies. Booked slot with Dr. Sharma.' }
          ]
        };
      case 'education':
        return {
          target: { achieved: '14 Students', target: '18 Students', percent: 78, label: 'Monthly Enrollment Quota' },
          kpis: {
            meetings: { value: '5 Demo Sessions', change: 'Full Stack & AI', period: 'scheduled today', isPositive: true },
            hotLeads: { value: '22 Applicants', change: 'Score > 80', period: 'counseling queue', isPositive: true },
            pendingQuotes: { value: '6 Scholarship Apps', change: '₹2.7 L value', period: 'fee payment link sent', isPositive: true },
            commission: { value: '₹42,000', change: '+25%', period: 'incentive payout', isPositive: true }
          },
          agenda: [
            { id: 'ag-1', time: '11:30 AM', title: '1-on-1 Career Counseling Demo (Full Stack AI)', client: 'Rohan Sharma', contact: '+91 98800 12390', location: 'Zoom Session', type: 'video', notes: 'Final year B.Tech student looking for placement guarantee batch.' },
            { id: 'ag-2', time: '03:15 PM', title: 'Parent Counseling - Data Science Masters Program', client: 'Pooja Iyer & Parent', contact: '+91 98110 55442', location: 'Campus Counseling Room', type: 'in-person', notes: 'Comparing our syllabus with IIT Madras certificate.' }
          ],
          hotLeads: [
            { id: 'hl-1', name: 'Vikas Pandey', budget: '₹65,000 (0% EMI)', score: 95, project: 'GenAI & LLM Bootcamp', aiTip: 'Attended webinar yesterday and scored 90% in prerequisite test. Send 10% early bird voucher.' },
            { id: 'hl-2', name: 'Snehal Patil', budget: '₹45,000', score: 89, project: 'Full Stack MERN Course', aiTip: 'Needs confirmation on weekend class recordings and GitHub portfolio reviews.' }
          ]
        };
      case 'financial_services':
        return {
          target: { achieved: '₹68 L', target: '₹90 L', percent: 75, label: 'Monthly Loan Disbursement Goal' },
          kpis: {
            meetings: { value: '4 KYC Audits', change: '2 MSME loans', period: 'scheduled today', isPositive: true },
            hotLeads: { value: '11 Applicants', change: 'CIBIL > 760', period: 'ready for sanction', isPositive: true },
            pendingQuotes: { value: '2 Term Sheets', change: '₹45 L pipeline', period: 'RM sign-off stage', isPositive: true },
            commission: { value: '₹58,500', change: '+30%', period: 'quarterly bonus', isPositive: true }
          },
          agenda: [
            { id: 'ag-1', time: '11:00 AM', title: 'MSME Working Capital Loan Review', client: 'Apex Heavy Forgings (V. Rao)', contact: '+91 98450 67123', location: 'Client Office / Zoom', type: 'video', notes: 'Audited 3-year P&L and GST filings verified. Explaining term loan vs OD facility.' },
            { id: 'ag-2', time: '02:45 PM', title: 'Home Loan Sanction Document Sign-Off', client: 'Kavita & Amit Roy', contact: '+91 98201 99881', location: 'Branch Meeting Room', type: 'in-person', notes: 'Sanction letter generated. Property valuation completed.' }
          ],
          hotLeads: [
            { id: 'hl-1', name: 'Nikhil Kulkarni', budget: '₹35,00,000 (Home Loan)', score: 97, project: 'Prime Home Loan (8.4%)', aiTip: 'CIBIL 810. Verified ITR. Eligible for fast-track 24h digital sanction.' },
            { id: 'hl-2', name: 'Radha Sundaram', budget: '₹15,00,000 (Business Loan)', score: 90, project: 'Equipment Financing', aiTip: 'GST turnover shows 40% YoY growth. Offer 36-month tenure.' }
          ]
        };
      default: // software_it & others
        return {
          target: { achieved: '$11,400', target: '$15,000', percent: 76, label: 'Monthly MRR Quota' },
          kpis: {
            meetings: { value: '4 Product Demos', change: '3 Zoom / 1 Meet', period: 'scheduled today', isPositive: true },
            hotLeads: { value: '16 Leads', change: 'Score > 80', period: 'in active pipeline', isPositive: true },
            pendingQuotes: { value: '3 Enterprise RFPs', change: '$38,500 ACV', period: 'under evaluation', isPositive: true },
            commission: { value: '$1,850', change: '+14%', period: 'projected commission', isPositive: true }
          },
          agenda: [
            { id: 'ag-1', time: '10:00 AM', title: 'Enterprise Cloud Architecture & SLA Demo', client: 'Arun Patel (CTO, CloudScale)', contact: 'arun@cloudscale.io', location: 'Google Meet', type: 'video', notes: 'Needs custom SSO integration and HIPAA/GDPR data isolation guarantees.' },
            { id: 'ag-2', time: '02:30 PM', title: 'Technical POC Deep Dive & Sandbox Review', client: 'Sarah Jenkins (DevOps Lead)', contact: 'sarah.j@nexustech.com', location: 'Zoom Meeting', type: 'video', notes: 'Tested API webhooks. Walk through multi-channel WhatsApp bot trigger.' },
            { id: 'ag-3', time: '05:00 PM', title: 'Executive Commercials & Contract Sign-off', client: 'Markus Vogel (VP Growth)', contact: 'mvogel@vortexfin.de', location: 'Google Meet', type: 'video', notes: 'Finalizing 50-agent seat tier with annual payment discount.' }
          ],
          hotLeads: [
            { id: 'hl-1', name: 'DevMatrix Labs (Priya Nair)', budget: '$18,000 ACV', score: 98, project: 'Zenelait Enterprise Pro', aiTip: 'Trial expired yesterday with 92% feature adoption. High closing velocity if reached out today.' },
            { id: 'hl-2', name: 'HyperFlow Logistics (David Chen)', budget: '$9,600 ACV', score: 92, project: 'Omnichannel AI Automation', aiTip: 'Requested quotation for 10 WhatsApp agent instances and custom Webhook triggers.' },
            { id: 'hl-3', name: 'Starlight Retail Tech (Elena Rostova)', budget: '$12,000 ACV', score: 87, project: 'Custom LLM Bot Integration', aiTip: 'Scheduled demo for next Monday. Sent technical architecture whitepaper.' }
          ]
        };
    }
  };

  const roleData = getExecutiveMetrics();

  const toggleTask = (id) => {
    setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
    addNotification({
      type: 'task',
      title: completedTasks[id] ? 'Task reopened' : 'Demo / Meeting marked as completed! 🎯',
      category: 'Sales'
    });
  };

  const handleQuickContact = (id, type) => {
    setQuickContacted((prev) => ({ ...prev, [id]: true }));
    addNotification({
      type: 'ai',
      title: `AI Outreach initiated via ${type} to lead`,
      category: 'Sales'
    });
  };

  return (
    <div className="sales-executive-dashboard">
      {/* Title Bar */}
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', fontWeight: 700 }}>
              Sales Executive Workspace
            </span>
            <span className="badge" style={{ backgroundColor: companyProfile.color ? `${companyProfile.color}22` : 'rgba(37,99,235,0.12)', color: companyProfile.color || '#2563eb' }}>
              {companyProfile.name}
            </span>
          </div>
          <h1>Good Day, {currentUserName || 'Rahul'} ⚡</h1>
          <p>Your daily agenda, high-intent leads, demo schedule, and deal acceleration hub</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigateTo('sales-executive-hub')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
          >
            <Sparkles size={14} />
            <span>Sales Executive Hub (All 10 Features)</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigateTo('lead-to-sale')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={14} style={{ color: '#06b6d4' }} />
            <span>5-Step Lead to Sale</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('leads')}>
            <span>View All My Leads</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('addLead')}>
            <span>+ Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Target Progress Banner */}
      <div
        className="crm-card"
        style={{
          marginBottom: '24px',
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Target size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {roleData.target.label}
              </span>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                {roleData.target.percent}% Achieved
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{roleData.target.achieved}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>of {roleData.target.target} target</span>
            </div>

            {/* Visual Progress Bar */}
            <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${roleData.target.percent}%`,
                  background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #10b981 100%)',
                  borderRadius: '999px',
                  transition: 'width 1s ease'
                }}
              />
            </div>
          </div>

          {/* Quick Motivational Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>On track for</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>112% Quota</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>8 days remaining</div>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <Award size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Executive KPIs */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Today's Schedule"
          value={roleData.kpis.meetings.value}
          change={roleData.kpis.meetings.change}
          period={roleData.kpis.meetings.period}
          isPositive={roleData.kpis.meetings.isPositive}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="My High-Intent Leads"
          value={roleData.kpis.hotLeads.value}
          change={roleData.kpis.hotLeads.change}
          period={roleData.kpis.hotLeads.period}
          isPositive={roleData.kpis.hotLeads.isPositive}
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Quotations in Review"
          value={roleData.kpis.pendingQuotes.value}
          change={roleData.kpis.pendingQuotes.change}
          period={roleData.kpis.pendingQuotes.period}
          isPositive={roleData.kpis.pendingQuotes.isPositive}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Projected Incentive"
          value={roleData.kpis.commission.value}
          change={roleData.kpis.commission.change}
          period={roleData.kpis.commission.period}
          isPositive={roleData.kpis.commission.isPositive}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Main 2-Column Split: Today's Action Agenda & High Intent Leads */}
      <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
        {/* Left Column: Today's Action Agenda */}
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Today's Action & Demo Agenda</h3>
            </div>
            <span className="badge badge-waiting">{roleData.agenda.length} Scheduled</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roleData.agenda.map((item) => {
              const isDone = !!completedTasks[item.id];
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                    border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                    opacity: isDone ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => toggleTask(item.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: `2px solid ${isDone ? '#10b981' : 'var(--text-secondary)'}`,
                          backgroundColor: isDone ? '#10b981' : 'transparent',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title={isDone ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {isDone && <Check size={14} />}
                      </button>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {item.client} • {item.contact}
                        </div>
                      </div>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 600 }}>
                      {item.time}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 10px 34px', lineHeight: 1.4 }}>
                    {item.notes}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '34px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.type === 'video' ? <Video size={12} /> : <UserCheck size={12} />}
                      {item.location}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleQuickContact(item.id, 'WhatsApp')}
                      >
                        <MessageSquare size={12} />
                        <span>Pre-Brief</span>
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleQuickContact(item.id, 'Video / Call')}
                      >
                        <ExternalLink size={12} />
                        <span>Launch Meeting</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI-Prioritized Hot Leads Assigned to Me */}
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>AI-Scored High-Intent Leads</h3>
            </div>
            <span className="badge badge-lead-captured">🔥 High Probability</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roleData.hotLeads.map((lead) => {
              const isContacted = !!quickContacted[lead.id];
              return (
                <div
                  key={lead.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {lead.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{lead.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lead.project}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700 }}>
                        Score {lead.score}/100
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {lead.budget}
                      </span>
                    </div>
                  </div>

                  {/* AI Recommended Strategy */}
                  <div
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      borderLeft: '3px solid #f59e0b',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      margin: '8px 0',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                      🤖 AI Recommended Pitch:
                    </strong>
                    {lead.aiTip}
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleQuickContact(lead.id, 'WhatsApp')}
                    >
                      <MessageSquare size={12} />
                      <span>{isContacted ? 'Message Sent' : 'WhatsApp'}</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleQuickContact(lead.id, 'Direct Call')}
                    >
                      <PhoneCall size={12} />
                      <span>Call Now</span>
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => navigateTo('leads')}
                    >
                      <span>Open Dossier</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
