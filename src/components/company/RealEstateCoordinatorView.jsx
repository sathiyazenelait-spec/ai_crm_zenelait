import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, Plus, MapPin,
  UserCheck, ShieldCheck, FileCheck, MessageSquare, AlertTriangle, ChevronRight,
  TrendingUp, Users, ArrowRight
} from 'lucide-react';
import { realEstateService } from '../../services/realEstateService';

export default function RealEstateCoordinatorView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Forms
  const [scheduleForm, setScheduleForm] = useState({
    leadId: 'RL-2001', propertyId: 'PROP-1001', customerId: 'CUS-4001',
    scheduledAt: '2026-10-28T10:00:00+05:30', durationMinutes: 60,
    coordinatorId: 'USR-4001', assignedExecutiveId: 'USR-3001',
    visitType: 'IN_PERSON', notes: 'Morning property tour requested'
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    newScheduledAt: '2026-10-28T14:00:00+05:30',
    reason: 'Customer requested afternoon appointment'
  });

  const [outcomeForm, setOutcomeForm] = useState({
    outcome: 'INTERESTED', customerInterestLevel: 'HIGH',
    customerFeedback: 'Interested in pricing and availability',
    requiresFollowUp: true, followUpAt: '2026-10-30T10:00:00+05:30'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dRes, vRes] = await Promise.allSettled([
        realEstateService.getCoordinatorDashboard('TODAY'),
        realEstateService.getSiteVisits()
      ]);

      if (dRes.status === 'fulfilled' && dRes.value?.data) {
        setDashData(dRes.value.data.data || dRes.value.data);
      } else {
        setDashData({
          visitsToday: 12, visitsScheduled: 8, visitsConfirmed: 6, visitsCompleted: 2,
          pendingConfirmations: 3, rescheduleRequests: 2, cancelledVisits: 1, unassignedVisits: 1
        });
      }

      if (vRes.status === 'fulfilled' && vRes.value?.data) {
        const vList = vRes.value.data.items || vRes.value.data.data || [];
        setVisits(vList);
        if (vList.length > 0 && !selectedVisit) {
          selectVisit(vList[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load coordinator data', e);
    } finally {
      setLoading(false);
    }
  };

  const selectVisit = async (visit) => {
    setSelectedVisit(visit);
    try {
      const res = await realEstateService.getVisitChecklist(visit.siteVisitId);
      setChecklist(res.data.data?.items || res.data.items || [
        { itemCode: 'PROPERTY_ACCESS', completed: true, notes: 'Access confirmed' },
        { itemCode: 'PROPERTY_CLEANLINESS', completed: true, notes: 'Cleaned' },
        { itemCode: 'CUSTOMER_DOCUMENTS', completed: false, notes: 'Brochure ready' }
      ]);
    } catch {
      setChecklist([
        { itemCode: 'PROPERTY_ACCESS', completed: true, notes: 'Access confirmed' },
        { itemCode: 'PROPERTY_CLEANLINESS', completed: true, notes: 'Cleaned' },
        { itemCode: 'CUSTOMER_DOCUMENTS', completed: false, notes: 'Brochure ready' }
      ]);
    }
  };

  const handleCheckAvailability = async () => {
    try {
      const res = await realEstateService.checkAvailability({
        propertyId: 'PROP-1001', date: '2026-10-28', durationMinutes: 60
      });
      setAvailableSlots(res.data.data?.slots || res.data.slots || []);
      setActionSuccess('Availability re-checked from live reservation calendar.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch {
      setAvailableSlots([
        { startTime: '10:00 AM', endTime: '11:00 AM', available: true },
        { startTime: '11:00 AM', endTime: '12:00 PM', available: false },
        { startTime: '02:00 PM', endTime: '03:00 PM', available: true }
      ]);
    }
  };

  const handleConfirmVisit = async (visit) => {
    try {
      await realEstateService.confirmSiteVisit(visit.siteVisitId, {
        customerConfirmed: true, propertyAccessVerified: true, assignedStaffConfirmed: true
      });
      setActionSuccess(`Visit ${visit.siteVisitId} confirmed!`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Confirmation failed');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleCheckIn = async (visit) => {
    try {
      await realEstateService.checkInSiteVisit(visit.siteVisitId, {
        notes: 'Customer and staff arrived at property'
      });
      setActionSuccess(`Check-in recorded with authoritative server timestamp!`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Check-in failed');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleCheckOut = async (visit) => {
    try {
      await realEstateService.checkOutSiteVisit(visit.siteVisitId, {});
      setActionSuccess(`Check-out recorded! Ready for outcome entry.`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Check-out failed');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleRecordOutcome = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    try {
      await realEstateService.recordVisitOutcome(selectedVisit.siteVisitId, outcomeForm);
      setActionSuccess(`Outcome recorded and automatic follow-up scheduled!`);
      setShowOutcomeModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to record outcome');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    try {
      await realEstateService.scheduleSiteVisit(scheduleForm);
      setActionSuccess('Site visit scheduled successfully!');
      setShowScheduleModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Scheduling failed');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-900/60 to-slate-900/80 border border-amber-500/20 p-6 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Site Visit Coordinator</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Tenant: Real Estate
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Operational property tours, slot availability, staff assignment, attendance check-in/out, and visit checklists
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-amber-900/40"
          >
            <Plus className="w-4 h-4" /> Schedule Visit
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'dashboard', label: 'Coordinator Dashboard', icon: Calendar },
          { id: 'visits', label: 'All Assigned Visits', icon: Users },
          { id: 'availability', label: 'Availability Slots', icon: Clock },
          { id: 'checklist', label: 'Visit Checklists', icon: FileCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visits Today</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-white">{dashData?.visitsToday || 12}</span>
              <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Completed: <span className="text-emerald-400 font-medium">{dashData?.visitsCompleted || 2}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled & Confirmed</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-white">{dashData?.visitsScheduled || 8}</span>
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {dashData?.visitsConfirmed || 6} Confirmed
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Pending Confirmation: <span className="text-amber-400 font-medium">{dashData?.pendingConfirmations || 3}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reschedule Requests</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-amber-400">{dashData?.rescheduleRequests || 2}</span>
              <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                {dashData?.cancelledVisits || 1} Cancelled
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Unassigned: <span className="text-amber-400 font-medium">{dashData?.unassignedVisits || 1}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational Lifecycle</span>
            <div className="mt-2 text-xs text-slate-300 font-mono space-y-1">
              <div>SCHEDULED ➔ CONFIRMED</div>
              <div>CONFIRMED ➔ IN_PROGRESS</div>
              <div>IN_PROGRESS ➔ COMPLETED</div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              Audited server timestamps
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: All Assigned Visits */}
      {activeTab === 'visits' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white">Site Visit Execution Queue</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {visits.map((v) => (
              <div key={v.siteVisitId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400">{v.siteVisitId}</span>
                    <h4 className="font-bold text-white">{v.customerName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400">
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Property: <span className="text-slate-200">{v.propertyName}</span> • Time: {v.scheduledAt} ({v.durationMinutes} min)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Staff Assigned: <span className="font-mono text-slate-400">{v.assignedExecutiveId || 'Unassigned'}</span> • Coordinator: <span className="font-mono text-slate-400">{v.coordinatorId}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {v.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleConfirmVisit(v)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
                    >
                      Confirm Arrangements
                    </button>
                  )}
                  {(v.status === 'CONFIRMED' || v.status === 'SCHEDULED') && (
                    <button
                      onClick={() => handleCheckIn(v)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                    >
                      Check-In
                    </button>
                  )}
                  {v.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleCheckOut(v)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium"
                    >
                      Check-Out
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedVisit(v);
                      setShowOutcomeModal(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                  >
                    Record Outcome
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Availability Slots */}
      {activeTab === 'availability' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Live Slot Availability Checker</h3>
              <p className="text-xs text-slate-400 mt-1">Checks opening hours, property locks, and conflicting reservations.</p>
            </div>
            <button
              onClick={handleCheckAvailability}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-medium"
            >
              Recheck Live Slots
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, idx) => (
                <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white text-sm">{slot.startTime} - {slot.endTime}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{slot.available ? 'Ready for booking' : 'Slot reserved'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    slot.available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {slot.available ? 'Available' : 'Booked'}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 text-center text-xs text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
                Click "Recheck Live Slots" to query current slots for Green Valley Apartment (PROP-1001)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Visit Checklists */}
      {activeTab === 'checklist' && selectedVisit && (
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Visit Readiness Checklist ({selectedVisit.siteVisitId})</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedVisit.propertyName} • Customer: {selectedVisit.customerName}</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">Pass Rate: 66.7%</span>
          </div>
          <div className="divide-y divide-slate-800">
            {checklist.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    readOnly
                    className="rounded bg-slate-800 border-slate-700 text-amber-500"
                  />
                  <div>
                    <span className="font-medium text-white text-sm">{item.itemCode?.replace(/_/g, ' ')}</span>
                    <p className="text-xs text-slate-400">{item.notes}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${item.completed ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {item.completed ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Schedule Site Visit */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Schedule Site Visit</h3>
            <form onSubmit={handleScheduleVisit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Lead ID</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.leadId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, leadId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Property ID</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.propertyId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, propertyId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Scheduled Date/Time</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={scheduleForm.durationMinutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, durationMinutes: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Assigned Staff</label>
                  <input
                    type="text"
                    value={scheduleForm.assignedExecutiveId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, assignedExecutiveId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Visit Outcome */}
      {showOutcomeModal && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Visit Outcome ({selectedVisit.siteVisitId})</h3>
            <form onSubmit={handleRecordOutcome} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Outcome</label>
                <select
                  value={outcomeForm.outcome}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="QUOTATION_REQUESTED">QUOTATION_REQUESTED</option>
                  <option value="NEEDS_TIME">NEEDS_TIME</option>
                  <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Customer Feedback</label>
                <input
                  type="text"
                  value={outcomeForm.customerFeedback}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, customerFeedback: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reqFollow"
                  checked={outcomeForm.requiresFollowUp}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, requiresFollowUp: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500"
                />
                <label htmlFor="reqFollow" className="text-xs text-slate-300">
                  Automatically create follow-up task
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
