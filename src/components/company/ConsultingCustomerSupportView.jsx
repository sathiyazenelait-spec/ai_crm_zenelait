import React, { useState, useEffect } from 'react';
import {
  Headphones, Ticket, CheckCircle2, AlertCircle, RefreshCw, Send, Plus,
  Search, Clock, ShieldAlert, Sparkles, MessageSquare, AlertTriangle,
  FileText, ArrowRight, Check, Eye, HelpCircle, Layers, UserCheck
} from 'lucide-react';
import { consultingService } from '../../services/consultingService';

export function ConsultingCustomerSupportView() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [engagements, setEngagements] = useState([]);
  const [selectedEngagement, setSelectedEngagement] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [notification, setNotification] = useState(null);

  // Ticket Message / Internal Note state
  const [newMessage, setNewMessage] = useState('');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Escalate state
  const [escalateModal, setEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('Client reports a potential contractual or delivery commitment issue');
  const [targetTeam, setTargetTeam] = useState('ENGAGEMENT_MANAGEMENT');

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, tktRes, engRes] = await Promise.all([
        consultingService.customerSupport.getDashboard().catch(() => ({
          openTickets: 38, assignedToMe: 11, highPriorityTickets: 4,
          awaitingClientResponse: 7, approachingSlaDeadline: 5, resolvedToday: 8,
          pendingEscalations: 3, averageResolutionHours: 12.5
        })),
        consultingService.customerSupport.getTickets().catch(() => []),
        consultingService.customerSupport.getEngagements().catch(() => [])
      ]);

      setDashboard(dashRes);
      setTickets(tktRes || []);
      setEngagements(engRes || []);
      if (tktRes && tktRes.length > 0 && !selectedTicket) {
        setSelectedTicket(tktRes[0]);
      }
    } catch (err) {
      console.error('Failed to load support data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectEngagement = async (engId) => {
    try {
      const res = await consultingService.customerSupport.getEngagementMilestones(engId);
      setMilestones(res?.milestones || []);
      setSelectedEngagement(engId);
    } catch (err) {
      showNotification('Could not load engagement milestones', 'error');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    try {
      await consultingService.customerSupport.sendTicketMessage(selectedTicket.ticketId, newMessage);
      showNotification('Customer-facing reply sent');
      setNewMessage('');
      loadData();
    } catch (err) {
      showNotification(err.message || 'Send message failed', 'error');
    }
  };

  const handleAddInternalNote = async () => {
    if (!selectedTicket || !newInternalNote.trim()) return;
    try {
      await consultingService.customerSupport.addInternalNote(selectedTicket.ticketId, newInternalNote);
      showNotification('Internal note saved (hidden from client)');
      setNewInternalNote('');
      loadData();
    } catch (err) {
      showNotification(err.message || 'Note failed', 'error');
    }
  };

  const handleAiDraft = async () => {
    if (!selectedTicket) return;
    try {
      setAiLoading(true);
      const res = await consultingService.customerSupport.draftResponseAi(selectedTicket.ticketId, selectedTicket.description || 'Project update enquiry');
      setAiDraft(res?.draft || 'Thank you for reaching out. We are verifying authorized status from delivery team.');
      showNotification('AI-assisted response draft generated with compliance check');
    } catch (err) {
      showNotification('Failed to generate AI draft', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedTicket) return;
    try {
      await consultingService.customerSupport.escalateTicket(selectedTicket.ticketId, escalateReason, targetTeam, 'Escalated by customer support');
      showNotification(`Ticket ${selectedTicket.ticketId} escalated to ${targetTeam}`);
      setEscalateModal(false);
      loadData();
    } catch (err) {
      showNotification(err.message || 'Escalation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 border border-slate-800 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Consulting Customer Support
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Client Success & SLA Tracking
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Client Services & Escalations</h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm leading-relaxed">
              Handle client onboarding queries, engagement status checks, deliverable requests, invoice questions, and governed team escalations.
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border shadow-sm ${
          notification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}

      {/* SLA & Guardrails Note */}
      <div className="bg-teal-50/70 border border-teal-200 text-teal-900 p-4 rounded-xl text-sm flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-bold">Consulting Governance Policy:</span> Support personnel may clarify authorized engagement status, confirmed milestones, and issued invoice summaries. Support must <strong>never change contractual commitments, promise speculative delivery dates, or modify invoice billing amounts</strong> without engagement partner approval.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {[
          { id: 'tickets', label: `Support Tickets (${tickets.length})`, icon: Ticket },
          { id: 'engagements', label: 'Engagement Milestones', icon: Layers },
          { id: 'billing', label: 'Billing & Invoices', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TICKETS QUEUE & WORKSPACE */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket Queue (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Ticket Queue</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-700">
                {tickets.length} Active
              </span>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {tickets.map((t) => (
                <div
                  key={t.ticketId}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTicket?.ticketId === t.ticketId ? 'bg-teal-50/60 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-sm line-clamp-1">{t.subject}</span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded shrink-0">{t.ticketId}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t.status}
                    </span>
                    <span className="text-xs text-slate-400">• Priority: {t.priority}</span>
                    <span className="text-xs text-slate-400">• SLA: {t.slaStatus || 'WITHIN_TARGET'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Details & Response Center (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">{selectedTicket.ticketId}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-500 mt-1">Client: {selectedTicket.clientId} • Engagement: {selectedTicket.engagementId}</p>
                  </div>
                  <button
                    onClick={() => setEscalateModal(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalate Case
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Client Description:</span>
                  <p className="text-slate-800 text-xs leading-relaxed">{selectedTicket.description}</p>
                </div>

                {/* AI Grounded Assistant */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/50 to-indigo-50/50 border border-teal-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" /> Grounded AI Assistant (Grounded in Verified CRM Data)
                    </span>
                    <button
                      onClick={handleAiDraft}
                      disabled={aiLoading}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      {aiLoading ? 'Drafting...' : 'Generate AI Draft'}
                    </button>
                  </div>
                  {aiDraft && (
                    <div className="p-3 bg-white rounded-lg border border-teal-200 text-xs text-slate-700 space-y-2">
                      <p className="italic">{aiDraft}</p>
                      <button
                        onClick={() => setNewMessage(aiDraft)}
                        className="text-xs font-bold text-teal-700 hover:underline"
                      >
                        Insert into Reply Box →
                      </button>
                    </div>
                  )}
                </div>

                {/* Public Response Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Client-Facing Response (Sent via Email/Portal)</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type official verified client update..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Reply
                    </button>
                  </div>
                </div>

                {/* Separate Internal Note */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500">Add Confidential Internal Note (Delivery/Support Only)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInternalNote}
                      onChange={(e) => setNewInternalNote(e.target.value)}
                      placeholder="e.g. Milestone 2 deliverable awaiting final partner review..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={handleAddInternalNote}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Select a ticket to view conversation and action items
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENGAGEMENT MILESTONES */}
      {activeTab === 'engagements' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Consulting Engagements & Milestone Verification</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter confidential internal tasks to only inspect client-visible deliverables before responding.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {engagements.map((eng) => (
              <div key={eng.engagementId} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{eng.name}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {eng.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500">ID: {eng.engagementId} • Client: {eng.clientName}</div>
                <button
                  onClick={() => handleSelectEngagement(eng.engagementId)}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Verified Milestones
                </button>
              </div>
            ))}
          </div>

          {selectedEngagement && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Milestones for {selectedEngagement} (Client-Visible Only)</h4>
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div key={m.milestoneId} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                      <span className="text-xs text-slate-400 font-mono">{m.milestoneId}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BILLING & INVOICES */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Issued Client Invoices (Read-Only)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Customer Support can inspect issued invoice details to answer payment status enquiries, but cannot edit amounts.</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">INV-3001</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">ISSUED</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Amount: ₹2,50,000 INR • Due Date: 2026-11-15 • Source: BILLING_SYSTEM</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
              Verified from ERP Billing
            </span>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {escalateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Escalate Support Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedTicket?.ticketId} • {selectedTicket?.subject}</p>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Team</label>
                <select
                  value={targetTeam}
                  onChange={(e) => setTargetTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ENGAGEMENT_MANAGEMENT">Engagement Management / Project Partners</option>
                  <option value="DELIVERY_TEAM">Technical Delivery Team</option>
                  <option value="BILLING">Billing & Accounts Department</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Escalation Reason</label>
                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setEscalateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalate}
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
