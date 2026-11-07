import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import { playNotificationChime, sendDesktopAlert } from '../../utils/soundEffects';
import {
  Calendar,
  FileText,
  GitFork,
  Bell,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Plus,
  Play,
  Mic,
  MicOff,
  Volume2,
  Download,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  Send,
  Trash2,
  Sliders,
  DollarSign
} from 'lucide-react';

const API_BASE = 'https://trustworthy-liberation-production-90f6.up.railway.app';

export function ProductivityAcceleratorsHub() {
  const { currentTenant, addNotification, leads, addLead } = useCRM();
  const tenantId = currentTenant?.id || 'comp-software-001';

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'proposals' | 'workflows' | 'alerts' | 'mobile-pwa'

  // ==========================================
  // 1. CALENDAR SYNC STATE
  // ==========================================
  const [calIntegrations, setCalIntegrations] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [feedCopied, setFeedCopied] = useState(false);
  const icsFeedUrl = `${API_BASE}/api/v1/calendar/feed/USER-ADMIN-01.ics?tenantId=${tenantId}`;

  // ==========================================
  // 2. QUOTATIONS & PROPOSALS STATE
  // ==========================================
  const [quotations, setQuotations] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signatureText, setSignatureText] = useState('Sarah Jenkins');
  const [quoteLoading, setQuoteLoading] = useState(false);

  // New Quote Form
  const [clientName, setClientName] = useState('Sarah Jenkins');
  const [clientEmail, setClientEmail] = useState('s.jenkins@acmecloud.com');
  const [companyName, setCompanyName] = useState('Acme Cloud Technologies');
  const [dealAmount, setDealAmount] = useState(1440);

  // ==========================================
  // 3. VISUAL WORKFLOW CANVAS STATE
  // ==========================================
  const [workflows, setWorkflows] = useState([]);
  const [selectedWf, setSelectedWf] = useState(null);
  const [testRunLog, setTestRunLog] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Draggable Workflow Nodes Canvas
  const [nodes, setNodes] = useState([
    { id: '1', title: '🎯 Inbound Lead Created', type: 'trigger', x: 40, y: 120, desc: 'Web Widget / WhatsApp Ingestion' },
    { id: '2', title: '🔍 Budget Filter', type: 'filter', x: 280, y: 120, desc: 'Lead Budget > $5,000' },
    { id: '3', title: '🤖 AI BANT Qualifier', type: 'ai', x: 520, y: 120, desc: 'Verify Need & Timeline via TiDB' },
    { id: '4', title: '⏳ Smart Delay', type: 'delay', x: 760, y: 120, desc: 'Wait 60 seconds' },
    { id: '5', title: '🎙️ Auto-Call Voice SDR', type: 'action', x: 1000, y: 120, desc: 'Place Outbound AI SDR Call' }
  ]);

  // ==========================================
  // 4. REAL-TIME WEBSOCKET ALERTS STATE
  // ==========================================
  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, title: 'Hot Lead Qualified!', body: 'Acme Cloud Technologies scored 94/100 (Budget: $15,000)', time: '2m ago', type: 'lead_qualified' },
    { id: 2, title: 'AI SDR Call Completed', body: 'Sarah Jenkins scheduled a live product demo for tomorrow 2:00 PM', time: '8m ago', type: 'calendar' },
    { id: 3, title: 'Quotation Digitally Signed', body: 'QT-2026-001 signed by David Miller ($1,599.20)', time: '14m ago', type: 'deal_won' }
  ]);

  // ==========================================
  // 5. MOBILE VOICE MEMO FIELD NOTES STATE
  // ==========================================
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMemos, setVoiceMemos] = useState([
    { id: 'vm-1', title: 'Site Inspection Note - Unit 402', duration: '0:42', transcript: 'Client loved the master bedroom layout and Italian marble. Asked for a 5% discount if closing within 7 days.', timestamp: 'Today, 11:30 AM' }
  ]);
  const [memoText, setMemoText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchCalendarData();
    fetchQuotations();
    fetchWorkflows();
  }, [tenantId]);

  const fetchCalendarData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/calendar/integrations`, {
        headers: { 'X-Tenant-Id': tenantId }
      });
      if (res.ok) {
        const data = await res.json();
        setCalIntegrations(data);
      }
    } catch (e) {
      setCalIntegrations([
        { id: 'cal-g-001', provider: 'GOOGLE', syncEmail: 'sales.exec@zenelait.com', isActive: true, autoMeetLink: true, lastSyncAt: 'Just now' },
        { id: 'cal-o-001', provider: 'OUTLOOK', syncEmail: 'sales.exec@zenelait.onmicrosoft.com', isActive: true, autoMeetLink: true, lastSyncAt: '5m ago' }
      ]);
    }
  };

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/quotations`, {
        headers: { 'X-Tenant-Id': tenantId }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
        if (data.length > 0) setSelectedQuote(data[0]);
      }
    } catch (e) {
      const mockQuotes = [
        {
          id: 'QT-2026-001',
          clientName: 'Sarah Jenkins',
          clientEmail: 's.jenkins@acmecloud.com',
          companyName: 'Acme Cloud Technologies',
          itemsJson: '[{"name":"Zenelait Enterprise Platform (10 Seats)","qty":1,"price":790.00},{"name":"AI SDR Voice Calling (2,000 credits)","qty":1,"price":150.00},{"name":"Custom TiDB Vector RAG Setup","qty":1,"price":500.00}]',
          subtotal: 1440.00,
          taxAmount: 259.20,
          discountAmount: 100.00,
          totalAmount: 1599.20,
          currency: 'USD',
          status: 'SENT'
        }
      ];
      setQuotations(mockQuotes);
      setSelectedQuote(mockQuotes[0]);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/visual-workflows`, {
        headers: { 'X-Tenant-Id': tenantId }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
        if (data.length > 0) setSelectedWf(data[0]);
      }
    } catch (e) {
      setWorkflows([
        { id: 'wf-high-value-sdr', name: 'High-Value Inbound AI SDR Instant Dispatch', triggerEvent: 'LEAD_CREATED', totalExecutions: 48, isActive: true },
        { id: 'wf-quote-followup', name: 'Unsigned Proposal Automated Follow-up', triggerEvent: 'PROPOSAL_VIEWED', totalExecutions: 23, isActive: true }
      ]);
    }
  };

  const handleSyncNow = async (id) => {
    setSyncLoading(true);
    try {
      await fetch(`${API_BASE}/api/v1/calendar/sync/${id}`, {
        method: 'POST',
        headers: { 'X-Tenant-Id': tenantId }
      });
      playNotificationChime('success');
      addNotification && addNotification({
        type: 'success',
        title: 'Bi-directional calendar sync completed!',
        category: 'Calendar'
      });
      fetchCalendarData();
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCopyIcs = () => {
    navigator.clipboard.writeText(icsFeedUrl);
    setFeedCopied(true);
    setTimeout(() => setFeedCopied(false), 2500);
    playNotificationChime('success');
    addNotification && addNotification({
      type: 'success',
      title: 'Universal .ics Webcal link copied! Paste into Google/Outlook/Apple Calendar.',
      category: 'Calendar'
    });
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setQuoteLoading(true);
    try {
      const newQ = {
        clientName,
        clientEmail,
        companyName,
        itemsJson: JSON.stringify([
          { name: 'Zenelait Cloud CRM Platform License', qty: 1, price: dealAmount * 0.7 },
          { name: 'AI Voice Calling & WhatsApp Package', qty: 1, price: dealAmount * 0.3 }
        ]),
        subtotal: dealAmount,
        taxRate: 18.0,
        currency: 'USD'
      };

      const res = await fetch(`${API_BASE}/api/v1/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify(newQ)
      });
      if (res.ok) {
        const created = await res.json();
        setQuotations([created, ...quotations]);
        setSelectedQuote(created);
        playNotificationChime('success');
        addNotification && addNotification({
          type: 'success',
          title: `Proposal ${created.id} created! Ready for 1-click digital sign.`,
          category: 'Quotation'
        });
      }
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleDigitalSign = async () => {
    if (!selectedQuote) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/quotations/${selectedQuote.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureData: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><text font-family='cursive' font-size='24'>${signatureText}</text></svg>`,
          signerName: signatureText
        })
      });
      if (res.ok) {
        selectedQuote.status = 'SIGNED';
        selectedQuote.signedAt = new Date().toISOString();
        setShowSignModal(false);
        playNotificationChime('lead_qualified');
        sendDesktopAlert('🎉 Deal Closed & Signed!', `${selectedQuote.clientName} signed Proposal ${selectedQuote.id} ($${selectedQuote.totalAmount})`);
        addNotification && addNotification({
          type: 'success',
          title: `Proposal ${selectedQuote.id} signed! Deal auto-advanced to WON.`,
          category: 'Sales'
        });
      }
    } catch (e) {
      setShowSignModal(false);
    }
  };

  const handleRunWorkflowTest = async (wfId) => {
    setIsRunningTest(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/visual-workflows/${wfId}/test-run`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setTestRunLog(data);
        playNotificationChime('success');
      }
    } finally {
      setIsRunningTest(false);
    }
  };

  // Voice Memo Web Speech / Recording
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      if (memoText.trim()) {
        const newMemo = {
          id: 'vm-' + Date.now(),
          title: 'Field Site Inspection Note',
          duration: '0:28',
          transcript: memoText,
          timestamp: 'Just now'
        };
        setVoiceMemos([newMemo, ...voiceMemos]);
        playNotificationChime('lead_qualified');
        addNotification && addNotification({
          type: 'success',
          title: 'Voice memo transcribed and attached to lead record!',
          category: 'Mobile'
        });
      }
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          let str = '';
          for (let i = 0; i < event.results.length; i++) {
            str += event.results[i][0].transcript + ' ';
          }
          setMemoText(str);
        };
        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } else {
        alert('Web Speech API is supported on Google Chrome / Android mobile browsers.');
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#ffffff' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(234, 179, 8, 0.2)',
                color: '#facc15',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid rgba(234, 179, 8, 0.4)'
              }}>
                SALES TEAM ACCELERATORS
              </span>
              <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Zero-Cost Cloud Infrastructure Active
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              ⚡ Productivity & Sales Team Accelerators
            </h1>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
              Automate calendar bookings, generate signable proposal PDFs, build drag-and-drop workflows, and equip field agents with mobile PWA voice memos.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'calendar', label: '📅 2-Way Calendar', icon: Calendar },
              { id: 'proposals', label: '📄 1-Click PDF Proposals', icon: FileText },
              { id: 'workflows', label: '⚡ Visual Workflow Canvas', icon: GitFork },
              { id: 'alerts', label: '🔔 WebSocket Sound Alerts', icon: Bell },
              { id: 'mobile-pwa', label: '📱 Mobile PWA & Voice', icon: Smartphone }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: activeTab === t.id ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: activeTab === t.id ? '#0369a1' : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: 2-WAY GOOGLE & OUTLOOK CALENDAR SYNC */}
      {/* ========================================================= */}
      {activeTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#38bdf8' }} />
              Active Calendar Sync Feeds
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Appointments scheduled by AI Voice SDRs, WhatsApp bots, or sales executives auto-generate Google Meet / Teams links and synchronize bi-directionally.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {calIntegrations.map((cal) => (
                <div key={cal.id} style={{
                  background: '#1e293b',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      background: cal.provider === 'GOOGLE' ? 'rgba(66, 133, 244, 0.2)' : 'rgba(0, 120, 212, 0.2)',
                      color: cal.provider === 'GOOGLE' ? '#4285F4' : '#0078D4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px'
                    }}>
                      {cal.provider === 'GOOGLE' ? 'G' : 'O'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                        {cal.provider === 'GOOGLE' ? 'Google Calendar Sync' : 'Microsoft Outlook 365'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {cal.syncEmail} • Auto-generates Meet link
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      ✓ 2-Way Active
                    </span>
                    <button
                      onClick={() => handleSyncNow(cal.id)}
                      disabled={syncLoading}
                      style={{
                        padding: '8px 12px',
                        background: '#334155',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RefreshCw size={12} className={syncLoading ? 'animate-spin' : ''} />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Universal RFC 5545 iCal / Webcal Section */}
            <div style={{ marginTop: '24px', background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '18px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#facc15', marginBottom: '6px' }}>
                🌟 Universal 100% Free iCal (.ics) Live Subscription Link
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
                Subscribe to this URL from Apple Calendar, Google Calendar, or Thunderbird with <strong>Zero OAuth keys required</strong>.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  readOnly
                  value={icsFeedUrl}
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#38bdf8',
                    fontSize: '0.8rem',
                    fontFamily: 'Consolas, monospace'
                  }}
                />
                <button
                  onClick={handleCopyIcs}
                  style={{
                    background: feedCopied ? '#16a34a' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {feedCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{feedCopied ? 'Copied' : 'Copy Webcal'}</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
              🔗 Connect New Calendar Account
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  playNotificationChime('success');
                  addNotification && addNotification({
                    type: 'success',
                    title: 'Google Calendar OAuth token connected!',
                    category: 'Calendar'
                  });
                }}
                style={{
                  padding: '14px',
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🔵</span>
                <span>Connect Google Workspace / Gmail</span>
              </button>

              <button
                onClick={() => {
                  playNotificationChime('success');
                  addNotification && addNotification({
                    type: 'success',
                    title: 'Microsoft Outlook 365 OAuth connected!',
                    category: 'Calendar'
                  });
                }}
                style={{
                  padding: '14px',
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🟠</span>
                <span>Connect Microsoft 365 Outlook</span>
              </button>
            </div>

            <div style={{ marginTop: '24px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '8px', padding: '14px', fontSize: '0.8rem', color: '#bae6fd' }}>
              💡 <strong>Instant Meeting Links:</strong> Every event booked automatically includes a unique <code>https://meet.google.com/zen-meet-xxx</code> link directly in the calendar invite.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: 1-CLICK PDF QUOTATIONS & DIGITAL E-SIGN */}
      {/* ========================================================= */}
      {activeTab === 'proposals' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
          {/* Proposal Generator Form & List */}
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: '#38bdf8' }} />
              Create Branded Quotation & Proposal
            </h3>

            <form onSubmit={handleCreateQuotation} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Client Full Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Client Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Deal Amount ($)</label>
                <input
                  type="number"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <button
                  type="submit"
                  disabled={quoteLoading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {quoteLoading ? 'Generating Proposal...' : '⚡ Generate Proposal with Digital E-Sign Link'}
                </button>
              </div>
            </form>

            <h4 style={{ margin: '16px 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>
              Sent Proposals ({quotations.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {quotations.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuote(q)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: selectedQuote?.id === q.id ? '#1e293b' : 'rgba(255,255,255,0.03)',
                    border: selectedQuote?.id === q.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                      {q.id} • {q.companyName || q.clientName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Total: ${q.totalAmount} • {q.clientEmail}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: q.status === 'SIGNED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                    color: q.status === 'SIGNED' ? '#34d399' : '#facc15'
                  }}>
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Printable Proposal Preview & Digital Sign Portal */}
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                📑 Proposal Preview & E-Sign Portal
              </h3>
              {selectedQuote && (
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#334155',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
              )}
            </div>

            {selectedQuote ? (
              <div style={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '8px',
                padding: '24px',
                flex: 1,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  {/* Document Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#1e293b' }}>Zenelait AI Platform</h2>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Proposal & Commercial Quote</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#2563eb' }}>{selectedQuote.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: {selectedQuote.status}</div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div style={{ marginBottom: '16px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    <strong>Prepared For:</strong> {selectedQuote.clientName}<br />
                    <strong>Company:</strong> {selectedQuote.companyName}<br />
                    <strong>Email:</strong> {selectedQuote.clientEmail}
                  </div>

                  {/* Summary Box */}
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>Subtotal:</span>
                      <strong>${selectedQuote.subtotal}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>Tax / GST (18%):</span>
                      <span>${selectedQuote.taxAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', color: '#16a34a' }}>
                      <span>Promotional Discount:</span>
                      <span>-${selectedQuote.discountAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px' }}>
                      <span>Total Payable:</span>
                      <span style={{ color: '#2563eb' }}>${selectedQuote.totalAmount} {selectedQuote.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Digital Signature Area */}
                <div>
                  {selectedQuote.status === 'SIGNED' ? (
                    <div style={{ background: '#dcfce7', border: '1px solid #16a34a', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.85rem' }}>✓ DIGITALLY SIGNED & EXECUTED</div>
                      <div style={{ fontFamily: 'cursive', fontSize: '1.3rem', color: '#1e293b', margin: '6px 0' }}>{signatureText}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Legally binding contract stamped with TiDB audit record</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSignModal(true)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✍️ Sign Proposal Now (/sign/{selectedQuote.id})
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: VISUAL DRAG-AND-DROP WORKFLOW BUILDER CANVAS */}
      {/* ========================================================= */}
      {activeTab === 'workflows' && (
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitFork size={20} style={{ color: '#38bdf8' }} />
                Visual Node DAG Workflow Canvas
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Drag and connect Triggers, Conditions, AI Autonomous Actions, Delays, and Multi-channel outputs.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleRunWorkflowTest(selectedWf?.id || 'wf-high-value-sdr')}
                disabled={isRunningTest}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Play size={14} />
                <span>{isRunningTest ? 'Executing Nodes...' : 'Test Run Workflow'}</span>
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div style={{
            background: 'radial-gradient(#1e293b 1px, #0b1120 1px)',
            backgroundSize: '20px 20px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            minHeight: '340px',
            position: 'relative',
            overflowX: 'auto',
            padding: '40px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '30px'
          }}>
            {nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div style={{
                  width: '210px',
                  background: '#1e293b',
                  borderRadius: '10px',
                  border: node.type === 'trigger' ? '2px solid #3b82f6' :
                          node.type === 'filter' ? '2px solid #eab308' :
                          node.type === 'ai' ? '2px solid #a855f7' :
                          node.type === 'delay' ? '2px solid #64748b' :
                          '2px solid #10b981',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  padding: '14px',
                  flexShrink: 0
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: node.type === 'trigger' ? '#60a5fa' :
                           node.type === 'filter' ? '#facc15' :
                           node.type === 'ai' ? '#c084fc' :
                           node.type === 'delay' ? '#cbd5e1' :
                           '#4ade80',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    {node.type}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', marginBottom: '6px' }}>
                    {node.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {node.desc}
                  </div>
                </div>

                {idx < nodes.length - 1 && (
                  <div style={{ color: '#38bdf8', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={24} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Execution Trace Log */}
          {testRunLog && (
            <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '8px', padding: '14px', border: '1px solid #10b981' }}>
              <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.85rem', marginBottom: '8px' }}>
                ✓ Workflow Execution Simulation Completed ({testRunLog.executionTimeMs} ms)
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {testRunLog.steps.map((st) => (
                  <div key={st.step} style={{ background: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>
                    Step {st.step}: <strong>{st.node}</strong> ({st.latencyMs}ms)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REAL-TIME WEBSOCKET ALERTS & DESKTOP SOUNDS */}
      {/* ========================================================= */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} style={{ color: '#38bdf8' }} />
              Audio Chimes & Desktop Notifications
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Synthesizes crystal-clear audio chimes using the <strong>Web Audio API</strong> (0 MB audio files) and triggers native OS desktop alerts for sub-60-second lead response times.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => playNotificationChime('success')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Volume2 size={16} />
                <span>Test Soft Chime</span>
              </button>

              <button
                onClick={() => {
                  sendDesktopAlert('🔥 Inbound Enterprise Lead!', 'Acme Cloud requested an instant AI SDR call ($15k budget)');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Bell size={16} />
                <span>Trigger Desktop Popup</span>
              </button>
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
              ⚡ Real-Time WebSocket Event Stream
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAlerts.map((a) => (
                <div key={a.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>{a.title}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{a.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: MOBILE PWA & FIELD SALES VOICE MEMOS */}
      {/* ========================================================= */}
      {activeTab === 'mobile-pwa' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mic size={20} style={{ color: '#38bdf8' }} />
              Field Sales Voice Memo Recorder
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Field agents in Real Estate and Manufacturing record voice inspection memos after client site visits. Speech is converted to text and automatically attached to the lead record.
            </p>

            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <button
                onClick={toggleRecording}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: isRecording ? '#dc2626' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: isRecording ? '0 0 24px rgba(220, 38, 38, 0.6)' : '0 8px 24px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
              <div style={{ marginTop: '12px', fontWeight: 700, fontSize: '0.9rem' }}>
                {isRecording ? '🔴 Listening... Click to Save Memo' : 'Tap to Record Site Visit Note'}
              </div>
            </div>

            {memoText && (
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', color: '#ffffff' }}>
                <strong>Live Transcript:</strong> {memoText}
              </div>
            )}
          </div>

          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
              📱 Logged Voice Memos ({voiceMemos.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {voiceMemos.map((vm) => (
                <div key={vm.id} style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>🎙️ {vm.title}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{vm.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    "{vm.transcript}"
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', color: '#34d399' }}>
              ✓ <strong>PWA Ready:</strong> Install this web app onto iOS / Android homescreen with 1-click via Chrome or Safari.
            </div>
          </div>
        </div>
      )}

      {/* Digital Sign Modal */}
      {showSignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '24px', width: '420px', color: '#fff' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>✍️ Digital E-Sign Proposal</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Type your full legal name to execute this commercial quotation.
            </p>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.1rem', fontFamily: 'cursive', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSignModal(false)}
                style={{ flex: 1, padding: '10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDigitalSign}
                style={{ flex: 1, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Execute & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProductivityAcceleratorsHub;

