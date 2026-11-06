import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
import {
  Users,
  Compass,
  TrendingUp,
  DollarSign,
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
  PackageCheck,
  Send,
  Boxes,
  ClipboardList,
  ArrowRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export function ManufacturingSalesExecutiveView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'requirements' | 'catalogue' | 'inventory' | 'quotations' | 'handoff'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [myLeads, setMyLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [requirements, setRequirements] = useState([]);

  // Inventory availability modal & state
  const [showInvModal, setShowInvModal] = useState(false);
  const [invCheckResult, setInvCheckResult] = useState(null);
  const [invProductId, setInvProductId] = useState('mfg_product_101');
  const [invQuantity, setInvQuantity] = useState(50);

  // Requirements Modal
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqForm, setReqForm] = useState({
    leadId: 'mfg_lead_1001',
    application: 'INDUSTRIAL_WATER_TRANSFER',
    productCategory: 'INDUSTRIAL_PUMP',
    quantity: 50,
    flowRate: 100,
    material: 'STAINLESS_STEEL',
    requiredByDate: '2026-12-15',
    notes: 'High temperature resistance required.'
  });

  // Quotation Builder Modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    leadId: 'mfg_lead_1001',
    customerId: 'mfg_customer_101',
    productId: 'mfg_product_101',
    quantity: 50,
    unitPrice: 10000,
    paymentTerms: 'NET_30',
    validUntil: '2026-11-15'
  });

  // Approval Request Modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [requestedDiscount, setRequestedDiscount] = useState(12);
  const [approvalReason, setApprovalReason] = useState('Bulk volume discount requested by customer.');

  // Order Handoff Modal
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffNotes, setHandoffNotes] = useState('Verified delivery address and client acceptance form.');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, leadsRes, prodRes, quoteRes] = await Promise.allSettled([
        manufacturingService.salesExecutive.getDashboard(),
        manufacturingService.salesExecutive.getMyLeads(),
        manufacturingService.salesExecutive.getProducts({ size: 50 }),
        manufacturingService.salesExecutive.getQuotations()
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (leadsRes.status === 'fulfilled') setMyLeads(leadsRes.value?.items || []);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value?.items || []);
      if (quoteRes.status === 'fulfilled') setQuotations(quoteRes.value || []);
    } catch (err) {
      console.error('Error loading sales executive data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.salesExecutive.createProductRequirement({
        leadId: reqForm.leadId,
        application: reqForm.application,
        productCategory: reqForm.productCategory,
        quantity: Number(reqForm.quantity),
        requiredSpecifications: {
          flowRate: { value: Number(reqForm.flowRate), unit: 'M3_PER_HOUR' },
          material: reqForm.material
        },
        requiredByDate: reqForm.requiredByDate,
        notes: reqForm.notes
      });
      addNotification('success', 'Specifications Captured', `Technical requirements #${res?.requirementId} recorded.`);
      setShowReqModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Capture Failed', err.message);
    }
  };

  const handleCheckInventory = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.salesExecutive.checkInventoryAvailability({
        items: [{ productId: invProductId, quantity: Number(invQuantity) }],
        requiredByDate: '2026-12-15',
        fulfilmentLocationId: 'warehouse_101'
      });
      setInvCheckResult(res);
      addNotification('info', 'Inventory Verified', `Check ${res?.checkId}: Status ${res?.status}`);
    } catch (err) {
      addNotification('error', 'Check Failed', err.message);
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.salesExecutive.createQuotation({
        leadId: quoteForm.leadId,
        customerId: quoteForm.customerId,
        paymentTerms: quoteForm.paymentTerms,
        validUntil: quoteForm.validUntil,
        currency: 'INR',
        items: [
          {
            productId: quoteForm.productId,
            quantity: Number(quoteForm.quantity),
            unitPrice: Number(quoteForm.unitPrice)
          }
        ]
      });
      addNotification('success', 'Quotation Drafted', `Draft #${res?.quotationNumber || res?.quotationId} created with total ₹${res?.total?.toLocaleString()}.`);
      setShowQuoteModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Draft Failed', err.message);
    }
  };

  const handleRequestApproval = async () => {
    if (!selectedQuote) return;
    try {
      await manufacturingService.salesExecutive.requestApproval(selectedQuote.quotationId, {
        reason: approvalReason,
        requestedDiscountPercent: Number(requestedDiscount),
        comment: 'Please review commercial discount exception.'
      });
      addNotification('success', 'Approval Submitted', `Sent to Sales Manager for discount review.`);
      setShowApprovalModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Request Failed', err.message);
    }
  };

  const handleSendQuotation = async (q) => {
    try {
      await manufacturingService.salesExecutive.sendQuotation(q.quotationId, {
        channel: 'EMAIL',
        templateId: 'manufacturing_quotation_v1'
      });
      addNotification('success', 'Quotation Dispatched', `Quotation sent via Email to customer.`);
      loadData();
    } catch (err) {
      addNotification('error', 'Cannot Send Quotation', err.message || 'Requires manager approval before sending.');
    }
  };

  const handleCreateOrderHandoff = async () => {
    if (!selectedQuote) return;
    try {
      await manufacturingService.salesExecutive.createOrderHandoff(selectedQuote.quotationId, {
        customerAcceptanceReference: 'verified-customer-acceptance',
        requestedDeliveryDate: '2026-12-15',
        notes: handoffNotes
      });
      addNotification('success', 'Order Handoff Created', `Accepted quotation handed off to ERP.`);
      setShowHandoffModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Handoff Blocked', err.message || 'Quotation must be ACCEPTED by customer first.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Boxes className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Sales Executive</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Technical Qualification, Inventory Lead-Times, Quotation Calculation & ERP Handoff</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            <PackageCheck className="w-4 h-4 text-indigo-600" />
            Check Availability
          </button>
          <button
            onClick={() => setShowQuoteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Build Quotation
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'leads', label: `My Leads (${myLeads.length})`, icon: Users },
          { id: 'catalogue', label: 'Industrial Catalogue', icon: Boxes },
          { id: 'quotations', label: `Quotations & Handoff (${quotations.length})`, icon: ClipboardList }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. MY LEADS & TECHNICAL SPECS */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Industrial Opportunities</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Capture technical specs and qualify engineering fit</p>
              </div>
              <button
                onClick={() => setShowReqModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Capture Tech Specs
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Lead ID & Company</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Requirement</th>
                    <th className="px-6 py-4">Est. Qty</th>
                    <th className="px-6 py-4">Priority / Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {myLeads.map((l) => (
                    <tr key={l.leadId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{l.companyName}</div>
                        <div className="text-xs text-slate-400 font-mono">{l.leadId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{l.contactName}</div>
                        <div className="text-xs text-slate-400">{l.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs max-w-xs text-slate-700 dark:text-slate-300">
                        {l.requirement}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-xs">
                        {l.estimatedQuantity} Units
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {l.status}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-50 text-rose-600 dark:bg-rose-900/20">
                            {l.priority || 'HIGH'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setQuoteForm({ ...quoteForm, leadId: l.leadId });
                            setShowQuoteModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                        >
                          Quote Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. INDUSTRIAL CATALOGUE */}
      {activeTab === 'catalogue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.productId} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                  <div className="text-xs font-mono text-slate-400">SKU: {p.sku}</div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {p.category}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
                <div className="text-slate-500 font-semibold">Technical Specifications:</div>
                {p.specifications && Object.entries(p.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="capitalize">{k}:</span>
                    <span className="font-mono font-medium">{typeof v === 'object' ? `${v.value} ${v.unit}` : String(v)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-base font-bold text-slate-900 dark:text-white">₹{p.basePrice?.toLocaleString()}</div>
                <button
                  onClick={() => {
                    setInvProductId(p.productId);
                    setShowInvModal(true);
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                >
                  Check Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. QUOTATIONS WORKSPACE */}
      {activeTab === 'quotations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Commercial Quotations & Order Handoffs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Server calculated pricing, manager approval governance, and order dispatch</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Quote Number</th>
                  <th className="px-6 py-4">Customer & Valid Until</th>
                  <th className="px-6 py-4">Subtotal / Discount</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4">Quote Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {quotations.map((q) => (
                  <tr key={q.quotationId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-xs text-slate-900 dark:text-white">{q.quotationNumber || q.quotationId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{q.customerId}</div>
                      <div className="text-xs text-slate-400">Valid: {q.validUntil}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div>₹{(q.subtotal || 500000).toLocaleString()}</div>
                      <div className="text-rose-500">Disc: ₹{(q.discount || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 font-mono text-sm">
                      ₹{(q.total || q.totalAmount || 500000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        q.approved || q.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        q.approvalStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {q.approvalStatus || (q.approved ? 'APPROVED' : 'DRAFT')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {q.approvalRequired && !q.approved && q.approvalStatus !== 'APPROVED' && (
                        <button
                          onClick={() => {
                            setSelectedQuote(q);
                            setShowApprovalModal(true);
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg"
                        >
                          Request Approval
                        </button>
                      )}
                      <button
                        onClick={() => handleSendQuotation(q)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                      >
                        Send Quote
                      </button>
                      {q.status === 'ACCEPTED' && (
                        <button
                          onClick={() => {
                            setSelectedQuote(q);
                            setShowHandoffModal(true);
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                        >
                          Hand Off Order
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AVAILABILITY MODAL */}
      {showInvModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check Authorized Stock Availability</h3>
              <button onClick={() => setShowInvModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCheckInventory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Industrial Product</label>
                <select
                  value={invProductId}
                  onChange={(e) => setInvProductId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="mfg_product_101">mfg_product_101 - Stainless Steel Industrial Pump</option>
                  <option value="mfg_product_102">mfg_product_102 - Heavy Duty Induction Motor 50HP</option>
                  <option value="mfg_product_103">mfg_product_103 - Hydraulic Valve HP20</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Requested Quantity</label>
                <input
                  type="number"
                  value={invQuantity}
                  onChange={(e) => setInvQuantity(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                  Verify Stock
                </button>
              </div>
            </form>

            {invCheckResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Status: {invCheckResult.status}</span>
                  <span className="text-amber-600">{invCheckResult.items?.[0]?.availability}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                    <span className="text-slate-400">Requested:</span>
                    <div className="font-bold">{invCheckResult.items?.[0]?.requestedQuantity}</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                    <span className="text-slate-400">Available:</span>
                    <div className="font-bold text-emerald-600">{invCheckResult.items?.[0]?.availableQuantity}</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                    <span className="text-slate-400">Shortage:</span>
                    <div className="font-bold text-rose-600">{invCheckResult.items?.[0]?.shortageQuantity}</div>
                  </div>
                </div>
                <div className="pt-2 text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <span>Stock availability is non-reservational and subject to production lead time.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAPTURE REQUIREMENTS MODAL */}
      {showReqModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Capture Product Technical Requirements</h3>
            <form onSubmit={handleCreateRequirement} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Application</label>
                <input
                  type="text"
                  value={reqForm.application}
                  onChange={(e) => setReqForm({ ...reqForm, application: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Flow Rate (m3/h)</label>
                  <input
                    type="number"
                    value={reqForm.flowRate}
                    onChange={(e) => setReqForm({ ...reqForm, flowRate: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Material Grade</label>
                  <input
                    type="text"
                    value={reqForm.material}
                    onChange={(e) => setReqForm({ ...reqForm, material: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Required Quantity</label>
                  <input
                    type="number"
                    value={reqForm.quantity}
                    onChange={(e) => setReqForm({ ...reqForm, quantity: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Required By Date</label>
                  <input
                    type="date"
                    value={reqForm.requiredByDate}
                    onChange={(e) => setReqForm({ ...reqForm, requiredByDate: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowReqModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                  Submit Requirements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUOTATION MODAL */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Build Commercial Quotation</h3>
            <form onSubmit={handleCreateQuotation} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Customer ID</label>
                <input
                  type="text"
                  value={quoteForm.customerId}
                  onChange={(e) => setQuoteForm({ ...quoteForm, customerId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Product</label>
                <select
                  value={quoteForm.productId}
                  onChange={(e) => setQuoteForm({ ...quoteForm, productId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="mfg_product_101">Stainless Steel Industrial Pump (₹10,000 / unit)</option>
                  <option value="mfg_product_102">Heavy Duty Induction Motor 50HP (₹45,000 / unit)</option>
                  <option value="mfg_product_103">Hydraulic Directional Valve (₹8,500 / unit)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quantity</label>
                  <input
                    type="number"
                    value={quoteForm.quantity}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.unitPrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs flex justify-between font-bold">
                <span>Estimated Subtotal:</span>
                <span className="text-indigo-600">₹{(quoteForm.quantity * quoteForm.unitPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                  Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST APPROVAL MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Quotation for Manager Approval</h3>
            <p className="text-xs text-slate-400">Quote: {selectedQuote?.quotationNumber || selectedQuote?.quotationId}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Requested Discount (%)</label>
                <input
                  type="number"
                  value={requestedDiscount}
                  onChange={(e) => setRequestedDiscount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Commercial Justification</label>
                <textarea
                  rows="2"
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleRequestApproval} className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER HANDOFF MODAL */}
      {showHandoffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order Handoff to Production / ERP</h3>
            <p className="text-xs text-slate-400">Quote: {selectedQuote?.quotationNumber} (Status: ACCEPTED)</p>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Customer Delivery Instructions</label>
              <textarea
                rows="3"
                value={handoffNotes}
                onChange={(e) => setHandoffNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowHandoffModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleCreateOrderHandoff} className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                Initiate ERP Handoff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
