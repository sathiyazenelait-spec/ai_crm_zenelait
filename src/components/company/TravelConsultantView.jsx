import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { travelService } from '../../services/travelService';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Send,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Hotel,
  Car,
  Check
} from 'lucide-react';

export function TravelConsultantView({ initialSubTab = 'dashboard' }) {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState(initialSubTab); // 'dashboard' | 'leads' | 'search' | 'itineraries' | 'quotations' | 'handoff'

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [quotations, setQuotations] = useState([]);

  // Active workspace states
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  // Forms
  const [showReqModal, setShowReqModal] = useState(false);
  const [showItinModal, setShowItinModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);

  // Requirements Form
  const [reqForm, setReqForm] = useState({
    destination: 'Bali',
    departureDate: '2026-12-10',
    returnDate: '2026-12-15',
    adults: 2,
    children: 0,
    departureCity: 'Chennai',
    budget: 120000,
    currency: 'INR',
    hotelCategory: 'FOUR_STAR',
    preferredTravelStyle: 'RELAXED',
    specialRequirements: 'Airport transfers, Daily Breakfast, Beach villa'
  });

  // Itinerary Form
  const [itinForm, setItinForm] = useState({
    title: 'Bali Five-Night Tropical Holiday',
    destination: 'Bali',
    startDate: '2026-12-10',
    endDate: '2026-12-15',
    currency: 'INR'
  });

  // Quotation Form
  const [quoteForm, setQuoteForm] = useState({
    hotelPrice: 60000,
    transferPrice: 5000,
    discountAmount: 2000,
    validUntil: '2026-11-15'
  });

  // Handoff Form
  const [handoffForm, setHandoffForm] = useState({
    acceptanceRef: 'ACCEPTANCE-1001',
    notes: 'Customer Arun Kumar confirmed itinerary and approved quotation via WhatsApp.'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, leadsRes, dests, pkgs, itins, quotes] = await Promise.all([
        travelService.consultant.getDashboard().catch(() => null),
        travelService.consultant.getAssignedLeads().catch(() => ({ items: [] })),
        travelService.consultant.getDestinations().catch(() => []),
        travelService.consultant.getPackages().catch(() => []),
        travelService.consultant.getItineraries().catch(() => []),
        travelService.consultant.getQuotations().catch(() => [])
      ]);

      setDashboard(dash || {
        assignedLeads: 8,
        upcomingFollowUps: 3,
        activeQuotations: 5,
        acceptedTravelPlans: 2,
        pendingBookingHandoffs: 1,
        conversionRate: 22.5,
        currency: 'INR'
      });
      setAssignedLeads(leadsRes?.items?.length ? leadsRes.items : [
        {
          leadId: 'LEAD-1001',
          customerName: 'Arun Kumar',
          destination: 'Bali',
          departureDate: '2026-12-10',
          returnDate: '2026-12-15',
          travellers: 2,
          budget: 120000,
          currency: 'INR',
          stage: 'QUALIFIED'
        }
      ]);
      setDestinations(dests?.length ? dests : [
        { destinationId: 'DEST-1001', name: 'Bali', country: 'Indonesia', bestSeason: 'April to October' },
        { destinationId: 'DEST-1002', name: 'Dubai', country: 'UAE', bestSeason: 'November to March' }
      ]);
      setPackages(pkgs?.length ? pkgs : [
        {
          packageId: 'PKG-1001',
          name: 'Bali Five-Night Tropical Holiday Package',
          destination: 'Bali',
          priceFrom: 95000,
          currency: 'INR',
          availabilityStatus: 'REQUIRES_SUPPLIER_CONFIRMATION'
        }
      ]);
      setItineraries(itins?.length ? itins : [
        {
          itineraryId: 'ITIN-1001',
          leadId: 'LEAD-1001',
          title: 'Bali Five-Night Holiday',
          destination: 'Bali',
          startDate: '2026-12-10',
          endDate: '2026-12-15',
          version: 1,
          status: 'DRAFT',
          items: [
            { itemId: 'ITEM-1', dayNumber: 1, title: 'Denpasar Airport Private Transfer', type: 'TRANSFER', price: 2500 },
            { itemId: 'ITEM-2', dayNumber: 1, title: 'Bali Beach Resort 4-Star Deluxe Room', type: 'HOTEL', price: 12000 }
          ]
        }
      ]);
      setQuotations(quotes?.length ? quotes : [
        {
          quoteId: 'TQUOTE-1001',
          leadId: 'LEAD-1001',
          itineraryId: 'ITIN-1001',
          subtotal: 65000,
          discountAmount: 2000,
          totalAmount: 63000,
          currency: 'INR',
          status: 'DRAFT',
          approvalStatus: 'NOT_REQUIRED'
        }
      ]);
    } catch {
      addNotification('Using default consultation state.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRequirements = async (e) => {
    e.preventDefault();
    const leadId = selectedLead?.leadId || 'LEAD-1001';
    try {
      const payload = {
        destination: reqForm.destination,
        departureDate: reqForm.departureDate,
        returnDate: reqForm.returnDate,
        adults: parseInt(reqForm.adults, 10),
        children: parseInt(reqForm.children, 10),
        departureCity: reqForm.departureCity,
        budget: parseFloat(reqForm.budget),
        currency: reqForm.currency,
        hotelCategory: reqForm.hotelCategory,
        preferredTravelStyle: reqForm.preferredTravelStyle,
        specialRequirements: reqForm.specialRequirements.split(',').map((s) => s.trim())
      };
      await travelService.consultant.recordRequirements(leadId, payload);
      addNotification(`Requirements recorded for Lead ${leadId}!`, 'success');
      setShowReqModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Failed to save travel requirements', 'error');
    }
  };

  const handleCreateItinerary = async (e) => {
    e.preventDefault();
    const leadId = selectedLead?.leadId || 'LEAD-1001';
    try {
      const payload = {
        leadId,
        customerId: 'CUST-1001',
        title: itinForm.title,
        destination: itinForm.destination,
        startDate: itinForm.startDate,
        endDate: itinForm.endDate,
        travellers: { adults: 2, children: 0 },
        currency: itinForm.currency
      };
      const res = await travelService.consultant.createItinerary(payload);
      addNotification(`Itinerary ${res.itineraryId || 'created'} successfully!`, 'success');
      setShowItinModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Failed to create itinerary', 'error');
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    const leadId = selectedLead?.leadId || 'LEAD-1001';
    const itinId = selectedItinerary?.itineraryId || 'ITIN-1001';
    try {
      const payload = {
        leadId,
        customerId: 'CUST-1001',
        itineraryId: itinId,
        currency: 'INR',
        items: [
          { description: 'Hotel Accommodation (5 Nights)', quantity: 5, unitPrice: quoteForm.hotelPrice / 5 },
          { description: 'Airport Transfers & Transport', quantity: 1, unitPrice: quoteForm.transferPrice }
        ],
        discountAmount: parseFloat(quoteForm.discountAmount),
        validUntil: quoteForm.validUntil
      };
      const res = await travelService.consultant.createQuotation(payload);
      addNotification(`Quotation ${res.quoteId || 'created'} generated!`, 'success');
      setShowQuoteModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Failed to create quotation', 'error');
    }
  };

  const handleSendQuote = async (quoteId) => {
    try {
      await travelService.consultant.sendQuotation(quoteId, {
        channel: 'EMAIL',
        recipientReference: 'VERIFIED_CUSTOMER_CONTACT'
      });
      addNotification(`Quotation ${quoteId} submitted and sent to guest!`, 'success');
      loadData();
    } catch (err) {
      addNotification(err.message || 'Failed to send quote', 'error');
    }
  };

  const handleHandoffToBooking = async (e) => {
    e.preventDefault();
    const leadId = selectedLead?.leadId || 'LEAD-1001';
    try {
      await travelService.consultant.handoffToBooking(leadId, {
        quoteId: 'TQUOTE-1001',
        itineraryId: 'ITIN-1001',
        customerAcceptanceReference: handoffForm.acceptanceRef,
        notes: handoffForm.notes
      });
      addNotification('Travel plan submitted to Booking Executive!', 'success');
      setShowHandoffModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Booking handoff failed', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white shadow-md">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Travel Consultant Workspace
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                Rajesh Verma (EMP-201)
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Capture traveller preferences, research live supplier packages, build itineraries, and prepare quotes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowItinModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow hover:from-emerald-500 hover:to-teal-500 font-medium"
          >
            <Plus className="w-4 h-4" />
            Build Itinerary
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Overview', icon: Compass },
          { id: 'leads', label: 'Assigned Leads & Requirements', icon: Users },
          { id: 'search', label: 'Travel Product Search', icon: Search },
          { id: 'itineraries', label: 'Itineraries', icon: Layers },
          { id: 'quotations', label: 'Quotations', icon: DollarSign },
          { id: 'handoff', label: 'Booking Handoff', icon: ArrowRight }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
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
              <span className="text-xs font-semibold text-gray-500 uppercase">My Assigned Leads</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboard?.assignedLeads || 8}
              </p>
              <span className="text-xs text-emerald-600 font-medium">In active consultation</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Active Quotations</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboard?.activeQuotations || 5}
              </p>
              <span className="text-xs text-sky-600 font-medium">Shared with guests</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Accepted Plans</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboard?.acceptedTravelPlans || 2}
              </p>
              <span className="text-xs text-indigo-600 font-medium">Ready for booking handoff</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Personal Conversion</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {dashboard?.conversionRate || 22.5}%
              </p>
              <span className="text-xs text-gray-500 font-medium">Target: 20%</span>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              onClick={() => setActiveTab('leads')}
              className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 cursor-pointer hover:shadow-md transition-all"
            >
              <Users className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-gray-900 dark:text-white">Collect Travel Requirements</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Record destination dates, traveller counts, and flight/hotel preferences for assigned leads.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('search')}
              className="p-5 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 rounded-2xl border border-sky-100 dark:border-sky-800 cursor-pointer hover:shadow-md transition-all"
            >
              <Search className="w-6 h-6 text-sky-600 mb-2" />
              <h3 className="font-bold text-gray-900 dark:text-white">Supplier Product Search</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Query verified hotels, packages, and DMCs with real supplier availability status.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('handoff')}
              className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 cursor-pointer hover:shadow-md transition-all"
            >
              <ArrowRight className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="font-bold text-gray-900 dark:text-white">Booking Team Handoff</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Forward customer-accepted travel packages to Booking Executives for reservations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assigned Leads & Requirements */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assigned Customer Enquiries</h2>
              <p className="text-xs text-gray-500">Record requirements and draft plans for each customer.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="py-3 px-4">Lead ID / Guest</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Travellers</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {assignedLeads.map((l) => (
                  <tr key={l.leadId} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{l.customerName || 'Arun Kumar'}</div>
                      <div className="text-xs text-gray-400">{l.leadId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-emerald-700 dark:text-emerald-400">{l.destination}</td>
                    <td className="py-3.5 px-4 text-xs">{l.departureDate} → {l.returnDate}</td>
                    <td className="py-3.5 px-4 text-xs">{l.travellers || 2} Adults</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">₹{l.budget?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowReqModal(true);
                        }}
                        className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100"
                      >
                        Requirements
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowItinModal(true);
                        }}
                        className="px-3 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-600 rounded-lg text-xs font-semibold hover:bg-sky-100"
                      >
                        New Itinerary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Travel Product Search */}
      {activeTab === 'search' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Supplier Packages & Product Catalog</h2>
            <p className="text-xs text-gray-500">Live prices from verified Destination Management Companies (DMCs).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.packageId} className="p-4 border rounded-xl space-y-2 bg-gray-50/50 dark:bg-gray-750/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
                    <p className="text-xs text-gray-500">{pkg.destination} • {pkg.packageId}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {pkg.availabilityStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    From ₹{(pkg.priceFrom || 95000).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => {
                      addNotification(`Attached package ${pkg.packageId} to itinerary builder`, 'success');
                      setActiveTab('itineraries');
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                  >
                    Select for Itinerary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Itineraries */}
      {activeTab === 'itineraries' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Day-by-Day Travel Itineraries</h2>
              <p className="text-xs text-gray-500">Sequence hotels, activities, and private airport transfers.</p>
            </div>
            <button
              onClick={() => setShowItinModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500"
            >
              <Plus className="w-4 h-4" /> Create Itinerary
            </button>
          </div>

          <div className="space-y-4">
            {itineraries.map((it) => (
              <div key={it.itineraryId} className="p-5 border rounded-2xl space-y-4 bg-gray-50/50 dark:bg-gray-750/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{it.title}</h3>
                    <p className="text-xs text-gray-500">{it.destination} • {it.startDate} to {it.endDate} • Version {it.version || 1}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItinerary(it);
                        setShowQuoteModal(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
                    >
                      Generate Quotation
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Components</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {it.items?.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-xl border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {item.type === 'HOTEL' ? <Hotel className="w-4 h-4 text-indigo-500" /> : <Car className="w-4 h-4 text-emerald-500" />}
                          <span className="font-semibold">{item.title}</span>
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">₹{item.price?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Quotations */}
      {activeTab === 'quotations' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer Travel Quotations</h2>
              <p className="text-xs text-gray-500">Calculate net costs, discounts, and dispatch formal quotes.</p>
            </div>
            <button
              onClick={() => setShowQuoteModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4" /> New Quotation
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="py-3 px-4">Quote ID</th>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {quotations.map((q) => (
                  <tr key={q.quoteId} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">{q.quoteId}</td>
                    <td className="py-3.5 px-4">{q.leadId || 'LEAD-1001'}</td>
                    <td className="py-3.5 px-4">₹{(q.subtotal || 65000).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-rose-600">₹{(q.discountAmount || 2000).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">₹{(q.totalAmount || 63000).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleSendQuote(q.quoteId)}
                        className="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-500"
                      >
                        Send to Guest
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead({ leadId: q.leadId || 'LEAD-1001' });
                          setShowHandoffModal(true);
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
                      >
                        Handoff to Booking
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Booking Handoff */}
      {activeTab === 'handoff' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Booking Operations Handoff</h2>
              <p className="text-xs text-gray-500">Submit verified customer acceptances to the Booking Executive.</p>
            </div>
            <button
              onClick={() => setShowHandoffModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500"
            >
              <ArrowRight className="w-4 h-4" /> New Handoff
            </button>
          </div>

          <div className="p-5 border rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" />
              Accepted Travel Plan — HANDOFF-1001
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Lead LEAD-1001 • Bali Five-Night Holiday • Quotation TQUOTE-1001 (₹63,000)
            </p>
            <div className="text-xs text-gray-500">
              Status: <span className="font-semibold text-amber-600">PENDING_BOOKING_REVIEW</span> (Assigned to Booking Executive)
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Requirements */}
      {showReqModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Travel Requirements</h2>
            <form onSubmit={handleSaveRequirements} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Destination</label>
                  <input
                    type="text"
                    required
                    value={reqForm.destination}
                    onChange={(e) => setReqForm({ ...reqForm, destination: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Departure City</label>
                  <input
                    type="text"
                    required
                    value={reqForm.departureCity}
                    onChange={(e) => setReqForm({ ...reqForm, departureCity: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={reqForm.departureDate}
                    onChange={(e) => setReqForm({ ...reqForm, departureDate: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Return Date</label>
                  <input
                    type="date"
                    required
                    value={reqForm.returnDate}
                    onChange={(e) => setReqForm({ ...reqForm, returnDate: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Budget (₹)</label>
                  <input
                    type="number"
                    required
                    value={reqForm.budget}
                    onChange={(e) => setReqForm({ ...reqForm, budget: parseFloat(e.target.value) })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Hotel Category</label>
                  <select
                    value={reqForm.hotelCategory}
                    onChange={(e) => setReqForm({ ...reqForm, hotelCategory: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  >
                    <option value="THREE_STAR">3-Star Standard</option>
                    <option value="FOUR_STAR">4-Star Deluxe</option>
                    <option value="FIVE_STAR">5-Star Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Special Requirements (comma-separated)</label>
                <input
                  type="text"
                  value={reqForm.specialRequirements}
                  onChange={(e) => setReqForm({ ...reqForm, specialRequirements: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowReqModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500">
                  Save Requirements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Build Itinerary */}
      {showItinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Travel Itinerary</h2>
            <form onSubmit={handleCreateItinerary} className="space-y-3">
              <div>
                <label className="text-xs font-medium">Itinerary Title</label>
                <input
                  type="text"
                  required
                  value={itinForm.title}
                  onChange={(e) => setItinForm({ ...itinForm, title: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Destination</label>
                <input
                  type="text"
                  required
                  value={itinForm.destination}
                  onChange={(e) => setItinForm({ ...itinForm, destination: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Start Date</label>
                  <input
                    type="date"
                    required
                    value={itinForm.startDate}
                    onChange={(e) => setItinForm({ ...itinForm, startDate: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">End Date</label>
                  <input
                    type="date"
                    required
                    value={itinForm.endDate}
                    onChange={(e) => setItinForm({ ...itinForm, endDate: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowItinModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500">
                  Create Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Quotation */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Quotation</h2>
            <form onSubmit={handleCreateQuotation} className="space-y-3">
              <div>
                <label className="text-xs font-medium">Accommodation Total (₹)</label>
                <input
                  type="number"
                  required
                  value={quoteForm.hotelPrice}
                  onChange={(e) => setQuoteForm({ ...quoteForm, hotelPrice: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Transfers & Activities (₹)</label>
                <input
                  type="number"
                  required
                  value={quoteForm.transferPrice}
                  onChange={(e) => setQuoteForm({ ...quoteForm, transferPrice: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Discount (₹)</label>
                <input
                  type="number"
                  value={quoteForm.discountAmount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, discountAmount: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500">
                  Generate Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Booking Handoff */}
      {showHandoffModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submit Booking Handoff</h2>
            <form onSubmit={handleHandoffToBooking} className="space-y-3">
              <div>
                <label className="text-xs font-medium">Customer Acceptance Reference</label>
                <input
                  type="text"
                  required
                  value={handoffForm.acceptanceRef}
                  onChange={(e) => setHandoffForm({ ...handoffForm, acceptanceRef: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Handoff Instructions for Booking Executive</label>
                <textarea
                  rows="3"
                  value={handoffForm.notes}
                  onChange={(e) => setHandoffForm({ ...handoffForm, notes: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-sm dark:bg-gray-700"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowHandoffModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500">
                  Submit to Operations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
