import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send,
  Zap,
  Star,
  Users,
  Search,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Headphones,
  Check,
  ChevronRight
} from 'lucide-react';

export function SupportDashboard() {
  const {
    companyProfile,
    currentUserName,
    activeIndustryId,
    currentIndustry,
    navigateTo,
    setActiveModal,
    addNotification
  } = useCRM();

  const [resolvedTickets, setResolvedTickets] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  // Industry-specific Support KPIs & Active Triage Queue
  const getSupportData = () => {
    switch (activeIndustryId) {
      case 'real_estate':
        return {
          kpis: {
            firstResponse: { value: '2.4 min', change: '-45s', period: 'avg response time', isPositive: true },
            slaAdherence: { value: '98.2%', change: '+1.4%', period: 'SLA target >95%', isPositive: true },
            csat: { value: '4.85 / 5', change: '+0.2', period: 'resident CSAT score', isPositive: true },
            aiDeflection: { value: '72%', change: '+8%', period: 'queries resolved by AI', isPositive: true }
          },
          tickets: [
            {
              id: 't-re-1',
              title: 'Master Bedroom AC Drainage Leakage Inspection',
              customer: 'Vikram Malhotra (Flat #1204)',
              channel: 'WhatsApp',
              priority: 'Urgent',
              slaLeft: '14 min left',
              slaRisk: true,
              aiSummary: 'Resident reports water dripping from AC unit in Tower B. Maintenance crew dispatched for 2:30 PM inspection.',
              suggestedReply: 'Hello Mr. Malhotra, our senior plumbing technician Rajesh is on the way and will inspect the unit within 30 minutes.'
            },
            {
              id: 't-re-2',
              title: 'EV Charging Slot Activation in Basement 2',
              customer: 'Pooja Hegde (#PH-401)',
              channel: 'Website',
              priority: 'Medium',
              slaLeft: '2h remaining',
              slaRisk: false,
              aiSummary: 'Resident requested RFID card pairing for private EV charger #B2-44.',
              suggestedReply: 'Your EV RFID tag has been registered and is active on Station B2-44. You can now tap to start charging.'
            },
            {
              id: 't-re-3',
              title: 'Clubhouse Banquet Hall Booking for Birthday Event',
              customer: 'Siddharth Rao (#602)',
              channel: 'Email',
              priority: 'Low',
              slaLeft: '4h remaining',
              slaRisk: false,
              aiSummary: 'Requested booking confirmation and security deposit details for Oct 18.',
              suggestedReply: 'The banquet hall is available on Oct 18. Attached is the booking form and refundable deposit terms.'
            }
          ]
        };
      case 'hospitals':
        return {
          kpis: {
            firstResponse: { value: '45 sec', change: '-30s', period: 'emergency triage time', isPositive: true },
            slaAdherence: { value: '99.4%', change: '+0.6%', period: 'critical SLA standard', isPositive: true },
            csat: { value: '4.92 / 5', change: '+0.1', period: 'patient care rating', isPositive: true },
            aiDeflection: { value: '68%', change: '+12%', period: 'lab reports & OPD booking', isPositive: true }
          },
          tickets: [
            {
              id: 't-hosp-1',
              title: 'Urgent: Cardiology Lab Reports Not Received via WhatsApp',
              customer: 'Suresh Menon (UHID: AZ-9821)',
              channel: 'WhatsApp',
              priority: 'Urgent',
              slaLeft: '8 min left',
              slaRisk: true,
              aiSummary: 'Echo & Lipid profile test completed at 9 AM. Patient doctor consultation scheduled at 12 PM.',
              suggestedReply: 'Dear Mr. Menon, your signed ECG & lipid reports have just been verified by Dr. Kulkarni and sent to your WhatsApp PDF link.'
            },
            {
              id: 't-hosp-2',
              title: 'Health Insurance TPA Cashless Pre-Auth Status Check',
              customer: 'Ayesha Siddiqui (UHID: AZ-7741)',
              channel: 'Phone / IVR',
              priority: 'High',
              slaLeft: '45 min left',
              slaRisk: false,
              aiSummary: 'Star Health insurance query regarding knee arthroscopy pre-authorization letter.',
              suggestedReply: 'Pre-auth approval letter has been received from Star Health for ₹1.2 L. Admission desk notified.'
            }
          ]
        };
      case 'financial_services':
        return {
          kpis: {
            firstResponse: { value: '1.8 min', change: '-1.1m', period: 'avg financial query', isPositive: true },
            slaAdherence: { value: '97.6%', change: '+2.0%', period: 'banking SLA standard', isPositive: true },
            csat: { value: '4.88 / 5', change: '+0.3', period: 'borrower CSAT score', isPositive: true },
            aiDeflection: { value: '81%', change: '+15%', period: 'statement & EMI queries', isPositive: true }
          },
          tickets: [
            {
              id: 't-fin-1',
              title: 'NACH Mandate Auto-Debit Clarification for Loan #HL-9821',
              customer: 'Nikhil Kulkarni',
              channel: 'WhatsApp',
              priority: 'High',
              slaLeft: '22 min left',
              slaRisk: false,
              aiSummary: 'Customer received SMS stating NACH mandate registered with HDFC Bank. Wants confirmation on debit date (5th of each month).',
              suggestedReply: 'Hello Mr. Kulkarni, confirmed that your NACH mandate is active. Your first EMI of ₹32,450 will be auto-debited on November 5th.'
            },
            {
              id: 't-fin-2',
              title: 'Annual Interest Certificate & Form 16A Download Request',
              customer: 'Radha Sundaram',
              channel: 'Email',
              priority: 'Medium',
              slaLeft: '1h 30m left',
              slaRisk: false,
              aiSummary: 'Customer requires provisional interest certificate for Income Tax filing under Section 24b.',
              suggestedReply: 'Attached is your provisional interest certificate for FY 2025-26 showing total interest paid: ₹2,14,500.'
            }
          ]
        };
      default: // software_it & others
        return {
          kpis: {
            firstResponse: { value: '1.2 min', change: '-50s', period: 'avg response time', isPositive: true },
            slaAdherence: { value: '98.8%', change: '+1.2%', period: 'Enterprise SLA >98%', isPositive: true },
            csat: { value: '4.91 / 5', change: '+0.15', period: 'customer satisfaction', isPositive: true },
            aiDeflection: { value: '78%', change: '+9%', period: 'resolved by AI agent', isPositive: true }
          },
          tickets: [
            {
              id: 't-it-1',
              title: 'Webhook 429 Too Many Requests - Endpoint Rate Limit Debugging',
              customer: 'David Chen (DevOps Lead, HyperFlow)',
              channel: 'Website',
              priority: 'Urgent',
              slaLeft: '12 min left',
              slaRisk: true,
              aiSummary: 'Customer bursts 150 events/sec causing temporary HTTP 429 backoff. Needs rate limit raised to 500 req/sec.',
              suggestedReply: 'Hi David, I have temporarily increased your sandbox endpoint burst limit to 500 req/sec. Our webhook queue is now processing without drops.'
            },
            {
              id: 't-it-2',
              title: 'Custom SAML SSO & Okta Integration Verification',
              customer: 'Sarah Jenkins (NexusTech)',
              channel: 'Email',
              priority: 'High',
              slaLeft: '45 min left',
              slaRisk: false,
              aiSummary: 'Okta metadata XML imported. Needs confirmation on JIT (Just-In-Time) user provisioning toggle.',
              suggestedReply: 'Your Okta SAML certificate is validated. JIT user provisioning has been enabled for your domain @nexustech.com.'
            },
            {
              id: 't-it-3',
              title: 'WhatsApp Cloud API 24-Hour Session Window Timeout Query',
              customer: 'Elena Rostova (Starlight Tech)',
              channel: 'WhatsApp',
              priority: 'Medium',
              slaLeft: '2h 15m left',
              slaRisk: false,
              aiSummary: 'Asking how to send utility template messages outside 24h conversation window.',
              suggestedReply: 'Hi Elena, outside the 24h window you can trigger pre-approved Meta Utility Templates with custom variables.'
            }
          ]
        };
    }
  };

  const supportData = getSupportData();

  const handleResolve = (id) => {
    setResolvedTickets((prev) => ({ ...prev, [id]: true }));
    addNotification({
      type: 'system',
      title: 'Ticket marked as Resolved & CSAT Survey dispatched! ⭐',
      category: 'Support'
    });
  };

  const handleSendDraft = (id) => {
    setResolvedTickets((prev) => ({ ...prev, [id]: true }));
    addNotification({
      type: 'ai',
      title: 'AI suggested resolution dispatched to customer via channel!',
      category: 'Support'
    });
  };

  return (
    <div className="support-dashboard">
      {/* Title Bar */}
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700 }}>
              Support Manager & Triage Hub
            </span>
            <span className="badge" style={{ backgroundColor: companyProfile.color ? `${companyProfile.color}22` : 'rgba(37,99,235,0.12)', color: companyProfile.color || '#2563eb' }}>
              {companyProfile.name}
            </span>
          </div>
          <h1>Omnichannel Support & SLA Command Center</h1>
          <p>Real-time ticket queue, AI auto-deflection, SLA health tracking, and 1-click customer resolutions</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('inbox')}>
            <Headphones size={15} />
            <span>Open Live Inbox</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigateTo('knowledge')}>
            <BookOpen size={15} />
            <span>Manage Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* 4 Support StatCards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Avg. First Response"
          value={supportData.kpis.firstResponse.value}
          change={supportData.kpis.firstResponse.change}
          period={supportData.kpis.firstResponse.period}
          isPositive={supportData.kpis.firstResponse.isPositive}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="SLA Adherence Rate"
          value={supportData.kpis.slaAdherence.value}
          change={supportData.kpis.slaAdherence.change}
          period={supportData.kpis.slaAdherence.period}
          isPositive={supportData.kpis.slaAdherence.isPositive}
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Customer CSAT Score"
          value={supportData.kpis.csat.value}
          change={supportData.kpis.csat.change}
          period={supportData.kpis.csat.period}
          isPositive={supportData.kpis.csat.isPositive}
          icon={Star}
          color="amber"
        />
        <StatCard
          title="AI Auto-Deflection"
          value={supportData.kpis.aiDeflection.value}
          change={supportData.kpis.aiDeflection.change}
          period={supportData.kpis.aiDeflection.period}
          isPositive={supportData.kpis.aiDeflection.isPositive}
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Main Support Queue Section */}
      <div className="crm-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LifeBuoy size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Active Customer Triage Queue</h3>
            <span className="badge badge-waiting">{supportData.tickets.length} In Queue</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'urgent', 'whatsapp', 'website'].map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${activeFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                onClick={() => setActiveFilter(tab)}
              >
                {tab === 'all' ? 'All Tickets' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {supportData.tickets.map((t) => {
            const isResolved = !!resolvedTickets[t.id];
            return (
              <div
                key={t.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                  border: `1px solid ${isResolved ? 'rgba(16, 185, 129, 0.3)' : t.slaRisk ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'}`,
                  opacity: isResolved ? 0.65 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: t.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: t.priority === 'Urgent' ? '#ef4444' : '#f59e0b',
                          fontWeight: 700
                        }}
                      >
                        {t.priority}
                      </span>
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                        {t.channel}
                      </span>
                      {isResolved && (
                        <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: isResolved ? 'var(--text-secondary)' : 'var(--text-main)' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {t.customer}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: t.slaRisk ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: t.slaRisk ? '#ef4444' : '#10b981',
                        fontWeight: 700
                      }}
                    >
                      {t.slaLeft}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                  {t.aiSummary}
                </p>

                {/* AI Draft Suggestion Box */}
                {!isResolved && (
                  <div
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.06)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      marginBottom: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 700 }}>
                      <Sparkles size={14} />
                      <span>AI Suggested Resolution Response:</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{t.suggestedReply}"
                    </div>
                  </div>
                )}

                {/* Action Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  {!isResolved ? (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleResolve(t.id)}
                      >
                        <Check size={14} />
                        <span>Manual Resolve</span>
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                        onClick={() => handleSendDraft(t.id)}
                      >
                        <Send size={13} />
                        <span>Send AI Resolution & Close</span>
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                      Ticket marked resolved • CSAT request sent
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
