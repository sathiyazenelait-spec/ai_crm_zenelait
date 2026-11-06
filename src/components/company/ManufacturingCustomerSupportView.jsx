import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
import {
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Layers,
  ShieldAlert,
  Calendar,
  Check,
  X,
  FileCheck,
  BookOpen,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Wrench,
  Truck,
  MessageSquare,
  Send,
  User,
  Info
} from 'lucide-react';

export function ManufacturingCustomerSupportView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'warranty' | 'knowledge' | 'returns' | 'escalations'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [warrantyClaims, setWarrantyClaims] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);

  // Selected ticket & AI states
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [aiClassification, setAiClassification] = useState(null);
  const [aiReplyDraft, setAiReplyDraft] = useState(null);
  const [kbSearchResults, setKbSearchResults] = useState([]);
  const [kbQuery, setKbQuery] = useState('industrial pump overheating troubleshooting');

  // Modals & forms
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  // Forms
  const [ticketForm, setTicketForm] = useState({
    customerId: 'mfg_customer_101',
    orderId: 'mfg_order_2001',
    productId: 'mfg_product_101',
    serialNumber: 'SERIAL-EXAMPLE-001',
    category: 'TECHNICAL_ISSUE',
    priority: 'HIGH',
    subject: 'Industrial pump overheating',
    description: 'The pump becomes unusually hot (>85C) during continuous duty operation.',
    channel: 'EMAIL'
  });

  const [escalateForm, setEscalateForm] = useState({
    reason: 'POTENTIAL_PRODUCT_SAFETY_ISSUE',
    priority: 'URGENT',
    targetTeam: 'TECHNICAL_SAFETY_TEAM',
    summary: 'Product overheating requires qualified technical safety assessment.'
  });

  const [resolveForm, setResolveForm] = useState({
    resolutionCode: 'TECHNICAL_GUIDANCE_PROVIDED',
    resolutionSummary: 'Customer confirmed operating temperature normalized after thermal coupling inspection.',
    customerConfirmationReceived: true
  });

  const [warrantyForm, setWarrantyForm] = useState({
    ticketId: 'mfg_ticket_1001',
    customerId: 'mfg_customer_101',
    orderId: 'mfg_order_2001',
    productId: 'mfg_product_101',
    serialNumber: 'SERIAL-EXAMPLE-001',
    purchaseDate: '2026-06-15',
    issueDescription: 'Product overheating during operation and tripping motor breaker.'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, tickRes, warRes, retRes] = await Promise.allSettled([
        manufacturingService.customerSupport.getDashboard(),
        manufacturingService.customerSupport.getTickets(),
        manufacturingService.customerSupport.getWarrantyClaims(),
        manufacturingService.customerSupport.getReturnRequests()
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (tickRes.status === 'fulfilled') {
        const tList = tickRes.value || [];
        setTickets(tList);
        if (tList.length > 0 && !selectedTicket) setSelectedTicket(tList[0]);
      }
      if (warRes.status === 'fulfilled') setWarrantyClaims(warRes.value || []);
      if (retRes.status === 'fulfilled') setReturnRequests(retRes.value || []);
    } catch (err) {
      console.error('Error loading customer support data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.customerSupport.createTicket(ticketForm);
      addNotification('success', 'Ticket Created', `Support ticket #${res?.ticketNumber || res?.ticketId} registered.`);
      setShowCreateTicketModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Ticket Creation Failed', err.message);
    }
  };

  const handleClassifyTicket = async () => {
    if (!selectedTicket) return;
    try {
      const res = await manufacturingService.customerSupport.classifyTicket(selectedTicket.ticketId, {
        includePriorityRecommendation: true,
        includeSafetyRiskAssessment: true
      });
      setAiClassification(res);
      addNotification('info', 'AI Classification Completed', `Suggested category: ${res?.suggestedSubcategory || 'TECHNICAL_ISSUE'}`);
    } catch (err) {
      addNotification('error', 'AI Classification Failed', err.message);
    }
  };

  const handleSearchKnowledge = async () => {
    try {
      const res = await manufacturingService.customerSupport.searchKnowledge({
        query: kbQuery,
        productId: selectedTicket?.productId || 'mfg_product_101',
        language: 'en',
        limit: 5
      });
      setKbSearchResults(res?.results || []);
    } catch (err) {
      addNotification('error', 'KB Search Failed', err.message);
    }
  };

  const handleDraftReply = async () => {
    if (!selectedTicket) return;
    try {
      const res = await manufacturingService.customerSupport.draftReply(selectedTicket.ticketId, {
        tone: 'PROFESSIONAL',
        language: 'en',
        includeKnowledgeReferences: true
      });
      setAiReplyDraft(res);
      addNotification('success', 'Draft Generated', 'AI response generated from approved technical documentation.');
    } catch (err) {
      addNotification('error', 'Draft Generation Failed', err.message);
    }
  };

  const handleEscalateTicket = async () => {
    if (!selectedTicket) return;
    try {
      await manufacturingService.customerSupport.escalateTicket(selectedTicket.ticketId, escalateForm);
      addNotification('success', 'Ticket Escalated', `Escalated to ${escalateForm.targetTeam}. Automated resolution paused.`);
      setShowEscalateModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Escalation Failed', err.message);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    try {
      await manufacturingService.customerSupport.resolveTicket(selectedTicket.ticketId, resolveForm);
      addNotification('success', 'Ticket Resolved', `Support case closed under code: ${resolveForm.resolutionCode}`);
      setShowResolveModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Resolution Policy Blocked', err.message || 'Customer confirmation is mandatory.');
    }
  };

  const handleCreateWarrantyClaim = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.customerSupport.createWarrantyClaim({
        ...warrantyForm,
        evidenceReferences: ['authorized-evidence-reference-001']
      });
      addNotification('success', 'Claim Filed', `Warranty Claim #${res?.claimId} recorded.`);
      setShowWarrantyModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Warranty Claim Failed', err.message);
    }
  };

  const handleValidateClaim = async (claimId) => {
    try {
      const res = await manufacturingService.customerSupport.validateWarrantyClaim(claimId, {
        checkPurchaseRecord: true,
        checkSerialNumber: true,
        checkWarrantyPeriod: true,
        checkProductEligibility: true
      });
      addNotification('info', 'Claim Validated', `Validation result: ${res?.validationStatus}`);
      loadData();
    } catch (err) {
      addNotification('error', 'Validation Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-teal-600/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
              <LifeBuoy className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Customer Support</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Technical Triage, Serial Number Verification, Warranty Validation & Safety Escalations</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateTicketModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-md shadow-teal-600/20"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">Open Tickets</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboard?.openTickets || 86}</div>
          <p className="text-xs text-amber-500 mt-1">12 Unassigned</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">High Priority Cases</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{dashboard?.highPriorityTickets || 8}</div>
          <p className="text-xs text-rose-500 mt-1">Safety review required</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">Pending Warranty Claims</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboard?.pendingWarrantyClaims || 15}</div>
          <p className="text-xs text-slate-400 mt-1">Avg 3.2 days turnaround</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">Resolution SLA</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">18.5h</div>
          <p className="text-xs text-emerald-600 mt-1">94.2% SLA compliance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'tickets', label: `Support Tickets (${tickets.length})`, icon: LifeBuoy },
          { id: 'warranty', label: `Warranty Claims (${warrantyClaims.length})`, icon: ShieldCheck },
          { id: 'returns', label: `Returns & Repairs (${returnRequests.length})`, icon: RotateCcw },
          { id: 'knowledge', label: 'Technical Manuals & KB', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. TICKETS WORKSPACE */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[650px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Active Ticket Queue</span>
              <span className="text-xs text-slate-400">{tickets.length} items</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.ticketId === t.ticketId;
                return (
                  <div
                    key={t.ticketId}
                    onClick={() => {
                      setSelectedTicket(t);
                      setAiClassification(null);
                      setAiReplyDraft(null);
                    }}
                    className={`p-4 cursor-pointer transition ${
                      isSelected
                        ? 'bg-teal-50/60 dark:bg-teal-900/20 border-l-4 border-teal-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono font-bold text-slate-500">{t.ticketNumber || t.ticketId}</span>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                        t.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{t.subject}</div>
                    <div className="text-xs text-slate-400 mt-1">Serial: {t.serialNumber || 'N/A'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Detail & AI Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTicket ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-600">{selectedTicket.ticketNumber}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400">Order Ref: {selectedTicket.orderId} | Product: {selectedTicket.productName || selectedTicket.productId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                    >
                      Escalate Safety Issue
                    </button>
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Resolve Case
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <div className="font-bold text-slate-500">Customer Description:</div>
                  <p>{selectedTicket.description}</p>
                </div>

                {/* AI Support Actions */}
                <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      Zenelait AI Manufacturing Triage Assistant
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClassifyTicket}
                        className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 rounded-lg shadow-sm border border-teal-200 dark:border-teal-900"
                      >
                        Classify & Detect Risks
                      </button>
                      <button
                        onClick={handleDraftReply}
                        className="px-3 py-1 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        Draft Technical Reply
                      </button>
                    </div>
                  </div>

                  {aiClassification && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>Classification: {aiClassification.suggestedSubcategory}</span>
                        <span className="text-rose-600">Safety Flag: {aiClassification.safetyConcernDetected ? 'YES' : 'NO'}</span>
                      </div>
                      <div className="text-slate-500">Recommended Action: <strong className="text-teal-600">{aiClassification.recommendedAction}</strong></div>
                    </div>
                  )}

                  {aiReplyDraft && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between font-bold text-slate-500">
                        <span>AI Grounded Draft Reply (Requires Human Review)</span>
                        <span className="text-teal-600">KB: mfg_kb_101</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic">{aiReplyDraft.body}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
                Select a ticket to review customer context and technical manuals.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. WARRANTY CLAIMS */}
      {activeTab === 'warranty' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Industrial Warranty Claims</h3>
              <p className="text-xs text-slate-500">Verify purchase records, serial numbers, and 24-month manufacturer policies</p>
            </div>
            <button
              onClick={() => setShowWarrantyModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              File Warranty Claim
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Claim ID</th>
                  <th className="px-6 py-4">Customer & Serial</th>
                  <th className="px-6 py-4">Purchase Date</th>
                  <th className="px-6 py-4">Defect Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {warrantyClaims.map((wc) => (
                  <tr key={wc.claimId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-xs">{wc.claimId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{wc.customerId}</div>
                      <div className="text-xs text-slate-400 font-mono">{wc.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">{wc.purchaseDate}</td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate">{wc.issueDescription}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                        {wc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleValidateClaim(wc.claimId)}
                        className="px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg"
                      >
                        Run Policy Validation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. RETURNS TAB */}
      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Returns, Replacements & RMA</h3>
          <p className="text-xs text-slate-400 mb-4">Factory inspection queue and return merchandise authorizations.</p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
            {returnRequests.length} RMA requests awaiting warehouse intake.
          </div>
        </div>
      )}

      {/* 4. KNOWLEDGE TAB */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Manuals & Approved Troubleshooting Knowledge</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={kbQuery}
                onChange={(e) => setKbQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                placeholder="Search troubleshooting procedures..."
              />
              <button
                onClick={handleSearchKnowledge}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700"
              >
                Search KB
              </button>
            </div>

            <div className="space-y-3 pt-3">
              {kbSearchResults.map((art) => (
                <div key={art.articleId} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{art.title}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                      Version {art.version}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Source: {art.sourceType} | Relevance: {art.relevance * 100}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Technical Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Customer ID</label>
                <input
                  type="text"
                  value={ticketForm.customerId}
                  onChange={(e) => setTicketForm({ ...ticketForm, customerId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Order ID</label>
                  <input
                    type="text"
                    value={ticketForm.orderId}
                    onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Serial Number</label>
                  <input
                    type="text"
                    value={ticketForm.serialNumber}
                    onChange={(e) => setTicketForm({ ...ticketForm, serialNumber: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Description</label>
                <textarea
                  rows="3"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateTicketModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE SAFETY MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Safety Escalation Protocol
            </h3>
            <p className="text-xs text-slate-400">Escalating to factory engineering pauses automated resolution workflows.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Specialist Team</label>
                <input
                  type="text"
                  value={escalateForm.targetTeam}
                  onChange={(e) => setEscalateForm({ ...escalateForm, targetTeam: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Safety Hazard Summary</label>
                <textarea
                  rows="3"
                  value={escalateForm.summary}
                  onChange={(e) => setEscalateForm({ ...escalateForm, summary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowEscalateModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleEscalateTicket} className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700">
                Confirm Safety Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resolve Support Ticket</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Resolution Code</label>
                <input
                  type="text"
                  value={resolveForm.resolutionCode}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionCode: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Resolution Summary</label>
                <textarea
                  rows="2"
                  value={resolveForm.resolutionSummary}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionSummary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="custConfirm"
                  checked={resolveForm.customerConfirmationReceived}
                  onChange={(e) => setResolveForm({ ...resolveForm, customerConfirmationReceived: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <label htmlFor="custConfirm" className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  Customer confirmation received (Mandatory by policy)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowResolveModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleResolveTicket} className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WARRANTY MODAL */}
      {showWarrantyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">File Manufacturer Warranty Claim</h3>
            <form onSubmit={handleCreateWarrantyClaim} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Customer ID</label>
                  <input
                    type="text"
                    value={warrantyForm.customerId}
                    onChange={(e) => setWarrantyForm({ ...warrantyForm, customerId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Serial Number</label>
                  <input
                    type="text"
                    value={warrantyForm.serialNumber}
                    onChange={(e) => setWarrantyForm({ ...warrantyForm, serialNumber: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Purchase Date</label>
                <input
                  type="date"
                  value={warrantyForm.purchaseDate}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, purchaseDate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Reported Malfunction</label>
                <textarea
                  rows="2"
                  value={warrantyForm.issueDescription}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, issueDescription: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowWarrantyModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
