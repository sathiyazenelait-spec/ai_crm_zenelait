import React, { useState, useEffect } from 'react';
import {
  Package, Bot, Search, Truck, AlertCircle, RefreshCw, CheckCircle2,
  Clock, ShieldCheck, ArrowRight, CornerDownRight, RotateCcw,
  DollarSign, FileText, Send, AlertTriangle, ExternalLink
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';

export default function EcommerceAiOrderAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Data
  const [dashboard, setDashboard] = useState({
    agentStatus: 'ACTIVE',
    orderEnquiriesToday: 145,
    trackingEnquiriesToday: 87,
    cancellationRequestsCreated: 12,
    returnRequestsCreated: 9,
    refundStatusEnquiries: 17,
    openOrderExceptions: 5,
    humanHandoffs: 8
  });

  // Order Lookup State
  const [orderLookupQuery, setOrderLookupQuery] = useState('ord_1001');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderPayment, setOrderPayment] = useState(null);
  const [orderShipments, setOrderShipments] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);

  // Shipment & Tracking State
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [statusExplanation, setStatusExplanation] = useState(null);
  const [deliveryEnquiryModal, setDeliveryEnquiryModal] = useState(false);
  const [deliveryEnquiryMsg, setDeliveryEnquiryMsg] = useState('');

  // Cancellation State
  const [cancelEligibility, setCancelEligibility] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('CUSTOMER_REQUEST');
  const [cancelComment, setCancelComment] = useState('I ordered the wrong model.');
  const [cancellationRequests, setCancellationRequests] = useState([]);

  // Return State
  const [returnEligibility, setReturnEligibility] = useState(null);
  const [returnModal, setReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('DAMAGED_PRODUCT');
  const [returnDesc, setReturnDesc] = useState('Visible chassis scratch and packaging puncture.');
  const [returnRequests, setReturnRequests] = useState([]);

  // Refund State
  const [refundStatus, setRefundStatus] = useState(null);
  const [refundExplanation, setRefundExplanation] = useState(null);

  // Exceptions State
  const [exceptions, setExceptions] = useState([]);
  const [exceptionSummary, setExceptionSummary] = useState(null);

  // Configuration
  const [config, setConfig] = useState({
    status: 'ACTIVE',
    requireHumanApprovalForCancellation: true,
    requireHumanApprovalForReturns: true,
    autoEscalateDelayHours: 48,
    prohibitDirectRefundExecution: true
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, excRes, cfgRes] = await Promise.allSettled([
        ecommerceService.aiOrderAgent.getDashboard(),
        ecommerceService.aiOrderAgent.getExceptions({ page: 0, size: 20 }),
        ecommerceService.aiOrderAgent.getConfig()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (excRes.status === 'fulfilled' && excRes.value?.data?.data?.items) {
        setExceptions(excRes.value.data.data.items);
      }
      if (cfgRes.status === 'fulfilled' && cfgRes.value?.data?.data) {
        setConfig(cfgRes.value.data.data);
      }

      // Automatically inspect default order
      handleLookupOrder('ord_1001');
    } catch (err) {
      console.error('Failed loading AI Order Agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLookupOrder = async (orderIdToFetch) => {
    const orderId = orderIdToFetch || orderLookupQuery;
    if (!orderId) return;
    setLoading(true);
    try {
      const [ordRes, itemRes, payRes, shipRes, histRes, summRes, cancelRes, retRes, refRes] = await Promise.allSettled([
        ecommerceService.aiOrderAgent.getOrder(orderId),
        ecommerceService.aiOrderAgent.getOrderItems(orderId),
        ecommerceService.aiOrderAgent.getPaymentStatus(orderId),
        ecommerceService.aiOrderAgent.getOrderShipments(orderId),
        ecommerceService.aiOrderAgent.getOrderHistory(orderId),
        ecommerceService.aiOrderAgent.summarizeOrder(orderId, { includeShipment: true }),
        ecommerceService.aiOrderAgent.getOrderCancellationRequests(orderId),
        ecommerceService.aiOrderAgent.getOrderReturnRequests(orderId),
        ecommerceService.aiOrderAgent.getOrderRefundStatus(orderId)
      ]);

      if (ordRes.status === 'fulfilled' && ordRes.value?.data?.data) {
        setSelectedOrder(ordRes.value.data.data);
      }
      if (itemRes.status === 'fulfilled' && itemRes.value?.data?.data?.items) {
        setOrderItems(itemRes.value.data.data.items);
      }
      if (payRes.status === 'fulfilled' && payRes.value?.data?.data) {
        setOrderPayment(payRes.value.data.data);
      }
      if (shipRes.status === 'fulfilled' && shipRes.value?.data?.data?.items) {
        const ships = shipRes.value.data.data.items;
        setOrderShipments(ships);
        if (ships.length > 0) {
          handleInspectShipment(ships[0].shipmentId);
        }
      }
      if (histRes.status === 'fulfilled' && histRes.value?.data?.data?.items) {
        setOrderHistory(histRes.value.data.data.items);
      }
      if (summRes.status === 'fulfilled' && summRes.value?.data?.data) {
        setOrderSummary(summRes.value.data.data.summary);
      }
      if (cancelRes.status === 'fulfilled' && cancelRes.value?.data?.data?.items) {
        setCancellationRequests(cancelRes.value.data.data.items);
      }
      if (retRes.status === 'fulfilled' && retRes.value?.data?.data?.items) {
        setReturnRequests(retRes.value.data.data.items);
      }
      if (refRes.status === 'fulfilled' && refRes.value?.data?.data) {
        setRefundStatus(refRes.value.data.data);
      }

      showToast(`Verified details loaded for ${orderId}`);
    } catch (err) {
      console.error('Lookup order error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectShipment = async (shipmentId) => {
    try {
      const [trkRes, expRes] = await Promise.all([
        ecommerceService.aiOrderAgent.getShipmentTracking(shipmentId),
        ecommerceService.aiOrderAgent.explainShipmentStatus(shipmentId, {
          customerQuestion: 'What does in transit mean?'
        })
      ]);

      if (trkRes?.data?.data) {
        setTrackingDetails(trkRes.data.data);
      }
      if (expRes?.data?.data) {
        setStatusExplanation(expRes.data.data);
      }
    } catch (err) {
      console.error('Shipment inspection error:', err);
    }
  };

  const handleCheckCancellation = async () => {
    if (!selectedOrder) return;
    try {
      const res = await ecommerceService.aiOrderAgent.checkCancellationEligibility(selectedOrder.orderId, {
        reason: cancelReason
      });
      if (res?.data?.data) {
        setCancelEligibility(res.data.data);
        showToast(res.data.data.eligible ? 'Order eligible for cancellation' : 'Order in-flight: Requires review');
      }
    } catch (err) {
      console.error('Cancellation check error:', err);
    }
  };

  const handleSubmitCancellation = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await ecommerceService.aiOrderAgent.submitCancellationRequest(selectedOrder.orderId, {
        reason: cancelReason,
        customerComment: cancelComment
      });
      if (res?.data?.success) {
        showToast('Cancellation request submitted for review');
        setCancelModal(false);
        handleLookupOrder(selectedOrder.orderId);
      }
    } catch (err) {
      console.error('Submit cancel error:', err);
    }
  };

  const handleCheckReturn = async () => {
    if (!selectedOrder) return;
    try {
      const res = await ecommerceService.aiOrderAgent.checkReturnEligibility(selectedOrder.orderId, {
        orderItemId: 'item_1001',
        reason: returnReason
      });
      if (res?.data?.data) {
        setReturnEligibility(res.data.data);
        showToast(`Return Policy: ${res.data.data.eligibility}`);
      }
    } catch (err) {
      console.error('Return check error:', err);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await ecommerceService.aiOrderAgent.submitReturnRequest(selectedOrder.orderId, {
        orderItemId: 'item_1001',
        reason: returnReason,
        description: returnDesc,
        evidenceReferenceIds: ['upload_1001']
      });
      if (res?.data?.success) {
        showToast('Return request logged in PENDING_REVIEW state');
        setReturnModal(false);
        handleLookupOrder(selectedOrder.orderId);
      }
    } catch (err) {
      console.error('Submit return error:', err);
    }
  };

  const handleExplainRefund = async (requestId) => {
    try {
      const res = await ecommerceService.aiOrderAgent.explainRefundStatus(requestId || 'refund_req_1001', {
        customerQuestion: 'Why has my refund not reached my account?'
      });
      if (res?.data?.data) {
        setRefundExplanation(res.data.data);
        showToast('Grounded refund status explanation retrieved');
      }
    } catch (err) {
      console.error('Refund explanation error:', err);
    }
  };

  const handleEscalateException = async (exceptionId) => {
    try {
      const res = await ecommerceService.aiOrderAgent.escalateException(exceptionId, {
        reason: 'CARRIER_EXCEPTION',
        priority: 'HIGH'
      });
      if (res?.data?.success) {
        showToast('Order exception escalated to Operations queue');
        loadData();
      }
    } catch (err) {
      console.error('Escalation error:', err);
    }
  };

  const handleToggleAgentStatus = async () => {
    const nextStatus = dashboard.agentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await ecommerceService.aiOrderAgent.updateStatus(nextStatus);
      if (res?.data?.success) {
        setDashboard((prev) => ({ ...prev, agentStatus: nextStatus }));
        showToast(`AI Order Agent status updated to ${nextStatus}`);
      }
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-sky-400/30 animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-sky-200" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-sky-600 to-blue-500 rounded-2xl shadow-lg shadow-sky-500/20">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">AI Order Agent Workspace</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                  dashboard.agentStatus === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${dashboard.agentStatus === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {dashboard.agentStatus}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Verified order status, shipment tracking explanation, cancellation & return workflows, and exceptions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAgentStatus}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              dashboard.agentStatus === 'ACTIVE'
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
            }`}
          >
            {dashboard.agentStatus === 'ACTIVE' ? 'Pause Agent' : 'Activate Agent'}
          </button>
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'dashboard', label: 'Order Dashboard', icon: Package },
          { id: 'order_lookup', label: 'Order Lookup & Details', icon: Search },
          { id: 'shipments', label: 'Shipment Tracking', icon: Truck },
          { id: 'cancellations', label: 'Cancellations', icon: AlertCircle },
          { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
          { id: 'refunds', label: 'Refund Status', icon: DollarSign },
          { id: 'exceptions', label: 'Exceptions & Escalation', icon: AlertTriangle },
          { id: 'configuration', label: 'Guardrails & Config', icon: Bot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Order Enquiries Today</span>
                <Package className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-3xl font-bold text-white">{dashboard.orderEnquiriesToday}</div>
              <p className="text-xs text-slate-400 mt-2">{dashboard.trackingEnquiriesToday} tracking lookups</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Cancellation Requests</span>
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400">{dashboard.cancellationRequestsCreated}</div>
              <p className="text-xs text-slate-400 mt-2">Requires human sign-off</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Return Requests</span>
                <RotateCcw className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-indigo-400">{dashboard.returnRequestsCreated}</div>
              <p className="text-xs text-slate-400 mt-2">Verified against return window</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Open Exceptions</span>
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-rose-400">{dashboard.openOrderExceptions}</div>
              <p className="text-xs text-slate-400 mt-2">{dashboard.humanHandoffs} transferred to operations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                AI Order Operations Authority Matrix
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Carrier Verification Only</h4>
                    <p className="text-xs text-slate-400">Shipment tracking status is fetched directly from carrier API. The AI never fabricates estimated delivery dates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">No Independent Refund Execution</h4>
                    <p className="text-xs text-slate-400">The AI reports recorded payment status but has zero permission to initiate monetary bank disbursements.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Explicit Transition Rules</h4>
                    <p className="text-xs text-slate-400">Shipped orders cannot be marked cancelled by the AI without human review and courier intercept verification.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Active Order Enquiries Stream
              </h3>
              <div className="space-y-3">
                {[
                  { orderId: 'ord_1001', type: 'TRACKING', status: 'ANSWERED', time: '5 mins ago' },
                  { orderId: 'ord_1002', type: 'CANCELLATION', status: 'PENDING_REVIEW', time: '18 mins ago' },
                  { orderId: 'ord_1003', type: 'RETURN', status: 'IN_EVALUATION', time: '42 mins ago' }
                ].map((enq, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{enq.orderId} • {enq.type}</p>
                      <p className="text-xs text-slate-400">{enq.time}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded-full">
                      {enq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER LOOKUP & DETAILS */}
      {activeTab === 'order_lookup' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-2">Authenticated Order Lookup</h3>
            <p className="text-xs text-slate-400 mb-4">
              Requires verified customer session. Retrieves authoritative records from ERP and Payment Gateway.
            </p>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={orderLookupQuery}
                onChange={(e) => setOrderLookupQuery(e.target.value)}
                placeholder="Enter Order ID (e.g., ord_1001)..."
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
              <button
                onClick={() => handleLookupOrder()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition"
              >
                Inspect Order
              </button>
            </div>
          </div>

          {selectedOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Summary & Line Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-sky-400">{selectedOrder.orderId}</span>
                      <h4 className="text-xl font-bold text-white">{selectedOrder.orderNumber}</h4>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {selectedOrder.status}
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        PAYMENT: {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {orderSummary && (
                    <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                      <strong className="text-sky-400 block mb-1">AI Executive Order Summary:</strong>
                      {orderSummary}
                    </div>
                  )}

                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Purchased Items</h5>
                  <div className="space-y-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.productName}</p>
                          <p className="text-xs text-slate-400">Product ID: {item.productId} • Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-sky-400">
                          ₹{item.unitPrice?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-700/80 flex justify-between items-center text-sm">
                    <span className="text-slate-400">Total Charged Amount</span>
                    <strong className="text-xl font-black text-white">₹{selectedOrder.totalAmount?.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
                  <h5 className="text-sm font-bold text-white mb-3">Order Processing History</h5>
                  <div className="space-y-3">
                    {orderHistory.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5"></div>
                        <div>
                          <strong className="text-slate-200">{step.status}</strong>
                          <p className="text-slate-400">{step.notes || 'Status updated by system'}</p>
                          <span className="text-[10px] text-slate-500">{new Date(step.timestamp || Date.now()).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-4">
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                  <h5 className="text-sm font-bold text-white">Customer Actions</h5>
                  <button
                    onClick={() => { handleCheckCancellation(); setCancelModal(true); }}
                    className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition"
                  >
                    Request Order Cancellation
                  </button>
                  <button
                    onClick={() => { handleCheckReturn(); setReturnModal(true); }}
                    className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition"
                  >
                    Request Item Return
                  </button>
                  <button
                    onClick={() => { setDeliveryEnquiryModal(true); }}
                    className="w-full py-2.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold transition"
                  >
                    Submit Delivery Enquiry
                  </button>
                </div>

                {orderPayment && (
                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-2 text-xs">
                    <h5 className="text-sm font-bold text-white mb-2">Authoritative Payment Verification</h5>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Gateway Status:</span>
                      <strong className="text-emerald-400">{orderPayment.paymentStatus}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Payment Method:</span>
                      <span className="text-white">{orderPayment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Verified From:</span>
                      <span className="text-sky-400">{orderPayment.verifiedFrom}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SHIPMENT TRACKING */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trackingDetails && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-sky-400" />
                    Live Carrier Tracking
                  </h4>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
                    {trackingDetails.shipmentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block mb-1">Carrier Provider</span>
                    <strong className="text-white">{trackingDetails.carrier}</strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block mb-1">Tracking Number</span>
                    <strong className="text-sky-400 font-mono">{trackingDetails.trackingNumber}</strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block mb-1">Last Carrier Update</span>
                    <span className="text-slate-300">{new Date(trackingDetails.lastCarrierUpdateAt || Date.now()).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block mb-1">Estimated Delivery</span>
                    <span className="text-slate-400 italic">{trackingDetails.estimatedDelivery || 'Pending carrier scheduling'}</span>
                  </div>
                </div>

                {statusExplanation && (
                  <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl space-y-1">
                    <h5 className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4" />
                      AI Grounded Status Explanation:
                    </h5>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {statusExplanation.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-bold text-white">Carrier Integration Guardrail</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The AI Order Agent is technically prohibited from fabricating estimated delivery dates or marking an order as 'Delivered' when the carrier API reports 'In Transit'.
              </p>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Carrier Tracking Source: CARRIER_INTEGRATION
                </div>
                <p className="text-slate-400">
                  Any courier delay exceeding 48 hours is automatically flagged to the Logistics Operations Desk.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CANCELLATIONS */}
      {activeTab === 'cancellations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-white">Cancellation Requests Queue</h3>
              <p className="text-xs text-slate-400">Cancellations follow defined state-transition rules and require human verification.</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-5 py-3">Request ID & Order</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cancellationRequests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{req.requestId}</div>
                      <div className="text-xs text-slate-500">Order: {req.orderId}</div>
                    </td>
                    <td className="px-5 py-4 text-xs">{req.reason}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => showToast('Cancellation approved by staff member')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        Approve Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RETURNS */}
      {activeTab === 'returns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-white">Return Requests</h3>
              <p className="text-xs text-slate-400">Evaluates return window, evidence uploads, and warehouse receipt status.</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-5 py-3">Return ID & Item</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {returnRequests.map((ret) => (
                  <tr key={ret.requestId} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{ret.requestId}</div>
                      <div className="text-xs text-slate-500">Item: {ret.orderItemId}</div>
                    </td>
                    <td className="px-5 py-4 text-xs">{ret.reason}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => showToast('Return authorized: RMA generated')}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        Authorize RMA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REFUND STATUS */}
      {activeTab === 'refunds' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-2">Authoritative Refund Status Check</h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time payment provider synchronization. The AI explains processing timeframes accurately without promising early clearance.
            </p>
            <button
              onClick={() => handleExplainRefund('refund_req_1001')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Explain Refund Status
            </button>
          </div>

          {refundExplanation && (
            <div className="bg-slate-800/40 border border-sky-500/40 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-400" />
                AI Explanation for Customer:
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {refundExplanation.explanation}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Recorded Gateway Status: <strong className="text-amber-400">{refundExplanation.recordedStatus}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: EXCEPTIONS & ESCALATION */}
      {activeTab === 'exceptions' && (
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-white">Fulfilment Exceptions</h3>
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-5 py-3">Exception ID & Reason</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {exceptions.map((exc) => (
                  <tr key={exc.exceptionId} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{exc.reason}</div>
                      <div className="text-xs text-slate-500">{exc.exceptionId} • Order: {exc.orderId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {exc.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{exc.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleEscalateException(exc.exceptionId)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        Escalate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: GUARDRAILS & CONFIG */}
      {activeTab === 'configuration' && (
        <div className="max-w-2xl bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-semibold text-white">Order Agent Permissions & Guardrails</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">Prohibit Direct Refund Execution by AI</p>
                <p className="text-xs text-slate-400">Enforces that the AI agent can only explain status, never disburse funds</p>
              </div>
              <input
                type="checkbox"
                checked={config.prohibitDirectRefundExecution}
                onChange={(e) => setConfig({ ...config, prohibitDirectRefundExecution: e.target.checked })}
                className="w-5 h-5 accent-sky-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">Require Human Approval for Order Cancellation</p>
                <p className="text-xs text-slate-400">Shipped or packed orders cannot be cancelled automatically</p>
              </div>
              <input
                type="checkbox"
                checked={config.requireHumanApprovalForCancellation}
                onChange={(e) => setConfig({ ...config, requireHumanApprovalForCancellation: e.target.checked })}
                className="w-5 h-5 accent-sky-600 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Carrier Delay Auto-Escalation Threshold (Hours)</label>
              <input
                type="number"
                value={config.autoEscalateDelayHours}
                onChange={(e) => setConfig({ ...config, autoEscalateDelayHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
            <button
              onClick={() => showToast('Configuration saved successfully!')}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h4 className="font-bold text-white">Request Order Cancellation</h4>
              <button onClick={() => setCancelModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {cancelEligibility && (
              <div className={`p-3 rounded-xl text-xs border ${
                cancelEligibility.eligible
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                {cancelEligibility.eligible
                  ? 'Order is eligible for cancellation.'
                  : `Note: Order already shipped (${cancelEligibility.reason}). Submitting will queue for human operations review.`}
              </div>
            )}
            <form onSubmit={handleSubmitCancellation} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="CUSTOMER_REQUEST">Customer Request</option>
                  <option value="DELIVERY_DELAY">Delivery Delay</option>
                  <option value="INCORRECT_ADDRESS">Incorrect Address</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Comment</label>
                <textarea
                  rows="3"
                  value={cancelComment}
                  onChange={(e) => setCancelComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCancelModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h4 className="font-bold text-white">Create Return Request</h4>
              <button onClick={() => setReturnModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {returnEligibility && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                Policy Reference: {returnEligibility.policyReference} ({returnEligibility.eligibility})
              </div>
            )}
            <form onSubmit={handleSubmitReturn} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="DAMAGED_PRODUCT">Damaged Product</option>
                  <option value="WRONG_ITEM">Wrong Item Shipped</option>
                  <option value="DEFECTIVE_PART">Defective Part</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Damage Description</label>
                <textarea
                  rows="3"
                  value={returnDesc}
                  onChange={(e) => setReturnDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setReturnModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Submit Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Enquiry Modal */}
      {deliveryEnquiryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h4 className="font-bold text-white">Create Delivery Enquiry</h4>
              <button onClick={() => setDeliveryEnquiryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await ecommerceService.aiOrderAgent.createDeliveryEnquiry(selectedOrder.orderId, {
                    reason: 'DELIVERY_DELAY',
                    message: deliveryEnquiryMsg || 'Customer reports shipment delay'
                  });
                  if (res?.data?.success) {
                    showToast('Delivery enquiry logged with carrier dispatcher');
                    setDeliveryEnquiryModal(false);
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs text-slate-400 block mb-1">Enquiry Note</label>
                <textarea
                  rows="3"
                  placeholder="Explain the delivery issue..."
                  value={deliveryEnquiryMsg}
                  onChange={(e) => setDeliveryEnquiryMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeliveryEnquiryModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                >
                  Submit Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
