import React, { useState, useEffect } from 'react';
import {
  Calendar, Search, UserPlus, FileCheck, CheckCircle2, Clock, Send, AlertTriangle,
  RefreshCw, DollarSign, BedDouble, Mail, Phone, ChevronRight, X, ArrowRight,
  Shield, Edit3, Trash2, UserCheck, MessageSquare
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';

export default function HotelReservationExecutiveView() {
  const [activeTab, setActiveTab] = useState('availability');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard
  const [dashboard, setDashboard] = useState({
    enquiriesToday: 18,
    quotesActive: 14,
    confirmedBookingsToday: 9,
    pendingFollowUps: 7,
    cancellationsRequested: 2,
    averageQuoteConversion: 62.5
  });

  // Availability Search State
  const [searchParams, setSearchParams] = useState({
    checkInDate: '2026-11-05',
    checkOutDate: '2026-11-07',
    adults: 2,
    children: 0,
    rooms: 1,
    currency: 'INR'
  });
  const [availableOptions, setAvailableOptions] = useState([]);
  const [searchExecuted, setSearchExecuted] = useState(false);

  // Guests & Quotes
  const [guests, setGuests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activeQuote, setActiveQuote] = useState(null);

  // Modals
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    communicationPreference: 'EMAIL'
  });

  const [showModModal, setShowModModal] = useState(false);
  const [modTarget, setModTarget] = useState(null);
  const [modData, setModData] = useState({ newCheckInDate: '2026-11-06', newCheckOutDate: '2026-11-08', reason: 'Guest changed travel dates' });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelData, setCancelData] = useState({ reason: 'GUEST_REQUEST', comment: 'Guest canceled itinerary' });

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    enquiryId: 'enq_1001',
    guestId: 'guest_1001',
    type: 'EMAIL',
    dueAt: '2026-10-29T10:00:00+05:30',
    description: 'Follow up on villa availability quote'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, g, resv, enq, fu] = await Promise.allSettled([
        hotelService.reservationExecutive.getDashboard(),
        hotelService.reservationExecutive.getGuests(),
        hotelService.reservationExecutive.getReservations(),
        hotelService.reservationExecutive.getEnquiries(),
        hotelService.reservationExecutive.getFollowUps()
      ]);

      if (dash.status === 'fulfilled' && dash.value) setDashboard(dash.value);
      if (g.status === 'fulfilled' && g.value?.items) setGuests(g.value.items);
      else if (g.status === 'fulfilled' && Array.isArray(g.value)) setGuests(g.value);
      if (resv.status === 'fulfilled' && resv.value?.items) setReservations(resv.value.items);
      else if (resv.status === 'fulfilled' && Array.isArray(resv.value)) setReservations(resv.value);
      if (enq.status === 'fulfilled' && enq.value) setEnquiries(enq.value);
      if (fu.status === 'fulfilled' && fu.value) setFollowUps(fu.value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchAvailability = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await hotelService.reservationExecutive.searchAvailability(searchParams);
      if (res?.roomOptions) {
        setAvailableOptions(res.roomOptions);
        setSearchExecuted(true);
      }
    } catch (err) {
      showToast('Error searching availability');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    try {
      const g = await hotelService.reservationExecutive.createGuest(newGuest);
      showToast('Guest profile created');
      setShowGuestModal(false);
      setGuests([g, ...guests]);
    } catch (err) {
      showToast('Failed to create guest');
    }
  };

  const handleGenerateQuote = async (option) => {
    try {
      const quote = await hotelService.reservationExecutive.generateQuote({
        guestId: guests[0]?.guestId || 'guest_1001',
        roomTypeId: option.roomTypeId,
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms,
        currency: 'INR'
      });
      setActiveQuote(quote);
      showToast('Authoritative quotation generated');
    } catch (err) {
      showToast('Failed to generate quote');
    }
  };

  const handleBookFromQuote = async () => {
    if (!activeQuote) return;
    try {
      const res = await hotelService.reservationExecutive.createReservation({
        quoteId: activeQuote.quoteId,
        guestId: activeQuote.guestId || 'guest_1001',
        roomTypeId: 'roomtype_1001',
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms,
        specialRequests: 'High floor, non-smoking'
      });
      showToast(`Reservation created: ${res.confirmationNumber}`);
      setActiveQuote(null);
      loadData();
    } catch (err) {
      showToast('Booking failed or inventory mismatch');
    }
  };

  const handleConfirmReservation = async (reservationId) => {
    try {
      const res = await hotelService.reservationExecutive.confirmReservation(reservationId, { confirmationChannel: 'EMAIL' });
      showToast(`Reservation ${res.confirmationNumber} Confirmed!`);
      loadData();
    } catch (err) {
      showToast('Failed to confirm reservation');
    }
  };

  const handleSubmitModification = async (e) => {
    e.preventDefault();
    if (!modTarget) return;
    try {
      await hotelService.reservationExecutive.submitModificationRequest(modTarget.reservationId, modData);
      showToast('Modification request submitted for review');
      setShowModModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to submit modification');
    }
  };

  const handleSubmitCancellation = async (e) => {
    e.preventDefault();
    if (!cancelTarget) return;
    try {
      await hotelService.reservationExecutive.submitCancellationRequest(cancelTarget.reservationId, cancelData);
      showToast('Cancellation request submitted to policy audit');
      setShowCancelModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to submit cancellation');
    }
  };

  const handleCompleteFollowUp = async (taskId) => {
    try {
      await hotelService.reservationExecutive.completeFollowUp(taskId);
      showToast('Follow-up task completed');
      loadData();
    } catch (err) {
      showToast('Error completing follow-up');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-full uppercase tracking-wider">
                Hotel Tenant — Role 2
              </span>
              <span className="text-xs text-indigo-300 font-medium">Guest Reservations & Quotations Desk</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 text-white">
              Reservation Executive Workspace
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Search live room inventory, generate grounded price quotations, create and confirm bookings, and manage guest enquiries and follow-ups.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuestModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              Register Guest
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'availability', label: 'Availability & Quotations', icon: Search },
            { id: 'reservations', label: 'Active Reservations', icon: Calendar },
            { id: 'guests', label: 'Guest Profiles', icon: UserCheck },
            { id: 'enquiries', label: 'Enquiries & Activities', icon: MessageSquare },
            { id: 'followups', label: 'Scheduled Follow-ups', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Enquiries Today</span>
          <div className="text-2xl font-bold text-white mt-1">{dashboard.enquiriesToday}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Active Quotes</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{dashboard.quotesActive}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Confirmed Today</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboard.confirmedBookingsToday}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Pending Follow-ups</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{dashboard.pendingFollowUps}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Cancellations</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{dashboard.cancellationsRequested}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Quote Conversion</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{dashboard.averageQuoteConversion}%</div>
        </div>
      </div>

      {/* TAB 1: AVAILABILITY & QUOTES */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              Live Room Availability Query
            </h3>
            <form onSubmit={handleSearchAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-xs text-slate-400">Check-in</label>
                <input
                  type="date"
                  value={searchParams.checkInDate}
                  onChange={(e) => setSearchParams({ ...searchParams, checkInDate: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Check-out</label>
                <input
                  type="date"
                  value={searchParams.checkOutDate}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOutDate: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Adults</label>
                <select
                  value={searchParams.adults}
                  onChange={(e) => setSearchParams({ ...searchParams, adults: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Children</label>
                <select
                  value={searchParams.children}
                  onChange={(e) => setSearchParams({ ...searchParams, children: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value={0}>0 Children</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Rooms</label>
                <select
                  value={searchParams.rooms}
                  onChange={(e) => setSearchParams({ ...searchParams, rooms: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value={1}>1 Room</option>
                  <option value={2}>2 Rooms</option>
                  <option value={3}>3 Rooms</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
            </form>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableOptions.map((opt) => (
              <div key={opt.roomTypeId} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{opt.name}</h4>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {opt.availableRooms} Left
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  ₹{opt.pricePerNight?.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ night</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Estimated Total: ₹{opt.totalRoomPrice?.toLocaleString()} (2 nights)</div>
                  <div>Taxes and service fees calculated upon quotation.</div>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleGenerateQuote(opt)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
                  >
                    Generate Quotation
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Generated Quote Card */}
          {activeQuote && (
            <div className="p-5 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                    Valid Quote Generated: {activeQuote.quoteId}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{activeQuote.roomType} (2 Nights)</h3>
                </div>
                <button onClick={() => setActiveQuote(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Subtotal</span>
                  <span className="font-semibold text-white text-sm">₹{activeQuote.roomSubtotal?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">GST (18%)</span>
                  <span className="font-semibold text-white text-sm">₹{activeQuote.taxes?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Due</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{activeQuote.totalAmount?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Quote Validity</span>
                  <span className="font-medium text-amber-300 text-sm">Until 18:00 today</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleBookFromQuote}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Book Reservation (Availability Recheck)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Confirmation</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4">Stay Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reservations.map((res) => (
                  <tr key={res.reservationId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">{res.confirmationNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{res.guestName}</td>
                    <td className="py-3.5 px-4 text-slate-300">{res.roomType}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{res.checkInDate} → {res.checkOutDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        res.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {res.status === 'PENDING_CONFIRMATION' && (
                        <button
                          onClick={() => handleConfirmReservation(res.reservationId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        onClick={() => { setModTarget(res); setShowModModal(true); }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => { setCancelTarget(res); setShowCancelModal(true); }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950/40 text-rose-300 rounded-lg text-xs border border-rose-900/30"
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
      )}

      {/* TAB 3: GUEST PROFILES */}
      {activeTab === 'guests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guests.map((g) => (
              <div key={g.guestId} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{g.firstName} {g.lastName}</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
                    {g.vipStatus || 'STANDARD'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Email: {g.email}</div>
                  <div>Phone: {g.phone}</div>
                  <div>Verification: <span className="text-emerald-400 font-semibold">{g.verificationStatus || 'VERIFIED'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {enquiries.map((enq) => (
              <div key={enq.enquiryId} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400">{enq.guestName}</span>
                  <span className="text-slate-400">{enq.channel}</span>
                </div>
                <div className="text-sm font-semibold text-white">{enq.subject}</div>
                <p className="text-xs text-slate-400">{enq.message}</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status: {enq.status}</span>
                  <button
                    onClick={() => { setNewFollowUp({ ...newFollowUp, enquiryId: enq.enquiryId, guestId: enq.guestId || 'guest_1001' }); setShowFollowUpModal(true); }}
                    className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-lg font-medium hover:bg-indigo-600/50"
                  >
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {followUps.map((fu) => (
              <div key={fu.taskId} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{fu.description}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Due: {fu.dueAt}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">Status: {fu.status}</span>
                  </div>
                </div>
                {fu.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCompleteFollowUp(fu.taskId)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REGISTER GUEST */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Register Guest Profile</h3>
              <button onClick={() => setShowGuestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGuest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={newGuest.firstName}
                    onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newGuest.lastName}
                    onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Phone</label>
                <input
                  type="text"
                  required
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGuestModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT MODIFICATION */}
      {showModModal && modTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Modify Reservation ({modTarget.confirmationNumber})</h3>
              <button onClick={() => setShowModModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitModification} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">New Check-In Date</label>
                <input
                  type="date"
                  required
                  value={modData.newCheckInDate}
                  onChange={(e) => setModData({ ...modData, newCheckInDate: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">New Check-Out Date</label>
                <input
                  type="date"
                  required
                  value={modData.newCheckOutDate}
                  onChange={(e) => setModData({ ...modData, newCheckOutDate: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Reason for Change</label>
                <input
                  type="text"
                  required
                  value={modData.reason}
                  onChange={(e) => setModData({ ...modData, reason: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Submit Review Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT CANCELLATION */}
      {showCancelModal && cancelTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-rose-400">Cancel Reservation ({cancelTarget.confirmationNumber})</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCancellation} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Cancellation Policy Reason</label>
                <select
                  value={cancelData.reason}
                  onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="GUEST_REQUEST">GUEST_REQUEST</option>
                  <option value="FLIGHT_CANCELLED">FLIGHT_CANCELLED</option>
                  <option value="POLICY_OVERBOOKING">POLICY_OVERBOOKING</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Audit Comment</label>
                <textarea
                  required
                  value={cancelData.comment}
                  onChange={(e) => setCancelData({ ...cancelData, comment: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold"
                >
                  Submit Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE FOLLOW-UP */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Schedule Guest Follow-Up</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <input
                  type="text"
                  value={newFollowUp.description}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, description: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Channel</label>
                <select
                  value={newFollowUp.type}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="PHONE">PHONE</option>
                  <option value="WHATSAPP">WHATSAPP</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Due At</label>
                <input
                  type="text"
                  value={newFollowUp.dueAt}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, dueAt: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await hotelService.reservationExecutive.createFollowUp(newFollowUp);
                    showToast('Follow-up scheduled');
                    setShowFollowUpModal(false);
                    loadData();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
