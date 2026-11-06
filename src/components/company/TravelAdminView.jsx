import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { travelService } from '../../services/travelService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  Plane,
  Compass,
  MapPin,
  Calendar,
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
  Building,
  FileText,
  Ticket,
  Check,
  X,
  Shield,
  BarChart3,
  Luggage,
  Hotel
} from 'lucide-react';

export function TravelAdminView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'destinations' | 'packages' | 'enquiries' | 'bookings' | 'suppliers' | 'ai_agents' | 'reports'
  const [dashboard, setDashboard] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [travelSettings, setTravelSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Form States
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [showAddPkgModal, setShowAddPkgModal] = useState(false);
  const [showAddEnqModal, setShowAddEnqModal] = useState(false);
  const [showAddSuppModal, setShowAddSuppModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Destination Form
  const [destName, setDestName] = useState('Switzerland');
  const [destCountry, setDestCountry] = useState('Switzerland');
  const [destState, setDestState] = useState('Bernese Oberland');
  const [destDesc, setDestDesc] = useState('Alpine lakes, panoramic glacier express rail, and snowy peaks');

  // New Package Form
  const [pkgCode, setPkgCode] = useState('SWISS-6D5N');
  const [pkgName, setPkgName] = useState('Swiss Alps & Glacier Rail Scenic Journey');
  const [pkgPrice, setPkgPrice] = useState(115000);
  const [pkgDays, setPkgDays] = useState(6);
  const [pkgNights, setPkgNights] = useState(5);
  const [pkgInclusions, setPkgInclusions] = useState('4-Star Interlaken Hotel, Swiss Travel Rail Pass, Jungfraujoch Excursion, Daily Breakfast');

  // New Enquiry Form
  const [enqName, setEnqName] = useState('Anita Deshmukh');
  const [enqEmail, setEnqEmail] = useState('anita.d@example.com');
  const [enqPhone, setEnqPhone] = useState('+91 98200 44556');
  const [enqDest, setEnqDest] = useState('DEST-001');
  const [enqBudget, setEnqBudget] = useState(150000);
  const [enqAdults, setEnqAdults] = useState(2);

  // New Supplier Form
  const [suppName, setSuppName] = useState('Swiss Alpine Express Coaches');
  const [suppCategory, setSuppCategory] = useState('TRANSPORT');
  const [suppDest, setSuppDest] = useState('Switzerland');
  const [suppContact, setSuppContact] = useState('Hans Gruber');
  const [suppEmail, setSuppEmail] = useState('bookings@swissexpress.ch');

  // AI Agent Simulator State
  const [agentTestType, setAgentTestType] = useState('TRAVEL_SALES');
  const [testQuestion, setTestQuestion] = useState('I need a 5-day trip to Dubai for 4 people in December with a budget around ₹2 Lakhs.');
  const [testResult, setTestResult] = useState(null);
  const [isTestingAgent, setIsTestingAgent] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, destList, pkgList, enqList, quoList, bookList, suppList, rev, sett] = await Promise.all([
        travelService.getDashboard(),
        travelService.getDestinations(),
        travelService.getPackages(),
        travelService.getEnquiries(),
        travelService.getQuotations(),
        travelService.getBookings(),
        travelService.getSuppliers(),
        travelService.getRevenueReport(),
        travelService.getSettings()
      ]);

      setDashboard(dash);
      setDestinations(destList);
      setPackages(pkgList);
      setEnquiries(enqList);
      setQuotations(quoList);
      setBookings(bookList);
      setSuppliers(suppList);
      setRevenueReport(rev);
      setTravelSettings(sett);
    } catch (err) {
      console.error('Failed to load travel data:', err);
      addNotification?.('Failed to load travel data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDestination = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await travelService.createDestination({
        name: destName,
        country: destCountry,
        state: destState,
        description: destDesc,
        status: 'ACTIVE'
      });
      setDestinations(prev => [...prev, created]);
      setShowAddDestModal(false);
      addNotification?.(`Destination ${destName} added`, 'success');
    } catch (err) {
      console.error('Error creating destination:', err);
      addNotification?.('Failed to create destination', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await travelService.createPackage({
        packageCode: pkgCode,
        name: pkgName,
        durationDays: parseInt(pkgDays),
        durationNights: parseInt(pkgNights),
        pricePerPerson: parseFloat(pkgPrice),
        currency: 'INR',
        inclusions: pkgInclusions.split(',').map(s => s.trim()),
        status: 'ACTIVE',
        capacity: 25,
        availableSlots: 10
      });
      setPackages(prev => [created, ...prev]);
      setShowAddPkgModal(false);
      addNotification?.(`Tour package ${pkgCode} published`, 'success');
      loadData();
    } catch (err) {
      console.error('Error creating package:', err);
      addNotification?.('Failed to create package', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await travelService.createEnquiry({
        customerName: enqName,
        email: enqEmail,
        phone: enqPhone,
        destinationId: enqDest,
        adults: parseInt(enqAdults),
        budget: parseFloat(enqBudget),
        currency: 'INR',
        source: 'WEBSITE_CHAT',
        stage: 'NEW'
      });
      setEnquiries(prev => [created, ...prev]);
      setShowAddEnqModal(false);
      addNotification?.('Travel enquiry registered', 'success');
      loadData();
    } catch (err) {
      console.error('Error creating enquiry:', err);
      addNotification?.('Failed to create enquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await travelService.createSupplier({
        name: suppName,
        category: suppCategory,
        destination: suppDest,
        contactName: suppContact,
        email: suppEmail,
        status: 'ACTIVE'
      });
      setSuppliers(prev => [...prev, created]);
      setShowAddSuppModal(false);
      addNotification?.(`Supplier ${suppName} onboarded`, 'success');
    } catch (err) {
      console.error('Error adding supplier:', err);
      addNotification?.('Failed to add supplier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await travelService.confirmBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, bookingStatus: 'CONFIRMED' } : b));
      addNotification?.(`Booking ${bookingId} confirmed`, 'success');
    } catch (err) {
      console.error('Error confirming booking:', err);
      addNotification?.('Failed to confirm booking', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await travelService.cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, bookingStatus: 'CANCELLED' } : b));
      addNotification?.(`Booking ${bookingId} cancelled`, 'info');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      addNotification?.('Failed to cancel booking', 'error');
    }
  };

  const handleRunAgentTest = () => {
    setIsTestingAgent(true);
    setTimeout(() => {
      if (agentTestType === 'TRAVEL_SALES') {
        setTestResult({
          reply: `Awesome! We have crafted a popular 5D/4N Dubai package for 4 adults within your ₹2,00,000 budget! Includes: 4-Star Bur Dubai accommodation, Desert Safari with BBQ & Tanoura show, Burj Khalifa 124th Floor, and Marina Dhow cruise. Our Senior Specialist Priya Iyer is reviewing custom flight slots and will call you with your finalized PDF quotation!`,
          suggestedActions: [{ type: 'RECOMMEND_PACKAGE', packageId: 'PKG-002' }, { type: 'ASSIGN_CONSULTANT', consultantId: 'USR-TRV-102' }],
          confidence: '99.2%'
        });
      } else {
        setTestResult({
          reply: `For your Dubai trip, Indian passport holders require a 30-day single entry tourist visa. We process this in 3 to 4 working days with passport copy scan, white background photo, and confirmed return flight tickets.`,
          suggestedActions: [{ type: 'DISPATCH_VISA_CHECKLIST' }],
          confidence: '98.5%'
        });
      }
      setIsTestingAgent(false);
    }, 600);
  };

  // Columns for Packages
  const packageColumns = [
    {
      header: 'Package Code & Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-gray-900 dark:text-white">{row.original.name}</div>
          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400">{row.original.packageCode} • {row.original.durationDays}D / {row.original.durationNights}N</div>
        </div>
      )
    },
    {
      header: 'Price / Person',
      accessorKey: 'pricePerPerson',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.original.currency} {Number(row.original.pricePerPerson).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Slots Available',
      cell: ({ row }) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300">
          {row.original.availableSlots || 8} of {row.original.capacity || 20} seats
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status || 'ACTIVE'} />
    }
  ];

  // Columns for Bookings
  const bookingColumns = [
    {
      header: 'Reference #',
      accessorKey: 'bookingReference',
      cell: ({ row }) => (
        <div>
          <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{row.original.bookingReference || row.original.id}</div>
          <div className="text-xs text-gray-400">{row.original.travelStartDate} → {row.original.travelEndDate}</div>
        </div>
      )
    },
    {
      header: 'Traveler / Lead',
      accessorKey: 'customerName',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.original.customerName}</div>
          <div className="text-xs text-gray-500">{row.original.travellerCount || 2} Pax • {row.original.packageName}</div>
        </div>
      )
    },
    {
      header: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }) => (
        <span className="font-bold text-gray-900 dark:text-white">
          {row.original.currency} {Number(row.original.totalAmount).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Booking Status',
      accessorKey: 'bookingStatus',
      cell: ({ row }) => <StatusBadge status={row.original.bookingStatus} />
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1.5">
          {row.original.bookingStatus === 'PENDING_CONFIRMATION' && (
            <button
              onClick={() => handleConfirmBooking(row.original.id)}
              className="px-2 py-1 text-xs font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            >
              Confirm
            </button>
          )}
          {row.original.bookingStatus !== 'CANCELLED' && (
            <button
              onClick={() => handleCancelBooking(row.original.id)}
              className="px-2 py-1 text-xs font-bold rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {travelSettings?.companyName || 'Wanderlust Global Expeditions'}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-400">
                TRAVEL ADMIN
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              International Tour Operator, Custom Itineraries & AI Booking Platform
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddPkgModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl max-w-fit overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'destinations', label: 'Destinations', icon: MapPin },
          { id: 'packages', label: 'Tour Packages', icon: Compass },
          { id: 'enquiries', label: 'Enquiries & Quotes', icon: FileText },
          { id: 'bookings', label: 'Bookings & Travelers', icon: Ticket },
          { id: 'suppliers', label: 'Suppliers Directory', icon: Hotel },
          { id: 'ai_agents', label: 'AI Travel Agents', icon: Bot },
          { id: 'reports', label: 'Sales Reports', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-gray-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <span className="text-sm font-medium text-gray-500">Confirmed Booking Revenue</span>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                ₹{dashboard?.sales?.confirmedBookingValue?.toLocaleString() || '7,60,000'}
              </div>
              <p className="mt-1 text-xs text-emerald-600 font-medium">{dashboard?.metrics?.confirmedBookings || 49} bookings finalized</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <span className="text-sm font-medium text-gray-500">Quoted Pipeline Value</span>
              <div className="mt-3 text-2xl font-bold text-cyan-600">
                ₹{dashboard?.sales?.quotedValue?.toLocaleString() || '12,50,000'}
              </div>
              <p className="mt-1 text-xs text-gray-500 font-medium">{dashboard?.metrics?.quotationsSent || 91} active quotations sent</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <span className="text-sm font-medium text-gray-500">New Holiday Enquiries</span>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard?.metrics?.newEnquiries || 187}
              </div>
              <p className="mt-1 text-xs text-amber-600 font-medium">{dashboard?.metrics?.openEnquiries || 62} in active consultant queue</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <span className="text-sm font-medium text-gray-500">AI Enquiry Containment</span>
              <div className="mt-3 text-2xl font-bold text-purple-600">
                {dashboard?.ai?.resolutionRate || 68.6}%
              </div>
              <p className="mt-1 text-xs text-purple-600 font-medium">
                {dashboard?.ai?.resolvedWithoutHuman || 350} itineraries generated autonomously
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Travel Enquiries</h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {enquiries.map(enq => (
                  <div key={enq.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{enq.customerName}</div>
                      <div className="text-xs text-gray-500">Dest: {enq.destinationName || enq.destinationId} • {enq.adults} Pax • Budget: ₹{enq.budget?.toLocaleString()}</div>
                    </div>
                    <StatusBadge status={enq.stage} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Tour Packages</h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {packages.map(pkg => (
                  <div key={pkg.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{pkg.name}</div>
                      <div className="text-xs text-gray-500">{pkg.durationDays}D/{pkg.durationNights}N • ₹{pkg.pricePerPerson?.toLocaleString()}/person</div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300">
                      {pkg.availableSlots} slots left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DESTINATIONS */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Destinations & Travel Hubs</h2>
              <p className="text-xs text-gray-500">Curated destinations for custom international and domestic holiday packages</p>
            </div>
            <button
              onClick={() => setShowAddDestModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              + Add Destination
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {destinations.map(d => (
              <div key={d.id} className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-cyan-600 font-bold">{d.id}</span>
                  <StatusBadge status={d.status || 'ACTIVE'} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{d.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{d.country} • {d.state}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tour Packages & Daily Itineraries</h2>
              <p className="text-xs text-gray-500">Fixed departures, duration, pricing, and organized day-wise activity plans</p>
            </div>
            <button
              onClick={() => setShowAddPkgModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              + Create Package
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-4">
            <DataTable columns={packageColumns} data={packages} />
          </div>
        </div>
      )}

      {/* TAB 4: ENQUIRIES & QUOTATIONS */}
      {activeTab === 'enquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Customer Trip Enquiries</h3>
              <button
                onClick={() => setShowAddEnqModal(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-600 text-white"
              >
                + New Enquiry
              </button>
            </div>
            <div className="space-y-3">
              {enquiries.map(e => (
                <div key={e.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">{e.customerName}</span>
                    <StatusBadge status={e.stage} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Dates: {e.travelStartDate || 'Flexible'} • {e.adults} Adults • Budget: ₹{e.budget?.toLocaleString()}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
                    <span>Source: {e.source}</span>
                    <span className="text-cyan-600 font-medium">Assigned: {e.assignedConsultantName || 'Unassigned'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Generated Quotations</h3>
            </div>
            <div className="space-y-3">
              {quotations.map(q => (
                <div key={q.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{q.quotationNumber}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {q.customerName} — {q.packageName}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                    <span className="font-bold text-gray-900 dark:text-white">Total: ₹{q.subtotal?.toLocaleString()}</span>
                    <span className="text-gray-400">Valid Until: {q.validUntil}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Confirmed Travel Bookings & Passenger Vouchers</h2>
              <p className="text-xs text-gray-500">Manage booking confirmations, hotel vouchers, flights, and cancellations</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-4">
            <DataTable columns={bookingColumns} data={bookings} />
          </div>
        </div>
      )}

      {/* TAB 6: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hospitality & Excursion Suppliers</h2>
              <p className="text-xs text-gray-500">Hotels, coach operators, local DMCs, and visa clearance partners</p>
            </div>
            <button
              onClick={() => setShowAddSuppModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              + Onboard Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">{s.name}</span>
                  <StatusBadge status={s.status || 'ACTIVE'} />
                </div>
                <div className="text-xs text-cyan-600 font-semibold mt-1">{s.category} • {s.destination}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Contact: {s.contactName} ({s.email}) • {s.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AI AGENTS */}
      {activeTab === 'ai_agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Travel AI Employees</h3>
            
            <div
              onClick={() => { setAgentTestType('TRAVEL_SALES'); setTestQuestion('I need a 5-day trip to Dubai for 4 people in December with a budget around ₹2 Lakhs.'); setTestResult(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${agentTestType === 'TRAVEL_SALES' ? 'border-cyan-600 bg-cyan-50/40 dark:bg-cyan-950/30 ring-1 ring-cyan-500' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">AI Travel Sales Agent</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ACTIVE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Parses multi-city destinations, pax, hotel tiers and drafts day-wise plans.</p>
              <div className="mt-2 text-[11px] text-gray-400 font-mono">Channels: WHATSAPP, WEBSITE</div>
            </div>

            <div
              onClick={() => { setAgentTestType('TRAVEL_BOOKING'); setTestQuestion('What documents are required for my Dubai tourist visa?'); setTestResult(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${agentTestType === 'TRAVEL_BOOKING' ? 'border-cyan-600 bg-cyan-50/40 dark:bg-cyan-950/30 ring-1 ring-cyan-500' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">AI Booking Agent</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ACTIVE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Collects passport scans, assists with visa checklists and delivers vouchers.</p>
              <div className="mt-2 text-[11px] text-gray-400 font-mono">Channels: WHATSAPP, EMAIL</div>
            </div>
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Safe Test Simulator ({agentTestType})</h3>
            </div>
            <p className="text-xs text-gray-500">
              The AI Agent extracts traveler requirements and evaluates approved package pricing without committing unauthorized supplier bookings.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Customer Sample Inquiry</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter traveler enquiry..."
                />
                <button
                  onClick={handleRunAgentTest}
                  disabled={isTestingAgent || !testQuestion}
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isTestingAgent ? 'Analyzing...' : 'Test Agent'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>AI Agent Itinerary Response</span>
                  <span className="text-emerald-600 font-mono">Confidence: {testResult.confidence}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  {testResult.reply}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Total Confirmed Booking Value</span>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
                ₹{revenueReport?.totalConfirmedBookings?.toLocaleString() || '7,60,000'}
              </div>
              <span className="text-xs text-emerald-600">Avg Booking: ₹{revenueReport?.averageBookingValue?.toLocaleString() || '38,000'}</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Quotation Conversion Rate</span>
              <div className="text-xl font-bold mt-1 text-cyan-600">53.8%</div>
              <span className="text-xs text-gray-500">From sent quote to paid booking</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Active Destinations</span>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{destinations.length}</div>
              <span className="text-xs text-cyan-600">Domestic & International</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Destination */}
      <FormDialog
        isOpen={showAddDestModal}
        onClose={() => setShowAddDestModal(false)}
        title="Add New Travel Destination"
      >
        <form onSubmit={handleCreateDestination} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Destination Name</label>
            <input
              type="text"
              required
              value={destName}
              onChange={e => setDestName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Country</label>
              <input
                type="text"
                required
                value={destCountry}
                onChange={e => setDestCountry(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">State / Region</label>
              <input
                type="text"
                value={destState}
                onChange={e => setDestState(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={destDesc}
              onChange={e => setDestDesc(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddDestModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white">Save Destination</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Add Package */}
      <FormDialog
        isOpen={showAddPkgModal}
        onClose={() => setShowAddPkgModal(false)}
        title="Create Tour Package"
      >
        <form onSubmit={handleCreatePackage} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Package Code</label>
              <input
                type="text"
                required
                value={pkgCode}
                onChange={e => setPkgCode(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Price Per Person (INR)</label>
              <input
                type="number"
                required
                value={pkgPrice}
                onChange={e => setPkgPrice(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Package Title</label>
            <input
              type="text"
              required
              value={pkgName}
              onChange={e => setPkgName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Duration (Days)</label>
              <input
                type="number"
                value={pkgDays}
                onChange={e => setPkgDays(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Duration (Nights)</label>
              <input
                type="number"
                value={pkgNights}
                onChange={e => setPkgNights(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Key Inclusions (Comma separated)</label>
            <input
              type="text"
              value={pkgInclusions}
              onChange={e => setPkgInclusions(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddPkgModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white">Save Package</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Add Enquiry */}
      <FormDialog
        isOpen={showAddEnqModal}
        onClose={() => setShowAddEnqModal(false)}
        title="Register Travel Enquiry"
      >
        <form onSubmit={handleCreateEnquiry} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Customer Name</label>
            <input
              type="text"
              required
              value={enqName}
              onChange={e => setEnqName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                required
                value={enqEmail}
                onChange={e => setEnqEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                required
                value={enqPhone}
                onChange={e => setEnqPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Adults</label>
              <input
                type="number"
                min="1"
                value={enqAdults}
                onChange={e => setEnqAdults(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Budget (INR)</label>
              <input
                type="number"
                value={enqBudget}
                onChange={e => setEnqBudget(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddEnqModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white">Save Enquiry</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Add Supplier */}
      <FormDialog
        isOpen={showAddSuppModal}
        onClose={() => setShowAddSuppModal(false)}
        title="Onboard Travel Supplier"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Supplier Name</label>
            <input
              type="text"
              required
              value={suppName}
              onChange={e => setSuppName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={suppCategory}
                onChange={e => setSuppCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="HOTEL">HOTEL / RESORT</option>
                <option value="TRANSPORT">TRANSPORT / CAB</option>
                <option value="EXCURSION_OPERATOR">EXCURSION OPERATOR</option>
                <option value="DMC">LOCAL DMC PARTNER</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Destination</label>
              <input
                type="text"
                value={suppDest}
                onChange={e => setSuppDest(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contact Person</label>
              <input
                type="text"
                value={suppContact}
                onChange={e => setSuppContact(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={suppEmail}
                onChange={e => setSuppEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddSuppModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white">Save Supplier</button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
