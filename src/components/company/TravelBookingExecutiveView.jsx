import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { travelService } from '../../services/travelService';
import {
  Luggage,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Ticket,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Send,
  Building,
  Check,
  X,
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react';

export function TravelBookingExecutiveView({ initialSubTab = 'dashboard' }) {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState(initialSubTab); // 'dashboard' | 'handoffs' | 'bookings' | 'suppliers' | 'payments' | 'vouchers' | 'exceptions'

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [handoffs, setHandoffs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [exceptions, setExceptions] = useState([]);

  // Active selected entities
  const [selectedHandoff, setSelectedHandoff] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Supplier Search & Booking Form
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierBookingForm, setSupplierBookingForm] = useState({
    bookingId: 'TBOOK-1001',
    supplierId: 'SUP-101',
    productType: 'HOTEL',
    supplierOfferReference: 'OFFER-1001',
    travellerReference: 'TRAVELLER-SET-1001',
    currency: 'INR'
  });

  // Return Handoff Form
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Passport details or traveller full legal names missing');

  // Checkout Session
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, hoffs, bks, vchs, excs] = await Promise.all([
        travelService.bookingExecutive.getDashboard().catch(() => null),
        travelService.bookingExecutive.getHandoffs().catch(() => ({ items: [] })),
        travelService.bookingExecutive.getBookings().catch(() => []),
        travelService.bookingExecutive.getVouchers().catch(() => []),
        travelService.bookingExecutive.getExceptions().catch(() => [])
      ]);

      setDashboard(dash || {
        pendingHandoffs: 14,
        pendingSupplierConfirmations: 9,
        confirmedBookings: 84,
        paymentPendingBookings: 6,
        bookingExceptions: 4,
        pendingCancellations: 3
      });
      setHandoffs(hoffs?.items?.length ? hoffs.items : [
        {
          handoffId: 'HANDOFF-1001',
          leadId: 'LEAD-1001',
          quoteId: 'TQUOTE-1001',
          itineraryId: 'ITIN-1001',
          status: 'PENDING_BOOKING_REVIEW',
          supplierConfirmationRequired: true
        }
      ]);
      setBookings(bks?.length ? bks : [
        {
          bookingId: 'TBOOK-1001',
          bookingReference: 'TRV-1001',
          destination: 'Bali',
          departureDate: '2026-12-10',
          returnDate: '2026-12-15',
          status: 'PENDING_CONFIRMATION',
          supplierStatus: 'CONFIRMED',
          totalAmount: 63000,
          currency: 'INR'
        }
      ]);
      setVouchers(vchs?.length ? vchs : [
        {
          voucherId: 'VOUCHER-1001',
          bookingId: 'TBOOK-1001',
          voucherType: 'HOTEL_CONFIRMATION',
          status: 'GENERATED',
          documentReference: 'DOC-1001'
        }
      ]);
      setExceptions(excs?.length ? excs : [
        {
          exceptionId: 'EXC-1001',
          bookingId: 'TBOOK-1001',
          title: 'Hotel Room Category Sold Out',
          status: 'OPEN',
          severity: 'MEDIUM'
        }
      ]);
    } catch {
      addNotification('Using default operations state.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptHandoff = async (handoffId) => {
    try {
      await travelService.bookingExecutive.acceptHandoff(handoffId, {
        notes: 'Booking details reviewed; supplier availability verified'
      });
      addNotification(`Handoff ${handoffId} accepted into operations!`, 'success');
      loadData();
    } catch (err) {
      addNotification(err.message || 'Acceptance failed', 'error');
    }
  };

  const handleReturnHandoff = async () => {
    if (!selectedHandoff) return;
    try {
      await travelService.bookingExecutive.returnHandoff(selectedHandoff.handoffId, {
        reason: returnReason
      });
      addNotification(`Handoff returned to consultant for revisions!`, 'info');
      setShowReturnModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Return failed', 'error');
    }
  };

  const handleValidateBooking = async (bookingId) => {
    try {
      const res = await travelService.bookingExecutive.validateBooking(bookingId);
      addNotification(
        res.readyForConfirmation
          ? 'Booking passed all readiness checks!'
          : 'Pending supplier confirmations before final confirmation.',
        'info'
      );
    } catch (err) {
      addNotification(err.message || 'Validation failed', 'error');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await travelService.bookingExecutive.confirmBooking(bookingId);
      addNotification(`Booking ${bookingId} confirmed!`, 'success');
      loadData();
    } catch (err) {
      addNotification(err.message || 'Confirmation failed', 'error');
    }
  };

  const handleSubmitSupplierBooking = async (e) => {
    e.preventDefault();
    try {
      await travelService.bookingExecutive.submitSupplierBooking(supplierBookingForm);
      addNotification('Supplier reservation request submitted!', 'success');
      setShowSupplierModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Supplier booking failed', 'error');
    }
  };

  const handleCreateCheckoutSession = async (bookingId) => {
    try {
      const res = await travelService.bookingExecutive.createCheckoutSession({
        bookingId,
        amount: 63000,
        currency: 'INR',
        purpose: 'BOOKING_PAYMENT'
      });
      setCheckoutUrl(res.checkoutUrl);
      addNotification(`Payment Checkout Session created (${res.paymentReference})!`, 'success');
    } catch (err) {
      addNotification(err.message || 'Checkout creation failed', 'error');
    }
  };

  const handleGenerateVoucher = async (bookingId) => {
    try {
      await travelService.bookingExecutive.generateVoucher(bookingId, {
        voucherType: 'HOTEL_CONFIRMATION',
        includeSupplierReference: true
      });
      addNotification(`Official Voucher generated for ${bookingId}!`, 'success');
      loadData();
    } catch (err) {
      addNotification(err.message || 'Voucher generation failed', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-xl text-white shadow-md">
            <Luggage className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Booking Operations Executive
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                Reservations & Fulfillment
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Convert accepted travel plans into confirmed hotel & flight reservations, process payments, and issue vouchers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow hover:from-purple-500 hover:to-indigo-500 font-medium"
          >
            <Building className="w-4 h-4" />
            Supplier Booking
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Operations Overview', icon: Luggage },
          { id: 'handoffs', label: 'Pending Handoffs', icon: ArrowRight },
          { id: 'bookings', label: 'Bookings Management', icon: ShieldCheck },
          { id: 'suppliers', label: 'Supplier Reservations', icon: Building },
          { id: 'payments', label: 'Payments & Checkout', icon: CreditCard },
          { id: 'vouchers', label: 'Vouchers & Documents', icon: Ticket },
          { id: 'exceptions', label: 'Booking Exceptions', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Pending Handoffs</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {dashboard?.pendingHandoffs || 14}
              </p>
              <span className="text-xs text-gray-500 font-medium">Awaiting operations review</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Supplier Confirmations</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {dashboard?.pendingSupplierConfirmations || 9}
              </p>
              <span className="text-xs text-gray-500 font-medium">Hotel/Flight status pending</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Confirmed Trips</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {dashboard?.confirmedBookings || 84}
              </p>
              <span className="text-xs text-gray-500 font-medium">Fully booked & voucher ready</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Booking Exceptions</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {dashboard?.bookingExceptions || 4}
              </p>
              <span className="text-xs text-rose-600 font-medium">Requires supplier intervention</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Handoffs */}
      {activeTab === 'handoffs' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Travel Plan Handoffs from Consultants</h2>
            <p className="text-xs text-gray-500">Review guest acceptance, traveller information completeness, and accept for processing.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="py-3 px-4">Handoff ID</th>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Quote ID</th>
                  <th className="py-3 px-4">Itinerary ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {handoffs.map((h) => (
                  <tr key={h.handoffId} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">{h.handoffId}</td>
                    <td className="py-3.5 px-4">{h.leadId}</td>
                    <td className="py-3.5 px-4">{h.quoteId}</td>
                    <td className="py-3.5 px-4">{h.itineraryId}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleAcceptHandoff(h.handoffId)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHandoff(h);
                          setShowReturnModal(true);
                        }}
                        className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Internal Booking Records</h2>
            <p className="text-xs text-gray-500">Validate traveller readiness, check payment & supplier status, and confirm reservations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="py-3 px-4">Booking ID / Ref</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Supplier Status</th>
                  <th className="py-3 px-4">Booking Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{b.bookingId}</div>
                      <div className="text-xs text-gray-400">{b.bookingReference}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-purple-700 dark:text-purple-400">{b.destination}</td>
                    <td className="py-3.5 px-4 text-xs">{b.departureDate} → {b.returnDate}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {b.supplierStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleValidateBooking(b.bookingId)}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-200"
                      >
                        Validate
                      </button>
                      <button
                        onClick={() => handleConfirmBooking(b.bookingId)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleGenerateVoucher(b.bookingId)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
                      >
                        Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Supplier Reservations */}
      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Supplier Reservations</h2>
              <p className="text-xs text-gray-500">Atomic supplier requests with idempotency keys and reconciliation.</p>
            </div>
            <button
              onClick={() => setShowSupplierModal(true)}
              className="px-3.5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-500"
            >
              + Submit Reservation
            </button>
          </div>

          <div className="p-5 border rounded-2xl bg-gray-50/50 dark:bg-gray-750/50 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">SB-1001 — Bali Paradise DMC (SUP-101)</h3>
                <p className="text-xs text-gray-500">Booking: TBOOK-1001 • Product: HOTEL • Supplier Ref: SUP-CONF-12345</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                CONFIRMED
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 pt-2 flex items-center justify-between">
              <span>Verified at: 2026-10-28T16:30:00+05:30</span>
              <button
                onClick={async () => {
                  await travelService.bookingExecutive.reconcileSupplierBooking('SB-1001');
                  addNotification('Supplier booking SB-1001 reconciled successfully!', 'success');
                }}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100"
              >
                Reconcile Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Payments & Checkout */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Operations</h2>
            <p className="text-xs text-gray-500">Generate secure payment checkout sessions and verify gateway webhooks.</p>
          </div>

          <div className="p-5 border rounded-2xl bg-gray-50/50 dark:bg-gray-750/50 space-y-4 max-w-lg">
            <h3 className="font-semibold text-sm">Create Checkout Link for TBOOK-1001</h3>
            <p className="text-xs text-gray-500">Payable amount: ₹63,000 INR</p>
            <button
              onClick={() => handleCreateCheckoutSession('TBOOK-1001')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
            >
              Generate Gateway Checkout Link
            </button>

            {checkoutUrl && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border text-xs break-all space-y-1">
                <span className="text-gray-500 font-medium">Checkout URL:</span>
                <p className="text-indigo-600 font-semibold">{checkoutUrl}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Vouchers & Documents */}
      {activeTab === 'vouchers' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Travel Vouchers & Passes</h2>
            <p className="text-xs text-gray-500">Only issued for supplier-confirmed components.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => (
              <div key={v.voucherId} className="p-4 border rounded-xl bg-gray-50/50 dark:bg-gray-750/50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm">{v.voucherId} — {v.voucherType}</h3>
                    <p className="text-xs text-gray-500">Booking: {v.bookingId} • Document Ref: {v.documentReference}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {v.status}
                  </span>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={async () => {
                      await travelService.bookingExecutive.sendVoucher(v.voucherId, { channel: 'EMAIL' });
                      addNotification(`Voucher ${v.voucherId} emailed to guest!`, 'success');
                    }}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-500"
                  >
                    Email Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Booking Exceptions */}
      {activeTab === 'exceptions' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Booking & Supplier Exceptions
            </h2>
            <p className="text-xs text-gray-500">Handle inventory shortages, supplier rejections, and booking disputes.</p>
          </div>

          <div className="space-y-3">
            {exceptions.map((exc) => (
              <div key={exc.exceptionId} className="p-4 border rounded-xl bg-rose-50/30 border-rose-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{exc.title}</h3>
                  <p className="text-xs text-rose-600 font-medium">{exc.exceptionId} • Booking: {exc.bookingId} • Severity: {exc.severity}</p>
                </div>
                <button
                  onClick={async () => {
                    await travelService.bookingExecutive.resolveException(exc.exceptionId);
                    addNotification(`Exception ${exc.exceptionId} resolved!`, 'success');
                    loadData();
                  }}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Supplier Booking */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submit Supplier Reservation</h2>
            <form onSubmit={handleSubmitSupplierBooking} className="space-y-3">
              <div>
                <label className="text-xs font-medium">Booking ID</label>
                <input
                  type="text"
                  required
                  value={supplierBookingForm.bookingId}
                  onChange={(e) => setSupplierBookingForm({ ...supplierBookingForm, bookingId: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Supplier ID</label>
                <input
                  type="text"
                  required
                  value={supplierBookingForm.supplierId}
                  onChange={(e) => setSupplierBookingForm({ ...supplierBookingForm, supplierId: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Supplier Offer Reference</label>
                <input
                  type="text"
                  required
                  value={supplierBookingForm.supplierOfferReference}
                  onChange={(e) => setSupplierBookingForm({ ...supplierBookingForm, supplierOfferReference: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Product Type</label>
                <select
                  value={supplierBookingForm.productType}
                  onChange={(e) => setSupplierBookingForm({ ...supplierBookingForm, productType: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                >
                  <option value="HOTEL">Hotel Accommodation</option>
                  <option value="FLIGHT">Flight Reservation</option>
                  <option value="TRANSFER">Airport Transfer</option>
                  <option value="ACTIVITY">Excursion / Tour Activity</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowSupplierModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-500">
                  Submit Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Return Handoff */}
      {showReturnModal && selectedHandoff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Return Handoff {selectedHandoff.handoffId}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">Return Reason / Missing Information</label>
                <textarea
                  rows="3"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onClick={() => setShowReturnModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                Cancel
              </button>
              <button
                onClick={handleReturnHandoff}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-500"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
