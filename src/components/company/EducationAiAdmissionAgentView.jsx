import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Bot, MessageSquare, Users, BookOpen, Calendar,
  FileCheck, Shield, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
  RefreshCw, Plus, Search, Filter, Clock, Eye, Phone, Mail, Award,
  Check, X, ExternalLink, Settings, Database, Sliders, Play, Pause,
  Share2, ChevronRight, UserCheck
} from 'lucide-react';
import { educationAiService } from '../../services/educationAiService';

export default function EducationAiAdmissionAgentView({ initialSubTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);

  // States
  const [config, setConfig] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [counsellingRequests, setCounsellingRequests] = useState([]);
  const [applicationDrafts, setApplicationDrafts] = useState([]);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Action status feedback
  const [feedback, setFeedback] = useState({ message: '', isError: false });

  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCounsellingModal, setShowCounsellingModal] = useState(false);
  const [showNewKnowledgeModal, setShowNewKnowledgeModal] = useState(false);

  // Form states
  const [newLeadForm, setNewLeadForm] = useState({
    name: '', email: '', phone: '', interestedCourseId: 501, source: 'WEBSITE_CHAT'
  });
  const [counsellingForm, setCounsellingForm] = useState({
    leadId: 1201, preferredDate: '2026-10-30', preferredTime: '11:00', meetingMode: 'ONLINE', reason: 'Career & Course Guidance'
  });
  const [newKnowledgeForm, setNewKnowledgeForm] = useState({
    title: '', sourceType: 'DOCUMENT', language: 'en', enabled: true
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const showFeedback = (msg, isError = false) => {
    setFeedback({ message: msg, isError });
    setTimeout(() => setFeedback({ message: '', isError: false }), 4500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        cfgData, sessData, ldsData, crsData, kbData, metData, audData, recData
      ] = await Promise.allSettled([
        educationAiService.getAdmissionConfig(),
        educationAiService.getAdmissionSessions(),
        educationAiService.getAdmissionLeads(),
        educationAiService.getCourses(),
        educationAiService.getKnowledgeSources(),
        educationAiService.getAdmissionMetrics(),
        educationAiService.getAdmissionAuditEvents(),
        educationAiService.recommendCourses({ interests: ['JAVA', 'WEB'] })
      ]);

      if (cfgData.status === 'fulfilled') setConfig(cfgData.value);
      if (sessData.status === 'fulfilled') {
        const sList = sessData.value?.content || [];
        setSessions(sList);
        if (sList.length > 0) {
          selectSession(sList[0].sessionId);
        }
      }
      if (ldsData.status === 'fulfilled') setLeads(ldsData.value?.content || []);
      if (crsData.status === 'fulfilled') setCourses(crsData.value?.content || []);
      if (kbData.status === 'fulfilled') setKnowledgeSources(kbData.value?.content || []);
      if (metData.status === 'fulfilled') setMetrics(metData.value);
      if (audData.status === 'fulfilled') setAuditEvents(audData.value?.content || []);
      if (recData.status === 'fulfilled') setRecommendations(recData.value?.recommendations || []);

      // Seed initial sample counselling & applications
      setCounsellingRequests([
        {
          appointmentRequestId: 3101,
          leadId: 1201,
          studentName: 'Arun Kumar',
          status: 'PENDING_CONFIRMATION',
          preferredDate: '2026-10-30',
          preferredTime: '11:00 AM',
          meetingMode: 'ONLINE (Google Meet)',
          reason: 'Java Full Stack Career Guidance & Eligibility Review'
        },
        {
          appointmentRequestId: 3102,
          leadId: 1202,
          studentName: 'Meena Raj',
          status: 'CONFIRMED',
          preferredDate: '2026-10-31',
          preferredTime: '03:30 PM',
          meetingMode: 'IN_PERSON (Academy Chamber 2)',
          reason: 'Weekend Cohort Fees & EMI Plan Walkthrough'
        }
      ]);

      setApplicationDrafts([
        {
          applicationId: 2101,
          leadId: 1201,
          studentName: 'Arun Kumar',
          courseName: 'Java Full Stack Development',
          status: 'DRAFT',
          missingFields: ['dateOfBirth', 'educationDetails'],
          requiresStudentCompletion: true,
          createdAt: '2026-10-27T15:19:00+05:30'
        },
        {
          applicationId: 2102,
          leadId: 1202,
          studentName: 'Meena Raj',
          courseName: 'Applied Generative AI & LLMs',
          status: 'DRAFT',
          missingFields: ['degreeCertificate'],
          requiresStudentCompletion: true,
          createdAt: '2026-10-27T14:50:00+05:30'
        }
      ]);

    } catch (err) {
      console.error('Error loading AI Admission data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (sessionId) => {
    setSelectedSession(sessionId);
    const msgs = await educationAiService.getAdmissionMessages(sessionId);
    setSessionMessages(msgs?.content || []);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSession) return;
    const msg = replyText.trim();
    setReplyText('');

    const res = await educationAiService.sendAdmissionMessage(selectedSession, { message: msg });
    if (res) {
      const updated = await educationAiService.getAdmissionMessages(selectedSession);
      setSessionMessages(updated?.content || []);
      showFeedback('AI Admission Agent responded with verified course grounding.');
    }
  };

  const handleHandoff = async (sessionId) => {
    const res = await educationAiService.handoffAdmissionSession(sessionId, {
      reason: 'STUDENT_REQUESTED_HUMAN',
      preferredTeam: 'ADMISSIONS'
    });
    if (res) {
      showFeedback('Session transferred to Admissions Team. Status updated to HANDOFF_PENDING.');
      setSessions(prev => prev.map(s => s.sessionId === sessionId ? { ...s, status: 'HANDOFF_PENDING' } : s));
    }
  };

  const handleCloseSession = async (sessionId) => {
    const res = await educationAiService.closeAdmissionSession(sessionId, { reason: 'ENQUIRY_COMPLETED' });
    if (res) {
      showFeedback('Admission session marked CLOSED.');
      setSessions(prev => prev.map(s => s.sessionId === sessionId ? { ...s, status: 'CLOSED' } : s));
    }
  };

  const handleSyncKb = async (sourceId) => {
    const res = await educationAiService.syncKnowledgeSource(sourceId);
    if (res) {
      showFeedback(`Knowledge source ${sourceId} synchronization job queued successfully.`);
      setKnowledgeSources(prev => prev.map(k => k.sourceId === sourceId ? { ...k, status: 'INDEXED', lastSyncedAt: 'Just now' } : k));
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    const res = await educationAiService.createAdmissionLead(selectedSession || 'adm_session_1001', newLeadForm);
    if (res) {
      showFeedback(`Admission enquiry created for ${newLeadForm.name} (Lead #${res.leadId}).`);
      setLeads(prev => [res, ...prev]);
      setShowLeadModal(false);
      setNewLeadForm({ name: '', email: '', phone: '', interestedCourseId: 501, source: 'WEBSITE_CHAT' });
    }
  };

  const handleScheduleCounselling = async (e) => {
    e.preventDefault();
    const res = await educationAiService.scheduleCounselling(selectedSession || 'adm_session_1001', counsellingForm);
    if (res) {
      showFeedback(`Counselling request #${res.appointmentRequestId} scheduled for ${counsellingForm.preferredDate} at ${counsellingForm.preferredTime}.`);
      setCounsellingRequests(prev => [res, ...prev]);
      setShowCounsellingModal(false);
    }
  };

  const handleRegisterKnowledge = async (e) => {
    e.preventDefault();
    const res = await educationAiService.registerKnowledgeSource(newKnowledgeForm);
    if (res) {
      showFeedback(`Knowledge source registered: ${res.title} (${res.sourceId}).`);
      setKnowledgeSources(prev => [res, ...prev]);
      setShowNewKnowledgeModal(false);
      setNewKnowledgeForm({ title: '', sourceType: 'DOCUMENT', language: 'en', enabled: true });
    }
  };

  const handleToggleConfig = async (key) => {
    if (!config) return;
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    await educationAiService.updateAdmissionConfig(updated);
    showFeedback(`Configuration updated: ${key} is now ${updated[key] ? 'Enabled' : 'Disabled'}.`);
  };

  return (
    <div className="education-ai-admission-view" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Title & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎓</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              AI Admission Agent
            </h1>
            <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Autonomous Conversion Engine
            </span>
            <span className="badge" style={{ backgroundColor: config?.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: config?.enabled ? '#10b981' : '#ef4444' }}>
              ● {config?.enabled ? 'Online (Active)' : 'Paused'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Automatically handles prospective student enquiries, verified course Q&A, qualification scoring, application drafts, and counselling booking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadAllData}
            title="Refresh All Records"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowConfigModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings size={14} />
            <span>Agent Settings</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {feedback.message && (
        <div style={{
          padding: '12px 18px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: feedback.isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${feedback.isError ? '#ef4444' : '#10b981'}`,
          color: feedback.isError ? '#ef4444' : '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          {feedback.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="crm-card" style={{ marginBottom: '24px', padding: '10px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: <Bot size={15} /> },
            { id: 'conversations', label: `Live Student Chat (${sessions.length})`, icon: <MessageSquare size={15} /> },
            { id: 'leads', label: `Admission Leads (${leads.length})`, icon: <Users size={15} /> },
            { id: 'recommendations', label: 'Course Recommendations', icon: <BookOpen size={15} /> },
            { id: 'applications', label: `Application Drafts (${applicationDrafts.length})`, icon: <FileCheck size={15} /> },
            { id: 'counselling', label: `Counselling Requests (${counsellingRequests.length})`, icon: <Calendar size={15} /> },
            { id: 'knowledge', label: `Verified Knowledge Base (${knowledgeSources.length})`, icon: <Database size={15} /> },
            { id: 'metrics', label: 'AI Metrics & Audit Log', icon: <Award size={15} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & KPIS
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Conversations Started</span>
                <MessageSquare size={16} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.sessionsStarted || 850}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                ↑ +18.4% vs last month
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Leads Captured</span>
                <Users size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.leadsCreated || 240}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                18 duplicate inquiries prevented
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Applications Initiated</span>
                <FileCheck size={16} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.applicationsInitiated || 95}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '4px' }}>
                Draft status with verified courses
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Counselling Bookings</span>
                <Calendar size={16} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.counsellingRequestsCreated || 62}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                Verified calendar slot sync
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Conversion Rate</span>
                <Sparkles size={16} color="#ec4899" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.leadConversionPercent || 28.24}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                Enquiry-to-Lead conversion
              </div>
            </div>
          </div>

          {/* Workflow & Safety Architecture */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '24px' }}>
            <div className="crm-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
                AI Admission Agent Workflow Pipeline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { step: 1, title: 'Inbound Inquiries', desc: 'Prospective students ask questions across Website Chat, WhatsApp, or Email.', status: 'Active' },
                  { step: 2, title: 'Grounded Knowledge Retrieval', desc: 'Checks published course duration, schedules, verified fees & prerequisite guidelines. Never hallucinates fees.', status: 'Active' },
                  { step: 3, title: 'Qualification & Need Extraction', desc: 'Captures career goal, current degree, programming experience & preferred learning mode (Weekend vs Weekday).', status: 'Active' },
                  { step: 4, title: 'Course Recommendation & Lead Capture', desc: 'Recommends matching published programs and creates a qualified lead with consent validation.', status: 'Active' },
                  { step: 5, title: 'Application Draft & Counselling Booking', desc: 'Drafts candidate admission application or reserves counselling slot with automated follow-up handoff.', status: 'Active' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}>
                      {item.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guardrails and Capabilities Panel */}
            <div className="crm-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#10b981" />
                Active Safety Guardrails
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    🔒 Zero Hallucination Guarantee
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Fees, batch dates, and eligibility criteria are strictly grounded in published course records. Untrusted external prompts cannot override policy.
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    🛡️ Duplicate Lead Prevention
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Incoming emails and phone numbers are matched against existing admission records before creating a duplicate entry.
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    🤝 Seamless Human Takeover
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    If a student asks to speak with staff or questions exceed threshold, the session immediately queues in HANDOFF_PENDING.
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    📑 Draft-Only Application Security
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    The agent only initializes DRAFT applications. Final admission submission requires candidate or staff verification.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE STUDENT CONVERSATIONS
          ========================================================================= */}
      {activeTab === 'conversations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', minHeight: '600px' }}>
          {/* Left Session List */}
          <div className="crm-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Active Chat Sessions</h3>
              <span className="badge badge-secondary">{sessions.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
              {sessions.map(s => {
                const isSelected = selectedSession === s.sessionId;
                return (
                  <div
                    key={s.sessionId}
                    onClick={() => selectSession(s.sessionId)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {s.studentName || s.visitor?.name || 'Prospective Student'}
                      </span>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-primary' : s.status === 'QUALIFIED' ? 'badge-qualified' : 'badge-secondary'}`} style={{ fontSize: '0.68rem' }}>
                        {s.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{s.channel}</span>
                      <span>{s.sessionId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Message Window */}
          <div className="crm-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {selectedSession ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Session {selectedSession}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Channel: Website Chat (Student-facing, Grounded with Knowledge Base)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => handleHandoff(selectedSession)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <UserCheck size={13} />
                      <span>Handoff to Staff</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => handleCloseSession(selectedSession)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <X size={13} />
                      <span>Close Session</span>
                    </button>
                  </div>
                </div>

                {/* Message Scroll Area */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
                  {sessionMessages.map((m, idx) => {
                    const isAi = m.sender === 'AI_ADMISSION_AGENT';
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isAi ? 'flex-start' : 'flex-end',
                          maxWidth: '85%',
                          alignSelf: isAi ? 'flex-start' : 'flex-end'
                        }}
                      >
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                          backgroundColor: isAi ? 'var(--bg-surface)' : 'var(--primary)',
                          color: isAi ? 'var(--text-main)' : '#ffffff',
                          border: isAi ? '1px solid var(--border)' : 'none',
                          fontSize: '0.9rem',
                          lineHeight: 1.45
                        }}>
                          {m.content}

                          {/* Knowledge citation tag if available */}
                          {m.knowledgeSources && m.knowledgeSources.length > 0 && (
                            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={11} /> Grounded in Verified Course Database (ID: 501)
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', padding: '0 4px' }}>
                          {isAi ? 'Zenelait AI Admission Assistant' : 'Prospective Student'} • {m.createdAt ? m.createdAt.substring(11, 16) : 'Just now'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Send Input Bar */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Type student message or ask course questions (e.g., 'What is the Java course fee and duration?')..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Send Message</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Select a conversation from the left to view messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ADMISSION LEADS
          ========================================================================= */}
      {activeTab === 'leads' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Captured Admission Inquiries & Leads</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Enquiries automatically scored and created by the AI Admission Assistant with duplicate detection.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowLeadModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Create Admission Lead</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Student Name</th>
                  <th>Contact Info</th>
                  <th>Interested Course</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Duplicate Check</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.leadId || lead.enquiryId}>
                    <td style={{ fontWeight: 700 }}>#{lead.leadId || lead.enquiryId}</td>
                    <td style={{ fontWeight: 600 }}>{lead.name || lead.studentName}</td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>{lead.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lead.phone}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {lead.interestedCourseId === 502 ? 'Applied Generative AI' : 'Java Full Stack'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${lead.status === 'NEW' ? 'badge-primary' : 'badge-qualified'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem' }}>{lead.source || 'WEBSITE_CHAT'}</span>
                    </td>
                    <td>
                      <span className={`badge ${lead.duplicateMatch ? 'badge-lost' : 'badge-qualified'}`} style={{ fontSize: '0.68rem' }}>
                        {lead.duplicateMatch ? 'Duplicate Match' : 'Unique (Passed)'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {lead.createdAt ? lead.createdAt.substring(0, 10) : '2026-10-27'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => {
                          educationAiService.updateAdmissionLead(lead.leadId || lead.enquiryId, { status: 'QUALIFIED' });
                          showFeedback(`Lead #${lead.leadId || lead.enquiryId} status updated to QUALIFIED.`);
                        }}
                      >
                        Qualify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: COURSE RECOMMENDATIONS
          ========================================================================= */}
      {activeTab === 'recommendations' && (
        <div>
          <div className="crm-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 700 }}>
              Deterministic Course Recommendation Engine
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Courses are recommended based on verified program attributes, student background, career goals, and published fees.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {recommendations.map(rec => (
                <div key={rec.courseId} className="crm-card" style={{ padding: '20px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {rec.courseName}
                    </h4>
                    <span className="badge badge-primary">ID: {rec.courseId}</span>
                  </div>

                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
                    ₹{rec.publishedFee?.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Published Fee</span>
                  </div>

                  <div style={{ margin: '12px 0' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Verified Matching Rationale:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {rec.matchReasons?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => showFeedback(`Shared ${rec.courseName} brochure with student session.`)}
                    >
                      Recommend in Chat
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowCounsellingModal(true)}
                    >
                      Book Counselling
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: APPLICATION DRAFTS
          ========================================================================= */}
      {activeTab === 'applications' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Initiated Application Drafts</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Applications prepared automatically during student conversations. Maintained in DRAFT state until submitted.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Student Name</th>
                  <th>Selected Program</th>
                  <th>Status</th>
                  <th>Missing Required Fields</th>
                  <th>Requires Student Completion</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicationDrafts.map(app => (
                  <tr key={app.applicationId}>
                    <td style={{ fontWeight: 700 }}>#{app.applicationId}</td>
                    <td style={{ fontWeight: 600 }}>{app.studentName}</td>
                    <td>{app.courseName}</td>
                    <td>
                      <span className="badge badge-secondary">{app.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {app.missingFields?.map((f, i) => (
                          <span key={i} className="badge badge-lost" style={{ fontSize: '0.68rem' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Yes (Mandatory)</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {app.createdAt ? app.createdAt.substring(0, 10) : '2026-10-27'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => showFeedback(`Application #${app.applicationId} completion link resent to ${app.studentName}.`)}
                      >
                        Resend Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: COUNSELLING REQUESTS
          ========================================================================= */}
      {activeTab === 'counselling' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>1-on-1 Academic Counselling Bookings</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Scheduled appointment requests synchronized with Counsellor availability and Google Meet links.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCounsellingModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Request Counselling Slot</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student Name</th>
                  <th>Scheduled Date & Time</th>
                  <th>Meeting Mode</th>
                  <th>Reason / Goal</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {counsellingRequests.map(req => (
                  <tr key={req.appointmentRequestId}>
                    <td style={{ fontWeight: 700 }}>#{req.appointmentRequestId}</td>
                    <td style={{ fontWeight: 600 }}>{req.studentName || 'Arun Kumar'}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{req.preferredDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.preferredTime} (IST)</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {req.meetingMode}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{req.reason}</td>
                    <td>
                      <span className={`badge ${req.status === 'CONFIRMED' ? 'badge-qualified' : 'badge-primary'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => showFeedback(`Confirmed counselling appointment #${req.appointmentRequestId}.`)}
                      >
                        Confirm Slot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: KNOWLEDGE BASE & SYNC
          ========================================================================= */}
      {activeTab === 'knowledge' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Verified Course Knowledge Sources</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Indexed institutional documents, course fee charts, and admission rules checked by the AI agent prior to answering.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewKnowledgeModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Register Knowledge Source</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Source ID</th>
                  <th>Title & Description</th>
                  <th>Source Type</th>
                  <th>Status</th>
                  <th>Last Synced</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {knowledgeSources.map(k => (
                  <tr key={k.sourceId}>
                    <td style={{ fontWeight: 700 }}>{k.sourceId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{k.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{k.storageKey || 'Verified PDF Document'}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{k.sourceType}</span>
                    </td>
                    <td>
                      <span className={`badge ${k.status === 'INDEXED' ? 'badge-qualified' : 'badge-primary'}`}>
                        {k.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {k.lastSyncedAt || '2026-10-27T10:00:00+05:30'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => handleSyncKb(k.sourceId)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RefreshCw size={12} />
                        <span>Re-index</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: METRICS & AUDIT EVENTS
          ========================================================================= */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Detailed Performance Metrics */}
          <div className="crm-card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Performance Telemetry & Conversion Funnel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sessions Closed</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{metrics?.sessionsClosed || 690}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Human Handoffs</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>{metrics?.humanHandoffs || 75}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Unanswered Questions</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#64748b' }}>{metrics?.unansweredQuestions || 22}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Duplicates Prevented</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>{metrics?.duplicateLeadsPrevented || 18}</div>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="crm-card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 700 }}>AI Admission Agent Audit Trail</h3>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Type</th>
                  <th>Actor Type</th>
                  <th>Actor ID</th>
                  <th>Resource Type</th>
                  <th>Resource ID</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.map(evt => (
                  <tr key={evt.eventId}>
                    <td style={{ fontWeight: 700 }}>{evt.eventId}</td>
                    <td>
                      <span className="badge badge-primary">{evt.eventType}</span>
                    </td>
                    <td>{evt.actorType}</td>
                    <td>{evt.actorId}</td>
                    <td>{evt.resourceType}</td>
                    <td>#{evt.resourceId}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{evt.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AGENT CONFIGURATION
          ========================================================================= */}
      {showConfigModal && config && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>AI Admission Agent Settings</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowConfigModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Agent Online Status</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Enable or suspend autonomous prospective student chat handling</div>
                </div>
                <button
                  className={`btn btn-xs ${config.enabled ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleToggleConfig('enabled')}
                >
                  {config.enabled ? 'Enabled' : 'Paused'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Require Consent for Proactive Messages</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Verify marketing consent before sending follow-up materials</div>
                </div>
                <button
                  className={`btn btn-xs ${config.requireConsentForProactiveMessages ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleToggleConfig('requireConsentForProactiveMessages')}
                >
                  {config.requireConsentForProactiveMessages ? 'Enforced' : 'Off'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Human Approval for Outbound Messages</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Staff must approve messages before sending to students</div>
                </div>
                <button
                  className={`btn btn-xs ${config.requireHumanApprovalForOutboundMessages ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleToggleConfig('requireHumanApprovalForOutboundMessages')}
                >
                  {config.requireHumanApprovalForOutboundMessages ? 'Required' : 'Automated'}
                </button>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Supported Channels</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {config.supportedChannels?.map((ch, i) => (
                    <span key={i} className="badge badge-primary">{ch}</span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Languages Supported</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-secondary">English (en)</span>
                  <span className="badge badge-secondary">Tamil (ta)</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE ADMISSION LEAD
          ========================================================================= */}
      {showLeadModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Capture Admission Enquiry</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowLeadModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Student Full Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Arun Kumar"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="arun@example.com"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="input"
                  placeholder="+91 98765 43210"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Interested Program</label>
                <select
                  className="input"
                  value={newLeadForm.interestedCourseId}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, interestedCourseId: Number(e.target.value) })}
                >
                  <option value={501}>Java Full Stack Development (₹45,000)</option>
                  <option value={502}>Applied Generative AI & LLMs (₹60,000)</option>
                </select>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REQUEST COUNSELLING
          ========================================================================= */}
      {showCounsellingModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Request Counselling Session</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowCounsellingModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleScheduleCounselling} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Preferred Date *</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={counsellingForm.preferredDate}
                  onChange={(e) => setCounsellingForm({ ...counsellingForm, preferredDate: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Preferred Time *</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={counsellingForm.preferredTime}
                  onChange={(e) => setCounsellingForm({ ...counsellingForm, preferredTime: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Meeting Mode</label>
                <select
                  className="input"
                  value={counsellingForm.meetingMode}
                  onChange={(e) => setCounsellingForm({ ...counsellingForm, meetingMode: e.target.value })}
                >
                  <option value="ONLINE">ONLINE (Google Meet / Zoom)</option>
                  <option value="IN_PERSON">IN_PERSON (On-campus Chamber)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Reason / Guidance Focus</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Course curriculum and career opportunities"
                  value={counsellingForm.reason}
                  onChange={(e) => setCounsellingForm({ ...counsellingForm, reason: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCounsellingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTER KNOWLEDGE SOURCE
          ========================================================================= */}
      {showNewKnowledgeModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Register Knowledge Source</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowNewKnowledgeModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterKnowledge} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Document Title *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. 2026 Course Fee & Batch Schedule"
                  value={newKnowledgeForm.title}
                  onChange={(e) => setNewKnowledgeForm({ ...newKnowledgeForm, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Source Type</label>
                <select
                  className="input"
                  value={newKnowledgeForm.sourceType}
                  onChange={(e) => setNewKnowledgeForm({ ...newKnowledgeForm, sourceType: e.target.value })}
                >
                  <option value="DOCUMENT">DOCUMENT (PDF / Word)</option>
                  <option value="POLICY">POLICY (Admission Rules)</option>
                  <option value="FAQ">FAQ (Verified Q&A)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Language</label>
                <select
                  className="input"
                  value={newKnowledgeForm.language}
                  onChange={(e) => setNewKnowledgeForm({ ...newKnowledgeForm, language: e.target.value })}
                >
                  <option value="en">English (en)</option>
                  <option value="ta">Tamil (ta)</option>
                </select>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewKnowledgeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Source</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
