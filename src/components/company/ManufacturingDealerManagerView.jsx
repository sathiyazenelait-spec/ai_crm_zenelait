import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
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
  Layers,
  ShieldAlert,
  Calendar,
  Check,
  X,
  FileCheck,
  Building,
  MapPin,
  Tag,
  BadgePercent,
  FileText,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export function ManufacturingDealerManagerView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('dealers'); // 'dealers' | 'territories' | 'pricing' | 'targets' | 'performance'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [priceRequests, setPriceRequests] = useState([]);
  const [agreements, setAgreements] = useState([]);

  // Modals & forms
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPriceDecisionModal, setShowPriceDecisionModal] = useState(false);
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedPriceReq, setSelectedPriceReq] = useState(null);

  // Forms
  const [dealerForm, setDealerForm] = useState({
    businessName: 'Apex Deccan Industrial Distributors',
    businessType: 'AUTHORIZED_DISTRIBUTOR',
    registrationNumber: 'DEALER-REG-2002',
    name: 'Venkatesh Rao',
    email: 'venkatesh@deccandistributors.com',
    phone: '+91 94440 98765',
    city: 'Hyderabad',
    state: 'Telangana',
    requestedTerritoryId: 'territory_south_01',
    productCategories: ['INDUSTRIAL_PUMP', 'INDUSTRIAL_MOTOR']
  });

  const [priceDecision, setPriceDecision] = useState('REJECT');
  const [priceDecisionReason, setPriceDecisionReason] = useState('Requested discount exceeds authorized channel limit of 6%.');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, dealRes, terrRes, priceRes, agrRes] = await Promise.allSettled([
        manufacturingService.dealerManager.getDashboard(),
        manufacturingService.dealerManager.getDealers(),
        manufacturingService.dealerManager.getTerritories(),
        manufacturingService.dealerManager.getDealerPriceRequests(),
        manufacturingService.dealerManager.getAgreements()
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (dealRes.status === 'fulfilled') setDealers(dealRes.value || []);
      if (terrRes.status === 'fulfilled') setTerritories(terrRes.value || []);
      if (priceRes.status === 'fulfilled') setPriceRequests(priceRes.value || []);
      if (agrRes.status === 'fulfilled') setAgreements(agrRes.value || []);
    } catch (err) {
      console.error('Error loading dealer manager data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterDealer = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.dealerManager.registerDealer({
        businessName: dealerForm.businessName,
        businessType: dealerForm.businessType,
        registrationNumber: dealerForm.registrationNumber,
        primaryContact: {
          name: dealerForm.name,
          email: dealerForm.email,
          phone: dealerForm.phone
        },
        address: {
          city: dealerForm.city,
          state: dealerForm.state,
          country: 'IN',
          postalCode: '500001'
        },
        requestedTerritoryId: dealerForm.requestedTerritoryId,
        productCategories: dealerForm.productCategories
      });
      addNotification('success', 'Dealer Registered', `Dealer #${res?.dealerId} onboarding initiated.`);
      setShowRegisterModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Registration Failed', err.message);
    }
  };

  const handleVerifyDecision = async (decision) => {
    if (!selectedDealer) return;
    try {
      await manufacturingService.dealerManager.decideVerification(selectedDealer.dealerId, {
        decision,
        comment: 'Compliance verification completed against company distributor policy.'
      });
      addNotification('success', 'Verification Updated', `Dealer marked as ${decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED'}.`);
      setShowVerifyModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Action Failed', err.message);
    }
  };

  const handleActivateDealer = async (dealerId) => {
    try {
      await manufacturingService.dealerManager.activateDealer(dealerId);
      addNotification('success', 'Dealer Activated', `Dealer authorized for commercial order processing.`);
      loadData();
    } catch (err) {
      addNotification('error', 'Cannot Activate', err.message || 'Dealer must be VERIFIED first.');
    }
  };

  const handlePriceDecision = async () => {
    if (!selectedPriceReq) return;
    try {
      await manufacturingService.dealerManager.decideDealerPriceRequest(selectedPriceReq.requestId, {
        decision: priceDecision,
        reason: priceDecisionReason
      });
      addNotification('success', 'Pricing Decision Recorded', `Decision [${priceDecision}] submitted.`);
      setShowPriceDecisionModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Decision Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Building className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Dealer Manager</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Distributor Onboarding, Territory Governance, Channel Pricing & Quota Review</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            Onboard Dealer
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">Authorized Dealers</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboard?.totalAuthorizedDealers || 28}</div>
          <p className="text-xs text-emerald-600 mt-1">24 Active Distributors</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">Verification Queue</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">{dealers.filter(d => d.status === 'PENDING_VERIFICATION').length}</div>
          <p className="text-xs text-slate-400 mt-1">Requires document review</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">Channel Revenue (Q4)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹1,42,00,000</div>
          <p className="text-xs text-emerald-600 mt-1">+16.5% vs target pacing</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-500">Price Requests</div>
          <div className="text-2xl font-bold text-rose-500 mt-1">{priceRequests.length}</div>
          <p className="text-xs text-slate-400 mt-1">Pending channel discount</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'dealers', label: `Dealer Network (${dealers.length})`, icon: Building },
          { id: 'territories', label: 'Territories & Distribution', icon: MapPin },
          { id: 'pricing', label: `Pricing Requests (${priceRequests.length})`, icon: BadgePercent },
          { id: 'agreements', label: 'Agreements & Contracts', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. DEALER NETWORK TABLE */}
      {activeTab === 'dealers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authorized Dealers & Distributors</h3>
            <p className="text-xs text-slate-500">Enforce KYC verification and territory policy prior to activation</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Dealer Name & Reg No</th>
                  <th className="px-6 py-4">Primary Contact</th>
                  <th className="px-6 py-4">Territory</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4">Dealer Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {dealers.map((d) => (
                  <tr key={d.dealerId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{d.businessName}</div>
                      <div className="text-xs text-slate-400 font-mono">{d.registrationNumber || d.dealerId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{d.primaryContact?.name || 'Contact Person'}</div>
                      <div className="text-xs text-slate-400">{d.primaryContact?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {d.requestedTerritoryId || 'territory_south_01'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        d.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        d.verificationStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {d.verificationStatus || 'NOT_SUBMITTED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        d.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        d.status === 'PENDING_ACTIVATION' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {d.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => {
                            setSelectedDealer(d);
                            setShowVerifyModal(true);
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg"
                        >
                          Verify Docs
                        </button>
                      )}
                      {d.verificationStatus === 'VERIFIED' && d.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleActivateDealer(d.dealerId)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                        >
                          Activate Dealer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PRICING REQUESTS */}
      {activeTab === 'pricing' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dealer-Specific Pricing Requests</h3>
            <p className="text-xs text-slate-500">Authorizations and volume discounts for registered distributor tiers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Dealer & Product</th>
                  <th className="px-6 py-4">Requested Discount</th>
                  <th className="px-6 py-4">Reason / Effective Dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {priceRequests.map((pr) => (
                  <tr key={pr.requestId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-xs">{pr.requestId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{pr.dealerId}</div>
                      <div className="text-xs text-slate-400 font-mono">{pr.productId}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600 font-mono text-sm">{pr.requestedDiscountPercent}%</td>
                    <td className="px-6 py-4 text-xs">
                      <div>{pr.reason}</div>
                      <div className="text-slate-400">{pr.effectiveFrom} to {pr.effectiveUntil}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        pr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        pr.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pr.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => {
                            setSelectedPriceReq(pr);
                            setShowPriceDecisionModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                        >
                          Decide
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TERRITORIES */}
      {activeTab === 'territories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {territories.map((t) => (
            <div key={t.territoryId} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <div className="text-xs text-slate-400 font-mono">ID: {t.territoryId}</div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Covered States: {Array.isArray(t.states) ? t.states.join(', ') : 'South Zone'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. AGREEMENTS */}
      {activeTab === 'agreements' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dealer Commercial Agreements</h3>
          <p className="text-xs text-slate-400 mb-4">Master distributor contracts with legal terms, credit policy, and annual volume rebates.</p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            No pending agreement renewals for active quarter.
          </div>
        </div>
      )}

      {/* ONBOARD DEALER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Onboard New Authorized Dealer</h3>
            <form onSubmit={handleRegisterDealer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Business Name</label>
                <input
                  type="text"
                  required
                  value={dealerForm.businessName}
                  onChange={(e) => setDealerForm({ ...dealerForm, businessName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Reg. Certificate #</label>
                  <input
                    type="text"
                    required
                    value={dealerForm.registrationNumber}
                    onChange={(e) => setDealerForm({ ...dealerForm, registrationNumber: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={dealerForm.name}
                    onChange={(e) => setDealerForm({ ...dealerForm, name: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    required
                    value={dealerForm.email}
                    onChange={(e) => setDealerForm({ ...dealerForm, email: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    required
                    value={dealerForm.phone}
                    onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700">
                  Submit Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Verification Decision</h3>
            <p className="text-xs text-slate-400">Target Dealer: {selectedDealer?.businessName}</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div>Registration No: <strong>{selectedDealer?.registrationNumber}</strong></div>
              <div>Documents: GST Certificate, Dealer Partnership Deed</div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowVerifyModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={() => handleVerifyDecision('REJECT')} className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white">
                Reject Verification
              </button>
              <button onClick={() => handleVerifyDecision('APPROVE')} className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                Approve (Verify)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRICING DECISION MODAL */}
      {showPriceDecisionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dealer Price Request Decision</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Decision</label>
                <select
                  value={priceDecision}
                  onChange={(e) => setPriceDecision(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="REJECT">Reject Request</option>
                  <option value="APPROVE">Approve Request</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Decision Notes</label>
                <textarea
                  rows="2"
                  value={priceDecisionReason}
                  onChange={(e) => setPriceDecisionReason(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowPriceDecisionModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handlePriceDecision} className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700">
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
