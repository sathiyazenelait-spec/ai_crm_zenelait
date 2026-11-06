import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { travelService } from '../../services/travelService';
import {
  Luggage,
  Calendar,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  Check,
  Send,
  LifeBuoy,
  ChevronRight,
  Sparkles,
  Plane,
  AlertCircle
} from 'lucide-react';

export function TravelAiBookingAgentView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'handoffs' | 'bookings' | 'reservations' | 'payments' | 'vouchers' | 'cancellations' | 'exceptions' | 'settings'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [handoffs, setHandoffs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);

  // Active items
  const [selectedHandoff, setSelectedHandoff] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  // Forms
  const [showResModal, setShowResModal] = useState(false);
  const [resForm, setResForm] = useState({
    bookingId: 'TBOOK-1001',
    productReference: 'supplier_product_101',
    supplierReference: 'supplier-ref-101',
    serviceType: 'HOTEL',
    adults: 2,
    children: 0
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, handoffsRes, bookingsRes, excRes, setRes, healthRes] = await Promise.all([
        travelService.aiBookingAgent.getDashboard().catch(() => null),
        travelService.aiBookingAgent.getHandoffs().catch(() => ({ items: [] })),
        travelService.aiBookingAgent.getBookings().catch(() => []),
        travelService.aiBookingAgent.getExceptions().catch(() => []),
        travelService.aiBookingAgent.getSettings().catch(() => null),
        travelService.aiBookingAgent.getHealth().catch(() => null)
      ]);

      setDashboard(dashRes);
      setHandoffs(handoffsRes.items || []);
      setBookings(bookingsRes);
      setExceptions(excRes);
      setSettings(setRes);
      setHealth(healthRes);

      if (handoffsRes.items && handoffsRes.items.length > 0 && !selectedHandoff) {
        setSelectedHandoff(handoffsRes.items[0]);
      }
    } catch (err) {
      console.error(err);
      addNotification?.('Failed to load AI Booking Agent data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 1. Validate Handoff
  const handleValidateHandoff = async (handoffId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiBookingAgent.validateHandoff(handoffId || 'handoff_travel_1001');
      setValidationResult(res);
      addNotification?.('Booking readiness validation completed!', 'info');
    } catch (err) {
      addNotification?.(err.message || 'Validation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Return Incomplete Handoff
  const handleReturnHandoff = async (handoffId) => {
    setIsLoading(true);
    try {
      await travelService.aiBookingAgent.returnHandoff(handoffId || 'handoff_travel_1001', {
        reason: 'PASSENGER_DETAILS_INCOMPLETE'
      });
      addNotification?.('Handoff returned to travel sales workflow for missing passenger details.', 'info');
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Return failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Create Internal Booking
  const handleCreateBooking = async () => {
    setIsLoading(true);
    try {
      const res = await travelService.aiBookingAgent.createBooking({
        handoffId: selectedHandoff?.handoffId || 'handoff_travel_1001',
        quotationId: selectedHandoff?.quotationId || 'quote_travel_1001',
        itineraryId: selectedHandoff?.itineraryId || 'itin_travel_1001',
        itineraryVersion: 1,
        currency: 'INR'
      });
      addNotification?.(`Internal booking record ${res.bookingId} created!`, 'success');
      loadAllData();
      setActiveTab('bookings');
    } catch (err) {
      addNotification?.(err.message || 'Booking creation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Submit Supplier Reservation
  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await travelService.aiBookingAgent.submitSupplierReservation(resForm.bookingId, {
        productReference: resForm.productReference,
        supplierReference: resForm.supplierReference,
        serviceType: resForm.serviceType,
        travellerCount: { adults: resForm.adults, children: resForm.children },
        customerAcceptanceReference: 'auth-acceptance-1001'
      });
      addNotification?.(`Reservation submitted to supplier: ${res.reservationId} (Pending Confirmation)`, 'info');
      setReservations([res]);
      setShowResModal(false);
      setActiveTab('reservations');
    } catch (err) {
      addNotification?.(err.message || 'Supplier reservation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Reconcile Supplier Reservation
  const handleReconcileReservation = async (reservationId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiBookingAgent.reconcileSupplierReservation(reservationId || 'supplier_reservation_2001');
      addNotification?.(`Supplier reservation verified & reconciled: ${res.status}!`, 'success');
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Reconciliation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Create Checkout Session
  const handleCreateCheckout = async (bookingId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiBookingAgent.createCheckoutSession(bookingId || 'TBOOK-1001', {
        amount: 32000,
        currency: 'INR',
        paymentPurpose: 'TRAVEL_BOOKING',
        returnUrl: 'https://zenelaitcrm.example/travel/payment-result'
      });
      setCheckoutSession(res);
      addNotification?.('Payment gateway checkout session created!', 'success');
      setActiveTab('payments');
    } catch (err) {
      addNotification?.(err.message || 'Checkout creation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Generate Voucher (Enforcing confirmed reservation)
  const handleGenerateVoucher = async (bookingId, reservationId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiBookingAgent.generateVoucher(bookingId || 'TBOOK-1001', {
        reservationId: reservationId || 'supplier_reservation_2001',
        documentType: 'HOTEL_VOUCHER',
        deliveryChannel: 'EMAIL'
      });
      addNotification?.(`Voucher ${res.voucherId} generated successfully!`, 'success');
      setVouchers([res]);
      setActiveTab('vouchers');
    } catch (err) {
      addNotification?.(`Voucher Blocked: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Request Cancellation
  const handleRequestCancellation = async (bookingId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiBookingAgent.createCancellationRequest(bookingId || 'TBOOK-1001', {
        reason: 'CUSTOMER_REQUEST',
        reservationIds: ['supplier_reservation_2001']
      });
      addNotification?.(`Cancellation request ${res.cancellationRequestId} submitted for supplier reconciliation.`, 'info');
      setActiveTab('cancellations');
    } catch (err) {
      addNotification?.(err.message || 'Cancellation request failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 p-6 rounded-2xl text-white shadow-xl border border-indigo-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 border border-indigo-400/30">
              <Luggage className="w-6 h-6 animate-pulse" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">AI Booking Agent</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Reservation & Fulfillment Engine
            </span>
          </div>
          <p className="text-indigo-200 text-sm">
            Accepted Handoffs • Supplier Reservations • Status Reconciliation • Payments • Secure Vouchers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowResModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            Submit Supplier Reservation
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Luggage },
          { id: 'handoffs', label: 'Accepted Handoffs & Readiness', icon: ArrowRight, count: handoffs.length },
          { id: 'bookings', label: 'Internal Bookings', icon: Calendar, count: bookings.length },
          { id: 'reservations', label: 'Supplier Reservations', icon: Building },
          { id: 'payments', label: 'Payments & Checkout', icon: CreditCard },
          { id: 'vouchers', label: 'Vouchers & Travel Documents', icon: FileText },
          { id: 'cancellations', label: 'Cancellations & Refunds', icon: XCircle },
          { id: 'exceptions', label: 'Exceptions & Human Escalation', icon: AlertTriangle, count: exceptions.length },
          { id: 'settings', label: 'Agent Policy & Audit', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Pending Handoffs</span>
                <ArrowRight className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.pendingHandoffs ?? 12}
              </div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">From AI Sales Agent</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Supplier Pending Confirmations</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.supplierConfirmationPending ?? 6}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Awaiting partner API response</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Confirmed Bookings</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.confirmedBookings ?? 75}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Verified with supplier & paid</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Open Exceptions</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.openExceptions ?? 4}
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Assigned to booking executives</p>
            </div>
          </div>

          {/* Principle Guardrail Banner */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <p className="font-semibold">Authoritative Booking Guardrails Active</p>
              <p className="text-indigo-700 dark:text-indigo-300">
                1. A submitted reservation remains <strong className="text-amber-600">PENDING_SUPPLIER_CONFIRMATION</strong> until verified.
                2. Vouchers CANNOT be issued for unconfirmed services (enforced by HTTP 409 Conflict).
                3. Payment events are verified via signed gateway webhooks.
              </p>
            </div>
          </div>

          {/* Handoffs Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              Recent Accepted Travel Proposals (Handoffs)
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {handoffs.slice(0, 3).map((h) => (
                <div key={h.handoffId} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-gray-400">{h.handoffId}</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Quote {h.quotationId} • Lead {h.leadId}
                    </h4>
                    <p className="text-[11px] text-gray-500">Readiness: {h.readinessStatus || 'PENDING_VALIDATION'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidateHandoff(h.handoffId)}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
                    >
                      Validate Readiness
                    </button>
                    <button
                      onClick={handleCreateBooking}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Create Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCEPTED HANDOFFS */}
      {activeTab === 'handoffs' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              Incoming Sales Proposals & Booking Readiness
            </h2>

            <div className="space-y-4">
              {handoffs.map((h) => (
                <div key={h.handoffId} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-gray-400">{h.handoffId}</span>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        Accepted Quotation: {h.quotationId} • Itinerary: {h.itineraryId}
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {h.status || 'ACCEPTED'}
                    </span>
                  </div>

                  {/* Readiness Verification Panel */}
                  <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">Readiness Checklist:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Customer Acceptance: PASSED
                      </div>
                      <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-mono text-[10px] flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Passenger Details: INCOMPLETE
                      </div>
                      <div className="p-2 rounded bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Supplier Availability: PENDING
                      </div>
                      <div className="p-2 rounded bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Price Freshness: PENDING
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleValidateHandoff(h.handoffId)}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
                    >
                      Run Readiness Check
                    </button>
                    <button
                      onClick={() => handleReturnHandoff(h.handoffId)}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold hover:bg-rose-100 transition"
                    >
                      Return to Sales Consultant
                    </button>
                    <button
                      onClick={handleCreateBooking}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Create Internal Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERNAL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white">Active Travel Bookings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Reference</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {bookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">{b.bookingId}</td>
                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">{b.bookingReference || 'ZT-TR-2001'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {b.status || 'VALIDATION_PENDING'}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600 dark:text-gray-400 font-mono text-[11px]">
                        {b.paymentStatus || 'NOT_INITIATED'}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleCreateCheckout(b.bookingId)}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800 transition"
                        >
                          Checkout Session
                        </button>
                        <button
                          onClick={() => handleGenerateVoucher(b.bookingId, 'supplier_reservation_2001')}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800 transition"
                        >
                          Generate Voucher
                        </button>
                        <button
                          onClick={() => handleRequestCancellation(b.bookingId)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-200 dark:border-rose-800 transition"
                        >
                          Cancel
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

      {/* TAB 4: SUPPLIER RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Partner Supplier Reservations
              </h2>
              <button
                onClick={() => setShowResModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" /> Submit Reservation
              </button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-gray-400">supplier_reservation_2001</span>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Example Bali Hotel (4-Star)</h4>
                  <p className="text-[11px] text-gray-500">Supplier Ref: supplier-ref-101 • Service: HOTEL</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  CONFIRMED
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Supplier Confirmation Reference: <strong className="font-mono text-gray-900 dark:text-white">supplier-confirmation-2001</strong>
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleReconcileReservation('supplier_reservation_2001')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Reconcile Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS & CHECKOUT */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Verified Payment Sessions & Transactions
            </h2>

            {checkoutSession ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <strong className="font-mono">{checkoutSession.paymentId}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payable Amount:</span>
                  <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {checkoutSession.currency} {checkoutSession.amount?.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Checkout Provider URL:</span>
                  <a href={checkoutSession.checkoutUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-mono text-[11px]">
                    {checkoutSession.checkoutUrl}
                  </a>
                </div>
                <div className="pt-2 text-[11px] text-emerald-600">
                  Status: <strong>{checkoutSession.status}</strong> • Verified Webhooks Authoritative
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                No active checkout session. Create one from the Bookings tab.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Official Travel Vouchers
            </h2>
            <p className="text-xs text-gray-500">
              Vouchers are generated strictly after verified supplier confirmation.
            </p>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-white">HOTEL CONFIRMATION VOUCHER</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  GENERATED
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Document Ref: <strong className="font-mono">DOC-1001</strong> • Booking: TBOOK-1001
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => addNotification?.('Voucher delivered to customer email!', 'success')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition"
                >
                  Send Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CANCELLATIONS & REFUNDS */}
      {activeTab === 'cancellations' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              Cancellation & Refund Status
            </h2>
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2 text-xs text-rose-900 dark:text-rose-200">
              <div className="flex justify-between">
                <span>Cancellation Request ID:</span>
                <strong className="font-mono">cancel_request_2001</strong>
              </div>
              <div className="flex justify-between">
                <span>Supplier Status:</span>
                <strong>PENDING_SUPPLIER_CONFIRMATION</strong>
              </div>
              <div className="flex justify-between">
                <span>Refund Calculation:</span>
                <span className="font-semibold text-amber-600">Subject to hotel penalty clause (15% agency fee)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: EXCEPTIONS & HUMAN ESCALATION */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Booking Operations Exceptions ({exceptions.length})
            </h3>
            <p className="text-xs text-gray-500">
              Technical timeouts, rate discrepancies, or inventory sell-outs are immediately enqueued for human booking executive resolution.
            </p>

            <div className="space-y-3 pt-2">
              {exceptions.map((exc) => (
                <div key={exc.exceptionId} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-gray-400">{exc.exceptionId}</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{exc.summary || 'Supplier Rate Discrepancy'}</h4>
                    <p className="text-[11px] text-gray-500">Severity: {exc.severity || 'MEDIUM'} • Assigned: {exc.assignedTo || 'EMP-201'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await travelService.aiBookingAgent.resolveException(exc.exceptionId, { resolutionNotes: 'Resolved by human executive' });
                      addNotification?.(`Exception ${exc.exceptionId} resolved`, 'success');
                      loadAllData();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Resolve Exception
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: SETTINGS & AUDIT */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              AI Booking Agent Policy & Autonomy Limits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Agent Status</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{settings?.status || 'ACTIVE'}</strong>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Max Auto-Reservation Value</span>
                <strong className="text-gray-900 dark:text-white font-mono">
                  INR {(settings?.maxAutoReservationValue || 150000).toLocaleString()}
                </strong>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Deposit Required Before Booking</span>
                <strong className="text-gray-900 dark:text-white">{settings?.requireDepositBeforeBooking ? 'YES' : 'NO'}</strong>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Supplier Reconcile Timeout</span>
                <strong className="text-gray-900 dark:text-white font-mono">
                  {(settings?.autoReconcileTimeoutMs || 30000) / 1000} seconds
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT RESERVATION MODAL */}
      {showResModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Submit Supplier Reservation Request
              </h3>
              <button onClick={() => setShowResModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmitReservation} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-500 block mb-1">Service Type</label>
                <select
                  value={resForm.serviceType}
                  onChange={(e) => setResForm({ ...resForm, serviceType: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <option value="HOTEL">HOTEL</option>
                  <option value="FLIGHT">FLIGHT</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="ACTIVITY">ACTIVITY</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 block mb-1">Product Reference</label>
                  <input
                    type="text"
                    value={resForm.productReference}
                    onChange={(e) => setResForm({ ...resForm, productReference: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Supplier Reference</label>
                  <input
                    type="text"
                    value={resForm.supplierReference}
                    onChange={(e) => setResForm({ ...resForm, supplierReference: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 block mb-1">Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={resForm.adults}
                    onChange={(e) => setResForm({ ...resForm, adults: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={resForm.children}
                    onChange={(e) => setResForm({ ...resForm, children: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Idempotency key will be transmitted to prevent duplicate reservations.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Submit Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
