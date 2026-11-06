import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { travelService } from '../../services/travelService';
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
  UserCheck,
  Award,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  Calendar,
  Check,
  X,
  FileCheck
} from 'lucide-react';

export function TravelSalesManagerView({ initialSubTab = 'dashboard' }) {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState(initialSubTab); // 'dashboard' | 'leads' | 'consultants' | 'approvals' | 'targets' | 'reports'

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [leads, setLeads] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [targets, setTargets] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);

  // Modals & form state
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [assigneeId, setAssigneeId] = useState('EMP-201');
  const [assignReason, setAssignReason] = useState('Bali holiday enquiry assignment');

  // New Lead Form
  const [leadForm, setLeadForm] = useState({
    firstName: 'Karan',
    lastName: 'Singhania',
    email: 'karan.s@example.com',
    phone: '+91 98112 23344',
    destination: 'Bali',
    departureDate: '2026-12-10',
    returnDate: '2026-12-15',
    adults: 2,
    children: 0,
    budget: 130000,
    currency: 'INR',
    travelType: 'HOLIDAY_PACKAGE',
    notes: 'Interested in luxury beachfront villa with airport transfer'
  });

  // Target Form
  const [targetForm, setTargetForm] = useState({
    name: 'Q4 Luxury Destination Target',
    targetType: 'REVENUE',
    employeeId: 'EMP-201',
    periodStart: '2026-10-01',
    periodEnd: '2026-12-31',
    targetValue: 800000,
    currency: 'INR'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, pipe, leadsRes, cons, tms, tgts, quotes, overdue] = await Promise.all([
        travelService.salesManager.getDashboard().catch(() => null),
        travelService.salesManager.getPipeline().catch(() => null),
        travelService.salesManager.getLeads().catch(() => ({ items: [] })),
        travelService.salesManager.getConsultants().catch(() => []),
        travelService.salesManager.getTeams().catch(() => []),
        travelService.salesManager.getTargets().catch(() => []),
        travelService.salesManager.getQuotations().catch(() => []),
        travelService.salesManager.getOverdueFollowUps().catch(() => [])
      ]);

      setDashboard(dash || {
        totalLeads: 420,
        newLeads: 35,
        qualifiedLeads: 120,
        activeQuotations: 48,
        confirmedBookings: 76,
        overdueFollowUps: 12,
        conversionRate: 18.1,
        currency: 'INR'
      });
      setPipeline(pipe || {
        NEW_ENQUIRY: 35,
        CONTACTED: 48,
        QUALIFIED: 120,
        ITINERARY_PREPARED: 64,
        QUOTATION_SENT: 48,
        NEGOTIATION: 29,
        BOOKED: 76,
        LOST: 18
      });
      setLeads(leadsRes?.items || [
        {
          leadId: 'LEAD-1001',
          customerName: 'Arun Kumar',
          email: 'arun@example.com',
          destination: 'Bali',
          departureDate: '2026-12-10',
          returnDate: '2026-12-15',
          budget: 120000,
          currency: 'INR',
          stage: 'QUALIFIED',
          assignedConsultantId: 'EMP-201'
        }
      ]);
      setConsultants(cons?.length ? cons : [
        { employeeId: 'EMP-201', name: 'Rajesh Verma', role: 'TRAVEL_CONSULTANT', activeLeads: 14, conversionRate: 21.43, teamId: 'TEAM-101' },
        { employeeId: 'EMP-202', name: 'Sneha Rao', role: 'TRAVEL_CONSULTANT', activeLeads: 10, conversionRate: 19.5, teamId: 'TEAM-101' }
      ]);
      setTeams(tms?.length ? tms : [{ teamId: 'TEAM-101', name: 'International Holiday Desk', teamLeadId: 'EMP-201', activeMembersCount: 4 }]);
      setTargets(tgts?.length ? tgts : [{ targetId: 'TARGET-1001', name: 'November Bali & Dubai Target', targetValue: 500000, achievedValue: 380000, currency: 'INR', status: 'ACTIVE' }]);
      setQuotations(quotes?.length ? quotes : [{ quoteId: 'TQUOTE-1001', leadId: 'LEAD-1001', subtotal: 65000, discountAmount: 2000, totalAmount: 63000, approvalStatus: 'PENDING_APPROVAL', requestedDiscountPercent: 8 }]);
      setOverdueTasks(overdue?.length ? overdue : [{ taskId: 'TASK-1001', title: 'Follow-up with Arun Kumar regarding Bali hotel selection', dueAt: '2026-10-27T10:00:00', assignedTo: 'EMP-201' }]);
    } catch {
      addNotification('Could not load Sales Manager data. Using defaults.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer: {
          firstName: leadForm.firstName,
          lastName: leadForm.lastName,
          email: leadForm.email,
          phone: leadForm.phone
        },
        travelRequirements: {
          destination: leadForm.destination,
          departureDate: leadForm.departureDate,
          returnDate: leadForm.returnDate,
          adults: parseInt(leadForm.adults, 10),
          children: parseInt(leadForm.children, 10),
          budget: parseFloat(leadForm.budget),
          currency: leadForm.currency,
          travelType: leadForm.travelType
        },
        leadSource: 'SALES_MANAGER_ENTRY',
        notes: leadForm.notes
      };
      const res = await travelService.salesManager.createLead(payload);
      addNotification(`Travel Lead ${res.leadId || 'created'} successfully!`, 'success');
      setShowCreateLead(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Failed to create lead', 'error');
    }
  };

  const handleAssignLead = async () => {
    if (!selectedLead) return;
    try {
      await travelService.salesManager.assignLead(selectedLead.leadId, {
        consultantId: assigneeId,
        reason: assignReason
      });
      addNotification(`Lead ${selectedLead.leadId} assigned to ${assigneeId}!`, 'success');
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Assignment failed', 'error');
    }
  };

  const handleQualifyLead = async (leadId) => {
    try {
      await travelService.salesManager.qualifyLead(leadId, {
        qualification: {
          destinationConfirmed: true,
          travelDatesConfirmed: true,
          budgetDiscussed: true,
          travellerCountConfirmed: true
        },
        notes: 'Sales Manager verified client travel commitment'
      });
      addNotification(`Lead ${leadId} qualified!`, 'success');
      loadData();
    } catch (err) {
      addNotification(err.message || 'Qualification failed', 'error');
    }
  };

  const handleQuotationDecision = async (quoteId, decision) => {
    try {
      if (decision === 'APPROVE') {
        await travelService.salesManager.approveQuotation(quoteId, {
          decision: 'APPROVE',
          comment: 'Approved special package discount by Sales Manager'
        });
        addNotification(`Quotation ${quoteId} approved!`, 'success');
      } else {
        await travelService.salesManager.rejectQuotation(quoteId, {
          reason: 'Discount exceeds authorized margins. Please revise hotel class.'
        });
        addNotification(`Quotation ${quoteId} rejected.`, 'info');
      }
      loadData();
    } catch (err) {
      addNotification(err.message || 'Action failed', 'error');
    }
  };

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    try {
      await travelService.salesManager.createTarget(targetForm);
      addNotification('Sales target created successfully!', 'success');
      setShowTargetModal(false);
      loadData();
    } catch (err) {
      addNotification(err.message || 'Failed to create sales target', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-md">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Travel Sales Manager
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-700">
                Wanderlust Expeditions
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pipeline control, lead allocation, consultant quotas, discount approvals, and revenue optimization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateLead(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl shadow hover:from-sky-500 hover:to-indigo-500 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            New Travel Lead
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Sales Dashboard', icon: TrendingUp },
          { id: 'leads', label: 'Leads & Allocation', icon: Users },
          { id: 'consultants', label: 'Consultants & Teams', icon: UserCheck },
          { id: 'approvals', label: 'Quotation Approvals', icon: FileCheck },
          { id: 'targets', label: 'Sales Targets', icon: Award },
          { id: 'reports', label: 'Overdue & Escalations', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Sales Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Travel Leads
                </span>
                <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboard?.totalLeads || 420}
              </p>
              <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>+{dashboard?.newLeads || 35} new this week</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qualified Leads
                </span>
                <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboard?.qualifiedLeads || 120}
              </p>
              <div className="text-xs text-gray-500 font-medium mt-1">
                Ready for custom itineraries
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Confirmed Bookings
                </span>
                <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboard?.confirmedBookings || 76}
              </p>
              <div className="text-xs text-indigo-600 font-medium mt-1">
                Conversion Rate: {dashboard?.conversionRate || 18.1}%
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Overdue Follow-ups
                </span>
                <span className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
                {dashboard?.overdueFollowUps || 12}
              </p>
              <div className="text-xs text-gray-500 font-medium mt-1">
                Requires consultant re-engagement
              </div>
            </div>
          </div>

          {/* Pipeline Visualizer */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" />
                Travel Sales Pipeline Breakdown
              </h2>
              <span className="text-xs text-gray-500">Current Month</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {pipeline &&
                Object.entries(pipeline).map(([stg, count]) => (
                  <div
                    key={stg}
                    className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                      {stg.replace('_', ' ')}
                    </span>
                    <span className="text-xl font-bold text-sky-700 dark:text-sky-300 mt-2">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Leads & Allocation */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Travel Enquiries</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Assign, qualify, and track travel leads across consultants.</p>
            </div>
            <button
              onClick={() => setShowCreateLead(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-500"
            >
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3 px-4">Lead ID / Guest</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {leads.map((l) => (
                  <tr key={l.leadId} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {l.customerName || (l.customer?.firstName ? `${l.customer.firstName} ${l.customer.lastName}` : 'Guest')}
                      </div>
                      <div className="text-xs text-gray-400">{l.leadId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {l.destination || l.travelRequirements?.destination || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {l.departureDate || l.travelRequirements?.departureDate || '2026-12-10'} →{' '}
                      {l.returnDate || l.travelRequirements?.returnDate || '2026-12-15'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{(l.budget || l.travelRequirements?.budget || 120000).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {l.stage || 'NEW_ENQUIRY'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {l.assignedConsultantId || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowAssignModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-medium bg-sky-50 dark:bg-sky-900/30 text-sky-600 rounded-lg hover:bg-sky-100"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleQualifyLead(l.leadId)}
                        className="px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg hover:bg-emerald-100"
                      >
                        Qualify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Consultants & Teams */}
      {activeTab === 'consultants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-600" />
              Eligible Travel Consultants
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {consultants.map((c) => (
                <div key={c.employeeId} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-gray-500">{c.employeeId} • {c.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      {c.conversionRate || 21.4}% conv
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{c.activeLeads || 12} active leads</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Travel Sales Teams
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {teams.map((t) => (
                <div key={t.teamId} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                    <p className="text-xs text-gray-500">{t.teamId} • Lead: {t.teamLeadId}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {t.activeMembersCount || 4} Members
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Quotation Approvals */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              Quotation Discount & Margin Approvals
            </h2>
            <span className="text-xs text-gray-500">Enforce manager discount thresholds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3 px-4">Quote ID</th>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Final Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {quotations.map((q) => (
                  <tr key={q.quoteId} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">{q.quoteId}</td>
                    <td className="py-3.5 px-4">{q.leadId || 'LEAD-1001'}</td>
                    <td className="py-3.5 px-4">₹{(q.subtotal || 65000).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">
                      ₹{(q.discountAmount || 2000).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      ₹{(q.totalAmount || 63000).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {q.approvalStatus || 'PENDING_APPROVAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleQuotationDecision(q.quoteId, 'APPROVE')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleQuotationDecision(q.quoteId, 'REJECT')}
                        className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Sales Targets */}
      {activeTab === 'targets' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Travel Sales Quotas & Targets</h2>
              <p className="text-xs text-gray-500">Track targets assigned to consultants for the current period.</p>
            </div>
            <button
              onClick={() => setShowTargetModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-500"
            >
              <Plus className="w-4 h-4" /> Create Target
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {targets.map((tgt) => {
              const achieved = tgt.achievedValue || 380000;
              const goal = tgt.targetValue || 500000;
              const pct = Math.min(Math.round((achieved / goal) * 100), 100);
              return (
                <div key={tgt.targetId} className="p-5 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-750/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{tgt.name}</h3>
                      <p className="text-xs text-gray-500">Consultant: {tgt.employeeId || 'EMP-201'}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {pct}% Achieved
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>

                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                    <span>Achieved: ₹{achieved.toLocaleString('en-IN')}</span>
                    <span>Target: ₹{goal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Overdue Follow-ups & Escalations */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Overdue Follow-ups & Escalated Travel Enquiries
          </h2>
          <p className="text-xs text-gray-500">Intervene directly or reassign critical leads to prevent drop-offs.</p>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {overdueTasks.map((t) => (
              <div key={t.taskId} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t.title}</h3>
                  <p className="text-xs text-rose-500 font-medium">Due: {t.dueAt} • Assignee: {t.assignedTo}</p>
                </div>
                <button
                  onClick={() => addNotification(`Escalation reminder sent to ${t.assignedTo}`, 'info')}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-100"
                >
                  Send Escalation Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Lead */}
      {showCreateLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Travel Lead</h2>
              <button onClick={() => setShowCreateLead(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input
                    type="text"
                    required
                    value={leadForm.firstName}
                    onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input
                    type="text"
                    required
                    value={leadForm.lastName}
                    onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Destination</label>
                  <input
                    type="text"
                    required
                    value={leadForm.destination}
                    onChange={(e) => setLeadForm({ ...leadForm, destination: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={leadForm.departureDate}
                    onChange={(e) => setLeadForm({ ...leadForm, departureDate: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Return Date</label>
                  <input
                    type="date"
                    required
                    value={leadForm.returnDate}
                    onChange={(e) => setLeadForm({ ...leadForm, returnDate: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Approx. Budget (₹)</label>
                  <input
                    type="number"
                    required
                    value={leadForm.budget}
                    onChange={(e) => setLeadForm({ ...leadForm, budget: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Travel Type</label>
                  <select
                    value={leadForm.travelType}
                    onChange={(e) => setLeadForm({ ...leadForm, travelType: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                  >
                    <option value="HOLIDAY_PACKAGE">Holiday Package</option>
                    <option value="HONEYMOON">Honeymoon</option>
                    <option value="LUXURY_TOUR">Luxury Tour</option>
                    <option value="FAMILY_VACATION">Family Vacation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Customer Notes</label>
                <textarea
                  rows="2"
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateLead(false)}
                  className="px-4 py-2 border rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-500 shadow"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Lead */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Assign Lead {selectedLead.leadId}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Select Consultant</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  {consultants.map((c) => (
                    <option key={c.employeeId} value={c.employeeId}>
                      {c.name} ({c.employeeId}) — {c.activeLeads || 0} active leads
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Assignment Reason</label>
                <input
                  type="text"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                Cancel
              </button>
              <button
                onClick={handleAssignLead}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-500"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Target */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Sales Target</h2>
            <form onSubmit={handleCreateTarget} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Target Name</label>
                <input
                  type="text"
                  required
                  value={targetForm.name}
                  onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Target Value (₹)</label>
                <input
                  type="number"
                  required
                  value={targetForm.targetValue}
                  onChange={(e) => setTargetForm({ ...targetForm, targetValue: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Assigned Consultant</label>
                <select
                  value={targetForm.employeeId}
                  onChange={(e) => setTargetForm({ ...targetForm, employeeId: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  {consultants.map((c) => (
                    <option key={c.employeeId} value={c.employeeId}>
                      {c.name} ({c.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowTargetModal(false)} className="px-4 py-2 border rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-500">
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
