import React, { useState, useEffect } from 'react';
import {
  KeyRound, Users, Calendar, CheckCircle2, Clock, ShieldCheck, BedDouble,
  DollarSign, RefreshCw, AlertTriangle, ArrowRight, UserCheck, Sparkles,
  FileText, Shield, X, ChevronRight, LogIn, LogOut, Check, Wrench
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';

export default function HotelFrontDeskView() {
  const [activeTab, setActiveTab] = useState('arrivals');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Metrics
  const [dashboard, setDashboard] = useState({
    date: '2026-10-28',
    expectedArrivals: 42,
    expectedDepartures: 31,
    inHouseGuests: 148,
    pendingCheckIns: 12,
    pendingCheckOuts: 7,
    roomsReady: 18,
    roomsAwaitingHousekeeping: 5,
    openGuestRequests: 9
  });

  // Main Lists
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [inHouseGuests, setInHouseGuests] = useState([]);
  const [assignableRooms, setAssignableRooms] = useState([]);
  const [roomMoves, setRoomMoves] = useState([]);
  const [guestRequests, setGuestRequests] = useState([]);
  const [housekeeping, setHousekeeping] = useState([]);

  // Check-In Guided Flow State
  const [checkInTarget, setCheckInTarget] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Check-Out Folio Flow State
  const [checkOutTarget, setCheckOutTarget] = useState(null);
  const [activeFolio, setActiveFolio] = useState(null);

  // Modals
  const [showRoomMoveModal, setShowRoomMoveModal] = useState(false);
  const [newRoomMove, setNewRoomMove] = useState({
    reservationId: 'res_1002',
    currentRoomId: 'room_1007',
    targetRoomId: 'room_1001',
    reason: 'Guest requested higher floor with balcony view'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, arr, dep, inH, moves, reqs, hk] = await Promise.allSettled([
        hotelService.frontDesk.getDashboard('2026-10-28'),
        hotelService.frontDesk.getArrivals('2026-11-05'),
        hotelService.frontDesk.getDepartures('2026-10-31'),
        hotelService.frontDesk.getInHouseGuests(),
        hotelService.frontDesk.getRoomMoveRequests(),
        hotelService.frontDesk.getGuestRequests(),
        hotelService.frontDesk.getHousekeepingStatus()
      ]);

      if (dash.status === 'fulfilled' && dash.value) setDashboard(dash.value);
      if (arr.status === 'fulfilled' && arr.value?.items) setArrivals(arr.value.items);
      else if (arr.status === 'fulfilled' && Array.isArray(arr.value)) setArrivals(arr.value);
      if (dep.status === 'fulfilled' && dep.value) setDepartures(dep.value);
      if (inH.status === 'fulfilled' && inH.value?.items) setInHouseGuests(inH.value.items);
      else if (inH.status === 'fulfilled' && Array.isArray(inH.value)) setInHouseGuests(inH.value);
      if (moves.status === 'fulfilled' && moves.value) setRoomMoves(moves.value);
      if (reqs.status === 'fulfilled' && reqs.value) setGuestRequests(reqs.value);
      if (hk.status === 'fulfilled' && hk.value?.items) setHousekeeping(hk.value.items);
      else if (hk.status === 'fulfilled' && Array.isArray(hk.value)) setHousekeeping(hk.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartCheckIn = async (resv) => {
    setCheckInTarget(resv);
    try {
      const elig = await hotelService.frontDesk.evaluateCheckInEligibility(resv.reservationId);
      setEligibility(elig);
      const rooms = await hotelService.frontDesk.getAssignableRooms(resv.reservationId);
      if (rooms?.roomOptions) {
        setAssignableRooms(rooms.roomOptions);
        if (rooms.roomOptions.length > 0) {
          setSelectedRoomId(rooms.roomOptions[0].roomId);
        }
      }
    } catch (err) {
      showToast('Error evaluating check-in eligibility');
    }
  };

  const handleCommitCheckIn = async () => {
    if (!checkInTarget || !selectedRoomId) return;
    try {
      await hotelService.frontDesk.assignRoom(checkInTarget.reservationId, { roomId: selectedRoomId });
      const checkinRes = await hotelService.frontDesk.processCheckIn(checkInTarget.reservationId, {
        roomId: selectedRoomId,
        guestVerificationReference: 'verified_front_desk'
      });
      showToast(`Guest checked in to Room ${selectedRoomId}!`);
      setCheckInTarget(null);
      setEligibility(null);
      loadData();
    } catch (err) {
      showToast('Check-in failed');
    }
  };

  const handleStartCheckOut = async (resv) => {
    setCheckOutTarget(resv);
    try {
      const folio = await hotelService.frontDesk.getFolio(resv.reservationId);
      setActiveFolio(folio);
    } catch (err) {
      showToast('Failed to retrieve folio');
    }
  };

  const handleCommitCheckOut = async () => {
    if (!checkOutTarget) return;
    try {
      await hotelService.frontDesk.processCheckOut(checkOutTarget.reservationId, {
        guestAcknowledgedCharges: true,
        notes: 'Guest completed departure'
      });
      showToast(`Check-out completed for ${checkOutTarget.confirmationNumber}`);
      setCheckOutTarget(null);
      setActiveFolio(null);
      loadData();
    } catch (err) {
      showToast('Check-out failed');
    }
  };

  const handleCreateRoomMove = async (e) => {
    e.preventDefault();
    try {
      await hotelService.frontDesk.createRoomMoveRequest(newRoomMove);
      showToast('Room change request logged');
      setShowRoomMoveModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to create room move request');
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
                Hotel Tenant — Role 4
              </span>
              <span className="text-xs text-indigo-300 font-medium">Reception & Guest Check-In / Out Desk</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 text-white">
              Front Desk & Reception Command
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Arrivals verification, room readiness matching, authoritative check-in, key card allocation, in-house room moves, and settled folio check-out.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoomMoveModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition"
            >
              <BedDouble className="w-4 h-4" />
              Room Move
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'arrivals', label: 'Expected Arrivals', icon: LogIn },
            { id: 'inhouse', label: 'In-House Guests', icon: Users },
            { id: 'departures', label: 'Departures & Folios', icon: LogOut },
            { id: 'housekeeping', label: 'Room Readiness & HK', icon: Sparkles },
            { id: 'moves', label: 'Room Moves', icon: BedDouble }
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

      {/* STAT STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Expected Arrivals</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboard.expectedArrivals}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Departures</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{dashboard.expectedDepartures}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">In-House Guests</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{dashboard.inHouseGuests}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Pending Check-in</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{dashboard.pendingCheckIns}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Rooms Inspected</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{dashboard.roomsReady}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Awaiting HK</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{dashboard.roomsAwaitingHousekeeping}</div>
        </div>
      </div>

      {/* TAB 1: EXPECTED ARRIVALS & CHECK-IN WORKFLOW */}
      {activeTab === 'arrivals' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Expected Arrivals Queue (Today)</h3>
              <span className="text-xs text-slate-400">Total: {arrivals.length} reservations</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Confirmation</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Reservation</th>
                  <th className="py-3 px-4">Room Allocation</th>
                  <th className="py-3 px-4 text-right">Check-in Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {arrivals.map((arr) => (
                  <tr key={arr.reservationId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">{arr.confirmationNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{arr.guestName}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{arr.checkInDate} → {arr.checkOutDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {arr.reservationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {arr.assignedRoom ? `Room ${arr.assignedRoom}` : <span className="text-amber-400 font-medium">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleStartCheckIn(arr)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 ml-auto"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Check-in Guest
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Guided Check-in Modal / Panel */}
          {checkInTarget && (
            <div className="p-6 bg-slate-900 border border-indigo-500/40 rounded-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-semibold">
                    Guided Check-in Wizard
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Check-in: {checkInTarget.guestName} ({checkInTarget.confirmationNumber})
                  </h3>
                </div>
                <button onClick={() => setCheckInTarget(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Eligibility Checklist */}
              {eligibility && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Reservation Verified</div>
                      <div className="text-slate-400">Confirmed & active</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">ID Verification</div>
                      <div className="text-slate-400">Recorded & compliant</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Folio Pre-Authorization</div>
                      <div className="text-slate-400">Payment method valid</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Room Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Select Clean & Ready Room:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {assignableRooms.map((rm) => (
                    <div
                      key={rm.roomId}
                      onClick={() => setSelectedRoomId(rm.roomId)}
                      className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                        selectedRoomId === rm.roomId
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-sm text-indigo-400">Room {rm.roomNumber}</div>
                      <div>Type: {rm.roomType}</div>
                      <div className="text-emerald-400 font-semibold mt-1">Status: CLEAN</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setCheckInTarget(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitCheckIn}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> Authorize Stay & Check In
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IN-HOUSE GUESTS */}
      {activeTab === 'inhouse' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Stay Range</th>
                  <th className="py-3 px-4">Folio Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {inHouseGuests.map((g) => (
                  <tr key={g.reservationId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-indigo-400">Room {g.roomNumber || '301'}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{g.guestName}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{g.checkInDate} → {g.checkOutDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {g.paymentStatus || 'SETTLED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setNewRoomMove({ ...newRoomMove, reservationId: g.reservationId });
                          setShowRoomMoveModal(true);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                      >
                        Room Move
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTURES & FOLIOS */}
      {activeTab === 'departures' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Confirmation</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Departure Date</th>
                  <th className="py-3 px-4">Folio Status</th>
                  <th className="py-3 px-4 text-right">Check-out Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {departures.map((dep) => (
                  <tr key={dep.reservationId} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">{dep.confirmationNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{dep.guestName}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">Room {dep.assignedRoom}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{dep.checkOutDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {dep.folioStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleStartCheckOut(dep)}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 ml-auto"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Inspect Folio & Settle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Folio Settlement Drawer */}
          {checkOutTarget && activeFolio && (
            <div className="p-6 bg-slate-900 border border-amber-500/40 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-semibold">
                    Guest Folio Settle Desk
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Departure: {checkOutTarget.guestName} (Room {checkOutTarget.assignedRoom})
                  </h3>
                </div>
                <button onClick={() => setCheckOutTarget(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Room Charges</span>
                  <span className="font-semibold text-white text-sm">₹{activeFolio.roomCharges?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">GST Taxes</span>
                  <span className="font-semibold text-white text-sm">₹{activeFolio.taxes?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Incidentals</span>
                  <span className="font-semibold text-white text-sm">₹{activeFolio.additionalCharges?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Balance Due</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{activeFolio.balanceDue?.toLocaleString()} (Settled)</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setCheckOutTarget(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitCheckOut}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirm Check-out (Queues Housekeeping Clean)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ROOM READINESS & HK */}
      {activeTab === 'housekeeping' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {housekeeping.map((hk) => (
              <div key={hk.roomId} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-white text-base">Room {hk.roomNumber}</div>
                <div className={`text-xs font-semibold ${
                  hk.status === 'CLEAN' || hk.status === 'INSPECTED'
                    ? 'text-emerald-400'
                    : hk.status === 'IN_PROGRESS'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  {hk.status}
                </div>
                <div className="text-[11px] text-slate-500">
                  {hk.assignmentEligible ? 'Eligible for stay' : 'Hold assignment'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ROOM MOVES */}
      {activeTab === 'moves' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {roomMoves.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                No pending room change requests.
              </div>
            ) : (
              roomMoves.map((m) => (
                <div key={m.requestId} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Move from {m.currentRoomId} → {m.targetRoomId}</div>
                    <div className="text-xs text-slate-400 mt-1">{m.reason}</div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-semibold">
                    {m.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ROOM MOVE */}
      {showRoomMoveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Submit Room Move Request</h3>
              <button onClick={() => setShowRoomMoveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoomMove} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Current Room</label>
                <input
                  type="text"
                  value={newRoomMove.currentRoomId}
                  onChange={(e) => setNewRoomMove({ ...newRoomMove, currentRoomId: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Target Clean Room</label>
                <input
                  type="text"
                  value={newRoomMove.targetRoomId}
                  onChange={(e) => setNewRoomMove({ ...newRoomMove, targetRoomId: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Reason</label>
                <textarea
                  rows={2}
                  value={newRoomMove.reason}
                  onChange={(e) => setNewRoomMove({ ...newRoomMove, reason: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRoomMoveModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Submit Room Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
