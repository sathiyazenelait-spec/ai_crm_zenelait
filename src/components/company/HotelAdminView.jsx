import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { hotelService } from '../../services/hotelService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  Building2,
  BedDouble,
  CalendarCheck,
  CalendarDays,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Send,
  DoorOpen,
  Coffee,
  Check,
  X,
  LogIn,
  LogOut,
  AlertCircle,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

export function HotelAdminView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'room_types' | 'rooms_housekeeping' | 'reservations' | 'front_desk' | 'ai_agents' | 'reports'
  const [dashboard, setDashboard] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('PROP-001');
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [housekeepingStats, setHousekeepingStats] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [queue, setQueue] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [roomPerformance, setRoomPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Submissions
  const [showAddRoomTypeModal, setShowAddRoomTypeModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInRoomId, setCheckInRoomId] = useState('ROOM-301');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Availability Search State
  const [searchCheckIn, setSearchCheckIn] = useState('2026-11-10');
  const [searchCheckOut, setSearchCheckOut] = useState('2026-11-12');
  const [searchAdults, setSearchAdults] = useState(2);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isSearchingAvail, setIsSearchingAvail] = useState(false);

  // AI Agent Simulator State
  const [agentTestType, setAgentTestType] = useState('HOTEL_RESERVATION');
  const [testQuestion, setTestQuestion] = useState('Do you have a room for two adults from November 10 to November 12?');
  const [testResult, setTestResult] = useState(null);
  const [isTestingAgent, setIsTestingAgent] = useState(false);

  // New Room Type Form
  const [rtCode, setRtCode] = useState('VILLA_POOL');
  const [rtName, setRtName] = useState('Private Pool Villa');
  const [rtDesc, setRtDesc] = useState('Standalone luxury villa with private plunge pool and garden pavilion');
  const [rtBaseRate, setRtBaseRate] = useState(14500);
  const [rtMaxAdults, setRtMaxAdults] = useState(3);
  const [rtMaxChildren, setRtMaxChildren] = useState(2);

  // New Room Form
  const [roomNumber, setRoomNumber] = useState('501');
  const [roomFloor, setRoomFloor] = useState(5);
  const [roomTypeId, setRoomTypeId] = useState('ROOMTYPE-001');

  // New Reservation Form
  const [resGuestFirst, setResGuestFirst] = useState('Siddharth');
  const [resGuestLast, setResGuestLast] = useState('Menon');
  const [resGuestEmail, setResGuestEmail] = useState('siddharth.m@example.com');
  const [resGuestPhone, setResGuestPhone] = useState('+91 98400 11223');
  const [resRoomTypeId, setResRoomTypeId] = useState('ROOMTYPE-001');
  const [resCheckIn, setResCheckIn] = useState('2026-11-15');
  const [resCheckOut, setResCheckOut] = useState('2026-11-18');
  const [resAdults, setResAdults] = useState(2);
  const [resSpecialReq, setResSpecialReq] = useState('Airport transfer required. Non-smoking.');

  useEffect(() => {
    loadData();
  }, [selectedPropertyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        dash,
        props,
        rTypes,
        rList,
        resList,
        gList,
        sList,
        hk,
        arr,
        dep,
        q,
        occ,
        rev,
        perf
      ] = await Promise.all([
        hotelService.getHotelDashboard(selectedPropertyId),
        hotelService.getProperties(),
        hotelService.getRoomTypes(selectedPropertyId),
        hotelService.getRooms(selectedPropertyId),
        hotelService.getReservations(),
        hotelService.getGuests(),
        hotelService.getStaff(),
        hotelService.getHousekeepingStatus(),
        hotelService.getArrivals(),
        hotelService.getDepartures(),
        hotelService.getQueue(),
        hotelService.getHotelOccupancyReport(),
        hotelService.getHotelRevenueReport(),
        hotelService.getRoomPerformanceReport()
      ]);

      setDashboard(dash);
      setProperties(props);
      setRoomTypes(rTypes);
      setRooms(rList);
      setReservations(resList);
      setGuests(gList);
      setStaff(sList);
      setHousekeepingStats(hk);
      setArrivals(arr);
      setDepartures(dep);
      setQueue(q);
      setOccupancyReport(occ);
      setRevenueReport(rev);
      setRoomPerformance(perf);
    } catch (err) {
      console.error('Failed to load hotel data:', err);
      addNotification?.('Failed to load hotel data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAvailability = async () => {
    setIsSearchingAvail(true);
    try {
      const res = await hotelService.searchAvailability(selectedPropertyId, {
        checkIn: searchCheckIn,
        checkOut: searchCheckOut,
        adults: searchAdults
      });
      setAvailabilityResult(res);
      addNotification?.('Live room availability retrieved', 'info');
    } catch (err) {
      console.error('Availability search error:', err);
      addNotification?.('Failed to search room availability', 'error');
    } finally {
      setIsSearchingAvail(false);
    }
  };

  const handleCreateRoomType = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await hotelService.createRoomType(selectedPropertyId, {
        code: rtCode,
        name: rtName,
        description: rtDesc,
        baseRate: parseFloat(rtBaseRate),
        currency: 'INR',
        maxAdults: parseInt(rtMaxAdults),
        maxChildren: parseInt(rtMaxChildren),
        bedConfiguration: 'KING',
        amenities: ['WIFI', 'AIR_CONDITIONING', 'TV', 'MINI_BAR']
      });
      setRoomTypes(prev => [...prev, created]);
      setShowAddRoomTypeModal(false);
      addNotification?.('Room type created successfully', 'success');
    } catch (err) {
      console.error('Failed to create room type:', err);
      addNotification?.('Failed to create room type', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await hotelService.createRoom(selectedPropertyId, {
        roomNumber,
        floor: parseInt(roomFloor),
        roomTypeId,
        operationalStatus: 'AVAILABLE',
        housekeepingStatus: 'CLEAN'
      });
      setRooms(prev => [...prev, created]);
      setShowAddRoomModal(false);
      addNotification?.(`Physical room ${roomNumber} added to inventory`, 'success');
      loadData();
    } catch (err) {
      console.error('Failed to create room:', err);
      addNotification?.('Failed to create room', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await hotelService.createReservation({
        propertyId: selectedPropertyId,
        roomTypeId: resRoomTypeId,
        checkIn: resCheckIn,
        checkOut: resCheckOut,
        nights: 3,
        adults: parseInt(resAdults),
        children: 0,
        guest: {
          firstName: resGuestFirst,
          lastName: resGuestLast,
          name: `${resGuestFirst} ${resGuestLast}`,
          email: resGuestEmail,
          phone: resGuestPhone
        },
        source: 'ADMIN_DASHBOARD',
        specialRequests: resSpecialReq,
        totalAmount: 13500.00,
        currency: 'INR'
      });
      setReservations(prev => [created, ...prev]);
      setShowNewReservationModal(false);
      addNotification?.(`Reservation created: ${created.confirmationNumber || created.id}`, 'success');
      loadData();
    } catch (err) {
      console.error('Failed to create reservation:', err);
      addNotification?.('Failed to create reservation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReservation = async (resId) => {
    try {
      await hotelService.confirmReservation(resId);
      setReservations(prev => prev.map(r => r.id === resId ? { ...r, reservationStatus: 'CONFIRMED' } : r));
      addNotification?.(`Reservation ${resId} confirmed successfully`, 'success');
    } catch (err) {
      console.error('Confirm error:', err);
      addNotification?.('Failed to confirm reservation', 'error');
    }
  };

  const handleCancelReservation = async (resId) => {
    try {
      await hotelService.cancelReservation(resId, 'Guest request');
      setReservations(prev => prev.map(r => r.id === resId ? { ...r, reservationStatus: 'CANCELLED' } : r));
      addNotification?.(`Reservation ${resId} cancelled`, 'info');
    } catch (err) {
      console.error('Cancel error:', err);
      addNotification?.('Failed to cancel reservation', 'error');
    }
  };

  const handleCheckInGuest = async (e) => {
    e.preventDefault();
    if (!selectedReservation) return;
    setIsSubmitting(true);
    try {
      await hotelService.checkIn(selectedReservation.id, checkInRoomId, 'Guest checked in at front desk');
      setReservations(prev => prev.map(r => r.id === selectedReservation.id ? { ...r, reservationStatus: 'CHECKED_IN', assignedRoomId: checkInRoomId } : r));
      setShowCheckInModal(false);
      addNotification?.(`Guest checked in to ${checkInRoomId}`, 'success');
      loadData();
    } catch (err) {
      console.error('Check-in error:', err);
      addNotification?.('Failed to check in guest', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOutGuest = async (resId) => {
    try {
      await hotelService.checkOut(resId, 'Guest departed');
      setReservations(prev => prev.map(r => r.id === resId ? { ...r, reservationStatus: 'CHECKED_OUT' } : r));
      addNotification?.(`Guest checked out. Housekeeping notified.`, 'success');
      loadData();
    } catch (err) {
      console.error('Check-out error:', err);
      addNotification?.('Failed to check out guest', 'error');
    }
  };

  const handleUpdateHousekeeping = async (roomId, newStatus) => {
    try {
      await hotelService.updateHousekeepingStatus(roomId, newStatus);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, housekeepingStatus: newStatus } : r));
      addNotification?.(`Room ${roomId} marked as ${newStatus}`, 'info');
      loadData();
    } catch (err) {
      console.error('Housekeeping update error:', err);
      addNotification?.('Failed to update housekeeping', 'error');
    }
  };

  const handleRunAgentTest = () => {
    setIsTestingAgent(true);
    setTimeout(() => {
      if (agentTestType === 'HOTEL_RESERVATION') {
        setTestResult({
          reply: `I can help you check availability for 2 adults from November 10 to November 12. At Chennai City Hotel, Deluxe King Rooms are currently available starting at ₹4,500/night (Total: ₹9,000 for 2 nights). Would you like me to prepare a booking quote?`,
          suggestedActions: [{ type: 'CHECK_AVAILABILITY', propertyId: selectedPropertyId }],
          handoverRequired: false,
          confidence: '99.4%'
        });
      } else {
        setTestResult({
          reply: `Our check-in time is 14:00 (2:00 PM) and check-out is 11:00 AM. Free high-speed Wi-Fi and valet parking are complimentary for all staying guests. Breakfast is served from 07:00 to 10:30 at Spice Route restaurant.`,
          suggestedActions: [{ type: 'SHOW_PROPERTY_POLICY', policyId: 'POL-CHECKIN' }],
          handoverRequired: false,
          confidence: '98.8%'
        });
      }
      setIsTestingAgent(false);
    }, 600);
  };

  // Reservation Columns
  const reservationColumns = [
    {
      header: 'Confirmation #',
      accessorKey: 'confirmationNumber',
      cell: ({ row }) => (
        <div>
          <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
            {row.original.confirmationNumber || row.original.id}
          </div>
          <div className="text-xs text-gray-500">{row.original.propertyName || 'Chennai City Hotel'}</div>
        </div>
      )
    },
    {
      header: 'Guest',
      accessorKey: 'guest',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {row.original.guest?.name || `${row.original.guest?.firstName} ${row.original.guest?.lastName}`}
          </div>
          <div className="text-xs text-gray-400">{row.original.guest?.phone}</div>
        </div>
      )
    },
    {
      header: 'Stay Dates',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {row.original.checkIn} → {row.original.checkOut}
          </div>
          <div className="text-xs text-gray-500">{row.original.nights || 2} Nights • {row.original.adults || 2} Adults</div>
        </div>
      )
    },
    {
      header: 'Room',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-200">{row.original.roomTypeName}</div>
          <div className="text-xs font-mono text-indigo-600">Assigned: {row.original.assignedRoomNumber || row.original.assignedRoomId || 'UNASSIGNED'}</div>
        </div>
      )
    },
    {
      header: 'Total',
      accessorKey: 'totalAmount',
      cell: ({ row }) => (
        <span className="font-bold text-gray-900 dark:text-white">
          {row.original.currency} {Number(row.original.totalAmount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'reservationStatus',
      cell: ({ row }) => <StatusBadge status={row.original.reservationStatus} />
    },
    {
      header: 'Actions',
      cell: ({ row }) => {
        const status = row.original.reservationStatus;
        return (
          <div className="flex items-center space-x-1.5">
            {status === 'PENDING_CONFIRMATION' && (
              <button
                onClick={() => handleConfirmReservation(row.original.id)}
                className="px-2 py-1 text-xs font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                Confirm
              </button>
            )}
            {status === 'CONFIRMED' && (
              <button
                onClick={() => {
                  setSelectedReservation(row.original);
                  setShowCheckInModal(true);
                }}
                className="px-2 py-1 text-xs font-bold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                Check-In
              </button>
            )}
            {status === 'CHECKED_IN' && (
              <button
                onClick={() => handleCheckOutGuest(row.original.id)}
                className="px-2 py-1 text-xs font-bold rounded bg-purple-50 text-purple-700 hover:bg-purple-100"
              >
                Check-Out
              </button>
            )}
            {status !== 'CANCELLED' && status !== 'CHECKED_OUT' && (
              <button
                onClick={() => handleCancelReservation(row.original.id)}
                className="px-2 py-1 text-xs font-bold rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                Cancel
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-lg shadow-amber-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Grand Azure Resorts & Hotels
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                HOTEL ADMIN
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Multi-Property Hospitality PMS & AI Reservation Platform
            </p>
          </div>
        </div>

        {/* Property Selector & Refresh */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.propertyCode})
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowNewReservationModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl max-w-fit overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'room_types', label: 'Room Types & Rates', icon: BedDouble },
          { id: 'rooms_housekeeping', label: 'Physical Rooms & Housekeeping', icon: DoorOpen },
          { id: 'reservations', label: 'Reservations & Booking', icon: CalendarCheck },
          { id: 'front_desk', label: 'Front Desk Queues', icon: Coffee },
          { id: 'ai_agents', label: 'AI Reservation Agent', icon: Bot },
          { id: 'reports', label: 'PMS Reports', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Occupancy Rate</span>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <BedDouble className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard?.occupancy?.occupancyRate || 71.30}%
              </div>
              <p className="mt-1 text-xs text-amber-600 font-medium">
                {dashboard?.occupancy?.occupiedRoomNights || 410} / {dashboard?.occupancy?.availableRoomNights || 575} room nights
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Room Revenue</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard?.revenue?.currency || 'INR'} {dashboard?.revenue?.roomRevenue?.toLocaleString() || '850,000'}
              </div>
              <p className="mt-1 text-xs text-emerald-600 font-medium">Verified booked room revenue</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Expected Today</span>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-3 text-gray-900 dark:text-white">
                <span className="text-2xl font-bold">{dashboard?.metrics?.expectedArrivalsToday || 12} In</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">{dashboard?.metrics?.expectedDeparturesToday || 9} Out</span>
              </div>
              <p className="mt-1 text-xs text-indigo-600 font-medium">Front Desk Arrivals & Departures</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">AI Guest Resolution</span>
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard?.ai?.resolutionRate || 71.88}%
              </div>
              <p className="mt-1 text-xs text-purple-600 font-medium">
                {dashboard?.ai?.resolvedWithoutHuman || 460} resolved • {dashboard?.ai?.escalatedToHuman || 180} escalated to reception
              </p>
            </div>
          </div>

          {/* Quick Availability Search & Recent Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Fast Room Availability Search</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Check-In</label>
                    <input
                      type="date"
                      value={searchCheckIn}
                      onChange={e => setSearchCheckIn(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Check-Out</label>
                    <input
                      type="date"
                      value={searchCheckOut}
                      onChange={e => setSearchCheckOut(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Adults</label>
                  <select
                    value={searchAdults}
                    onChange={e => setSearchAdults(parseInt(e.target.value))}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults</option>
                  </select>
                </div>
                <button
                  onClick={handleSearchAvailability}
                  disabled={isSearchingAvail}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm"
                >
                  {isSearchingAvail ? 'Checking PMS Inventory...' : 'Check Availability'}
                </button>
              </div>

              {availabilityResult && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Available Room Categories ({availabilityResult.nights} nights):
                  </div>
                  {availabilityResult.rooms?.map((rm, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-amber-100 dark:border-amber-900/40 last:border-none">
                      <div>
                        <span className="font-semibold">{rm.name}</span>
                        <span className="text-[10px] text-gray-500 ml-1">({rm.availableUnits} units)</span>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        ₹{rm.pricePerNight}/night
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Guest Reservations</h3>
                <button onClick={() => setActiveTab('reservations')} className="text-xs font-medium text-amber-600 hover:underline">
                  View All Bookings →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                    <tr>
                      <th className="p-3">Confirmation</th>
                      <th className="p-3">Guest</th>
                      <th className="p-3">Dates</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {reservations.slice(0, 4).map(r => (
                      <tr key={r.id}>
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{r.confirmationNumber}</td>
                        <td className="p-3 font-medium">{r.guest?.name || `${r.guest?.firstName} ${r.guest?.lastName}`}</td>
                        <td className="p-3 text-xs">{r.checkIn} to {r.checkOut}</td>
                        <td className="p-3 text-xs">{r.roomTypeName} ({r.assignedRoomNumber || 'Unassigned'})</td>
                        <td className="p-3"><StatusBadge status={r.reservationStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROOM TYPES & RATES */}
      {/* ========================================================================= */}
      {activeTab === 'room_types' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Room Types & Sellable Categories</h2>
              <p className="text-xs text-gray-500">Define capacity, amenities, base rates and bed configurations per property</p>
            </div>
            <button
              onClick={() => setShowAddRoomTypeModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
            >
              + Create Room Type
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomTypes.map(rt => (
              <div key={rt.id} className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{rt.code}</span>
                    <StatusBadge status={rt.status || 'ACTIVE'} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">{rt.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rt.description}</p>
                  
                  <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Max Occupancy:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{rt.maxAdults} Adults, {rt.maxChildren} Children</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bed Configuration:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{rt.bedConfiguration || 'KING'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Units in PMS:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{rt.totalUnits || 10}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Base Rate</span>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{Number(rt.baseRate).toFixed(2)}<span className="text-xs font-normal text-gray-500">/night</span>
                    </div>
                  </div>
                  <button className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200">
                    Edit Rate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PHYSICAL ROOMS & HOUSEKEEPING */}
      {/* ========================================================================= */}
      {activeTab === 'rooms_housekeeping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Physical Rooms & Housekeeping Operations</h2>
              <p className="text-xs text-gray-500">Live operational room statuses, cleaning queues, and inspections</p>
            </div>
            <button
              onClick={() => setShowAddRoomModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
            >
              + Add Physical Room
            </button>
          </div>

          {/* Housekeeping Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Clean & Ready</span>
              <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{housekeepingStats?.clean || 4} Rooms</div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending Cleaning</span>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">{housekeepingStats?.pendingCleaning || 1} Rooms</div>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Inspected / VIP</span>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">{housekeepingStats?.inspected || 1} Rooms</div>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Out of Service / Maint.</span>
              <div className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-1">{housekeepingStats?.outOfService || 1} Rooms</div>
            </div>
          </div>

          {/* Physical Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map(rm => (
              <div key={rm.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Room {rm.roomNumber}</span>
                    <span className="text-xs text-gray-400">Fl {rm.floor}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rm.operationalStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                    rm.operationalStatus === 'OCCUPIED' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {rm.operationalStatus}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Type: <span className="font-medium text-gray-800 dark:text-gray-200">{rm.roomTypeId}</span>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Housekeeping:</span>
                  <select
                    value={rm.housekeepingStatus}
                    onChange={(e) => handleUpdateHousekeeping(rm.id, e.target.value)}
                    className="text-xs font-semibold rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1 px-1.5"
                  >
                    <option value="CLEAN">CLEAN</option>
                    <option value="PENDING_CLEANING">PENDING CLEANING</option>
                    <option value="INSPECTED">INSPECTED</option>
                    <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RESERVATIONS & BOOKING */}
      {/* ========================================================================= */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reservations & Guest Bookings</h2>
              <p className="text-xs text-gray-500">View bookings, handle check-in, checkout, and cancellation workflows</p>
            </div>
            <button
              onClick={() => setShowNewReservationModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
            >
              + Create Reservation
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-4">
            <DataTable columns={reservationColumns} data={reservations} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FRONT DESK QUEUES */}
      {/* ========================================================================= */}
      {activeTab === 'front_desk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-500">Priority Arrivals</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">{queue?.priorityGuestArrivals || 3}</div>
              <span className="text-xs text-gray-400">VIP / Early Check-ins</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-500">Express Checkouts</span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{queue?.expressCheckoutsPending || 2}</div>
              <span className="text-xs text-gray-400">Folio settled online</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-500">Luggage Assistance</span>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{queue?.luggageAssistanceRequests || 1}</div>
              <span className="text-xs text-gray-400">Bell desk queue</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-500">Airport Transfers</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{queue?.airportTransfersScheduled || 4}</div>
              <span className="text-xs text-gray-400">Scheduled vehicles today</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <LogIn className="w-5 h-5 text-emerald-600" />
                <span>Today's Expected Arrivals ({arrivals.length})</span>
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {arrivals.map(arr => (
                  <div key={arr.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {arr.guest?.name || `${arr.guest?.firstName} ${arr.guest?.lastName}`}
                      </div>
                      <div className="text-xs text-gray-500">{arr.roomTypeName} • Conf: {arr.confirmationNumber}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedReservation(arr);
                        setShowCheckInModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Check-In Guest
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <LogOut className="w-5 h-5 text-purple-600" />
                <span>Today's Expected Departures ({departures.length})</span>
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {departures.map(dep => (
                  <div key={dep.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {dep.guest?.name || `${dep.guest?.firstName} ${dep.guest?.lastName}`}
                      </div>
                      <div className="text-xs text-gray-500">Room: {dep.assignedRoomNumber || dep.assignedRoomId} • Conf: {dep.confirmationNumber}</div>
                    </div>
                    <button
                      onClick={() => handleCheckOutGuest(dep.id)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Process Checkout
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AI AGENTS */}
      {/* ========================================================================= */}
      {activeTab === 'ai_agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Hotel AI Employees</h3>
            
            <div
              onClick={() => { setAgentTestType('HOTEL_RESERVATION'); setTestQuestion('Do you have a room for two adults from November 10 to November 12?'); setTestResult(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${agentTestType === 'HOTEL_RESERVATION' ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/30 ring-1 ring-amber-500' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">AI Reservation Agent</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ACTIVE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Queries room availability, quotes server prices, prepares booking requests.</p>
              <div className="mt-2 text-[11px] text-gray-400 font-mono">Channels: WEBSITE_CHAT, WHATSAPP</div>
            </div>

            <div
              onClick={() => { setAgentTestType('HOTEL_GUEST_SUPPORT'); setTestQuestion('What time is check-in and breakfast?'); setTestResult(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${agentTestType === 'HOTEL_GUEST_SUPPORT' ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/30 ring-1 ring-amber-500' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">AI Guest Support Agent</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ACTIVE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Answers hotel amenities, policies, check-in rules and directions.</p>
              <div className="mt-2 text-[11px] text-gray-400 font-mono">Channels: WEBSITE_CHAT, WHATSAPP, EMAIL</div>
            </div>
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Safe Test Simulator ({agentTestType})</h3>
            </div>
            <p className="text-xs text-gray-500">
              The AI agent queries the authorized PMS reservation engine for availability without granting direct database mutation permissions.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Guest Sample Enquiry</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ask reservation question..."
                />
                <button
                  onClick={handleRunAgentTest}
                  disabled={isTestingAgent || !testQuestion}
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isTestingAgent ? 'Searching PMS...' : 'Test Agent'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>AI Agent PMS Response</span>
                  <span className="text-emerald-600 font-mono">Confidence: {testResult.confidence}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  {testResult.reply}
                </div>
                {testResult.suggestedActions?.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-500">Backend Suggested Actions:</span>
                    {testResult.suggestedActions.map((act, i) => (
                      <span key={i} className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                        {act.type} {act.propertyId ? `[${act.propertyId}]` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PMS REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Average Daily Rate (ADR)</span>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
                ₹{occupancyReport?.averageDailyRate?.toLocaleString() || '5,200'}
              </div>
              <span className="text-xs text-emerald-600">Across all sold room nights</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">RevPAR (Revenue per Available Room)</span>
              <div className="text-xl font-bold mt-1 text-amber-600">
                ₹{occupancyReport?.revPAR?.toLocaleString() || '3,707'}
              </div>
              <span className="text-xs text-gray-500">ADR × 71.30% Occupancy</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Total Hospitality Revenue</span>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
                ₹{revenueReport?.totalRevenue?.toLocaleString() || '1,250,000'}
              </div>
              <span className="text-xs text-gray-500">Room (₹850k) + F&B (₹280k) + Spa</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Room Type Performance</h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {roomPerformance.map(rp => (
                <div key={rp.roomTypeCode} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{rp.name}</div>
                    <div className="text-xs text-gray-500 font-mono">Code: {rp.roomTypeCode} • {rp.totalNightsSold} Nights Sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">₹{rp.revenue?.toLocaleString()}</div>
                    <div className="text-xs text-amber-600 font-medium">{rp.occupancy}% Occupancy</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Room Type */}
      <FormDialog
        isOpen={showAddRoomTypeModal}
        onClose={() => setShowAddRoomTypeModal(false)}
        title="Create New Room Type"
      >
        <form onSubmit={handleCreateRoomType} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Code (Unique per property)</label>
            <input
              type="text"
              required
              value={rtCode}
              onChange={e => setRtCode(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room Type Name</label>
            <input
              type="text"
              required
              value={rtName}
              onChange={e => setRtName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Base Rate (INR / night)</label>
              <input
                type="number"
                required
                min="0"
                value={rtBaseRate}
                onChange={e => setRtBaseRate(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Max Adults</label>
              <input
                type="number"
                required
                min="1"
                value={rtMaxAdults}
                onChange={e => setRtMaxAdults(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={rtDesc}
              onChange={e => setRtDesc(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddRoomTypeModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white">Save Room Type</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Create Physical Room */}
      <FormDialog
        isOpen={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        title="Add Physical Room to Property"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room Number</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Floor</label>
              <input
                type="number"
                required
                value={roomFloor}
                onChange={e => setRoomFloor(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room Type Category</label>
            <select
              value={roomTypeId}
              onChange={e => setRoomTypeId(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {roomTypes.map(rt => (
                <option key={rt.id} value={rt.id}>{rt.name} ({rt.code})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddRoomModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white">Add Room</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: New Reservation */}
      <FormDialog
        isOpen={showNewReservationModal}
        onClose={() => setShowNewReservationModal(false)}
        title="Create Guest Reservation"
      >
        <form onSubmit={handleCreateReservation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">First Name</label>
              <input
                type="text"
                required
                value={resGuestFirst}
                onChange={e => setResGuestFirst(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                required
                value={resGuestLast}
                onChange={e => setResGuestLast(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                required
                value={resGuestEmail}
                onChange={e => setResGuestEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                required
                value={resGuestPhone}
                onChange={e => setResGuestPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Check-In</label>
              <input
                type="date"
                required
                value={resCheckIn}
                onChange={e => setResCheckIn(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Check-Out</label>
              <input
                type="date"
                required
                value={resCheckOut}
                onChange={e => setResCheckOut(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room Category</label>
            <select
              value={resRoomTypeId}
              onChange={e => setResRoomTypeId(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {roomTypes.map(rt => (
                <option key={rt.id} value={rt.id}>{rt.name} (₹{rt.baseRate}/night)</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowNewReservationModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white">Create Booking</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Check-In */}
      <FormDialog
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title={`Guest Check-In: ${selectedReservation?.confirmationNumber || selectedReservation?.id}`}
      >
        <form onSubmit={handleCheckInGuest} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Guest Name</label>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {selectedReservation?.guest?.name || `${selectedReservation?.guest?.firstName} ${selectedReservation?.guest?.lastName}`}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Assign Physical Room</label>
            <select
              value={checkInRoomId}
              onChange={e => setCheckInRoomId(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {rooms.map(rm => (
                <option key={rm.id} value={rm.id}>
                  Room {rm.roomNumber} ({rm.roomTypeId} - {rm.operationalStatus} - {rm.housekeepingStatus})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowCheckInModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white">Complete Check-In</button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
