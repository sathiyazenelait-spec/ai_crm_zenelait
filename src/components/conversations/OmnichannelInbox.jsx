import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { ChannelBadge } from '../common/ChannelBadge';
import {
  Search,
  Send,
  Bot,
  UserCheck,
  Sparkles,
  Paperclip,
  CheckCircle,
  Clock,
  MoreVertical,
  Radio,
  Shield,
  AlertTriangle,
  Lock,
  Headphones,
  FileText,
  ArrowUpRight
} from 'lucide-react';

export function OmnichannelInbox() {
  const {
    conversations,
    activeChatId,
    setActiveChatId,
    sendChatMessage,
    currentUserRole,
    currentRolePermissions,
    escalateConversation,
    auditedPrivacyAccess,
    setAuditedPrivacyAccess,
    activeIndustryId,
    currentTenant
  } = useCRM();

  const [channelFilter, setChannelFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [inputText, setInputText] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const [internalNote, setInternalNote] = useState('');
  const [showNoteBox, setShowNoteBox] = useState(false);

  const channels = ['All', 'Website', 'WhatsApp', 'Email', 'Instagram', 'Phone'];

  const isSupportAgent = currentRolePermissions?.isSupportAgent || currentUserRole.includes('Support');
  const isSuperAdmin = currentRolePermissions?.isSuperAdmin || currentUserRole.includes('Super Admin');
  const isAnalyst = currentRolePermissions?.isReadOnly;

  const filteredConversations = conversations.filter(c => {
    const matchesChannel = channelFilter === 'All' || c.channel === channelFilter;
    const matchesSearch =
      c.customer.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const activeConv = conversations.find(c => c.id === activeChatId) || conversations[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isAnalyst) return;
    sendChatMessage(activeConv.id, inputText, isAiMode ? 'ai' : 'user');
    setInputText('');
  };

  const handleQuickSuggestion = (text) => {
    if (isAnalyst) return;
    sendChatMessage(activeConv.id, text, 'ai');
  };

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1>Conversations & Omnichannel Inbox</h1>
            <span
              className="badge"
              style={{
                backgroundColor: isSupportAgent ? 'rgba(16, 185, 129, 0.12)' :
                  isSuperAdmin ? 'rgba(139, 92, 246, 0.12)' :
                  'rgba(37, 99, 235, 0.12)',
                color: isSupportAgent ? '#10b981' :
                  isSuperAdmin ? '#8b5cf6' :
                  '#2563eb',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            >
              Role: {currentUserRole}
            </span>
          </div>
          <p>Unified Omnichannel Inbox with autonomous AI co-pilot and human agent handover</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-qualified">
            <Radio size={12} className="pulse" /> Live WebSocket Connected
          </span>
        </div>
      </div>

      {/* Super Admin Privacy Guardrail Notice */}
      {isSuperAdmin && !auditedPrivacyAccess && (
        <div
          className="crm-card"
          style={{
            padding: '16px 20px',
            marginBottom: '16px',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Lock size={20} style={{ color: '#8b5cf6' }} />
            <div>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                Platform Super Admin Privacy Guardrail Active
              </strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                As Platform Super Admin, you do not routinely inspect private tenant customer conversations. Any exceptional troubleshooting access is audited and logged in security compliance records.
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-primary"
            style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', fontSize: '0.75rem' }}
            onClick={() => setAuditedPrivacyAccess(true)}
          >
            Request Audited Support Clearance
          </button>
        </div>
      )}

      {/* Support Agent Fast Tools Bar */}
      {isSupportAgent && (
        <div
          className="crm-card"
          style={{
            padding: '12px 18px',
            marginBottom: '16px',
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Headphones size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Customer Support Console: Handling Ticket #{activeConv.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setShowNoteBox(!showNoteBox)}
            >
              <FileText size={13} /> {showNoteBox ? 'Hide Note' : '+ Add Internal Note'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => escalateConversation(activeConv.id, 'Customer requested senior specialist assistance')}
            >
              <AlertTriangle size={13} /> Escalate Ticket
            </button>
          </div>
        </div>
      )}

      {/* Channel Filters Bar */}
      <div className="crm-card" style={{ marginBottom: '16px', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {channels.map((ch) => (
              <button
                key={ch}
                className={`btn btn-sm ${channelFilter === ch ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChannelFilter(ch)}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="search-bar-wrapper" style={{ maxWidth: '240px' }}>
            <Search size={14} />
            <input
              type="text"
              className="search-bar-input"
              style={{ padding: '6px 12px 6px 34px', fontSize: '0.8rem' }}
              placeholder="Filter threads..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="inbox-layout">
        {/* Left Thread List */}
        <div className="inbox-thread-list">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConv.id;
            return (
              <div
                key={conv.id}
                className={`inbox-thread-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveChatId(conv.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar avatar-sm">
                      {conv.customer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{conv.customer}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{conv.time}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                  <ChannelBadge channel={conv.channel} />
                  <StatusBadge status={conv.status} />
                </div>

                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    margin: 0
                  }}
                >
                  {conv.lastMessage}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Active Chat Panel */}
        <div className="chat-panel">
          {/* Chat Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar avatar-md">
                {activeConv.customer.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>{activeConv.customer}</h3>
                  <ChannelBadge channel={activeConv.channel} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {activeConv.email} • Assigned to: <strong>{activeConv.assignedTo}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!isAnalyst && (
                <button
                  className={`btn btn-sm ${!isAiMode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setIsAiMode(!isAiMode)}
                  title="Take over conversation or switch back to AI Auto-pilot"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                >
                  <Bot size={14} />
                  <span>{isAiMode ? 'AI Auto-Pilot ON' : '👤 Human Takeover Active'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Internal Notes Drawer (Support Agent) */}
          {showNoteBox && (
            <div style={{ padding: '12px 18px', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '0.78rem' }}
                placeholder="Write internal resolution note (visible only to team)..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (!internalNote.trim()) return;
                  setInternalNote('');
                  setShowNoteBox(false);
                }}
              >
                Save Note
              </button>
            </div>
          )}

          {/* Messages Box */}
          <div className="chat-messages-container">
            {activeConv.messages?.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, marginBottom: '2px', textTransform: 'capitalize' }}>
                  {msg.sender === 'ai' ? '🤖 AI Agent' : msg.sender === 'customer' ? activeConv.customer : '👤 Live Support Agent'}
                </div>
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.65, textAlign: 'right', marginTop: '4px' }}>
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic 9-Tenant AI Suggested Response Chips */}
          {!isAnalyst && (
            <div style={{ padding: '8px 20px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.725rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                <Sparkles size={13} style={{ color: 'var(--primary)' }} />
                <span>AI {currentTenant?.name || 'Tenant'} Suggestions:</span>
              </div>
              {(
                {
                  real_estate: [
                    'Schedule weekend site visit with chauffeur pick-up',
                    'Share 3BHK floor plan & RERA price sheet',
                    'Connect with HDFC for pre-approved home loan rates'
                  ],
                  hospitals: [
                    'Confirm doctor OPD consultation slot',
                    'Send 12-hour fasting guidelines for lab test',
                    'Dispatch 24/7 emergency clinic location pin'
                  ],
                  education: [
                    'Dispatch Executive Cohort syllabus & project guide',
                    'Set up 9-month zero-interest EMI installment plan',
                    'Schedule Academic Counselor roadmap call'
                  ],
                  ecommerce: [
                    'Send 1-click checkout link with 10% VIP coupon',
                    'Reschedule delivery date with courier partner',
                    'Approve return & initiate instant wallet refund'
                  ],
                  manufacturing_b2b: [
                    'Dispatch tiered volume quotation for 15,000 units',
                    'Share government E-Way Bill & live truck GPS',
                    'Send ISO 9001 material test compliance certificate'
                  ],
                  hospitality: [
                    'Confirm Deluxe Sea-View reservation voucher',
                    'Reserve candlelight beach dining table for 8 PM',
                    'Credit 500 loyalty points to guest profile'
                  ],
                  travel: [
                    'Send 12-day customized Swiss & Paris itinerary',
                    'Dispatch airline PNR and verified hotel vouchers',
                    'Confirm Schengen visa biometrics appointment'
                  ],
                  financial_services: [
                    'Share wealth asset-allocation proposal (Debt + Equity)',
                    'Verify CIBIL score (785) & activate credit line',
                    'Schedule Partner meeting to review loan term sheet'
                  ],
                  software_it: [
                    'Offer 15-min product architecture demo',
                    'Send enterprise pricing brochure & API specs',
                    'Verify webhook callback and resolve ticket'
                  ]
                }[activeIndustryId] || [
                  'Offer 15-min product demo',
                  'Send pricing brochure',
                  'Schedule follow-up call'
                ]
              ).map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.725rem', padding: '3px 10px', whiteSpace: 'nowrap' }}
                  onClick={() => handleQuickSuggestion(sug)}
                >
                  "{sug}"
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <input
              type="text"
              className="form-control"
              placeholder={isAnalyst ? 'Read-only mode: Message sending is disabled for Analyst/Viewer' : `Type a reply as ${isAiMode ? 'AI Agent' : 'Live Agent'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isAnalyst}
            />
            <button type="submit" className="btn btn-primary btn-icon" disabled={isAnalyst || !inputText.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
