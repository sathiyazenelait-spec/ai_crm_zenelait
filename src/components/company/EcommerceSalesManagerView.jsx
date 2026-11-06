import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, DollarSign, Target, Bot, Users, FileText,
  Percent, ArrowUpRight, CheckCircle2, Clock, PauseCircle, PlayCircle,
  AlertCircle, Send, RefreshCw, ChevronRight, BarChart3, Plus, ShieldCheck
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';

export default function EcommerceSalesManagerView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    totalRevenue: 1250000.0,
    totalOrders: 850,
    averageOrderValue: 1470.59,
    conversionRate: 3.8,
    abandonedCarts: 320,
    recoveredCarts: 85,
    recoveredRevenue: 112500.0,
    activeCampaigns: 4,
    pendingCampaignApprovals: 2,
    pendingSalesFollowUps: 35
  });

  const [performance, setPerformance] = useState(null);
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [aiConfig, setAiConfig] = useState(null);
  const [aiActivity, setAiActivity] = useState([]);
  const [team, setTeam] = useState([]);
  const [toast, setToast] = useState('');

  // Modals / forms
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    campaignType: 'DISCOUNT',
    channel: 'EMAIL',
    audienceSegmentId: 'segment_electronics_customers',
    budget: 25000
  });

  const [selectedCart, setSelectedCart] = useState(null);
  const [recoveryDraft, setRecoveryDraft] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, perfRes, prodRes, campRes, cartsRes, fuRes, aiRes, actRes, teamRes] = await Promise.allSettled([
        ecommerceService.salesManager.getDashboard(),
        ecommerceService.salesManager.getPerformance({ from: '2026-10-01', to: '2026-10-28' }),
        ecommerceService.salesManager.getProductPerformance({ from: '2026-10-01', to: '2026-10-28', page: 0, size: 10 }),
        ecommerceService.salesManager.getCampaigns({ page: 0, size: 20 }),
        ecommerceService.salesManager.getAbandonedCarts({ minAgeMinutes: 60, page: 0, size: 20 }),
        ecommerceService.salesManager.getSalesFollowUps({ page: 0, size: 20 }),
        ecommerceService.salesManager.getAiSalesConfig(),
        ecommerceService.salesManager.getAiSalesActivity(),
        ecommerceService.salesManager.getTeamPerformance()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (perfRes.status === 'fulfilled' && perfRes.value?.data?.data) {
        setPerformance(perfRes.value.data.data);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.data?.data?.content) {
        setProducts(prodRes.value.data.data.content);
      }
      if (campRes.status === 'fulfilled' && campRes.value?.data?.data?.content) {
        setCampaigns(campRes.value.data.data.content);
      }
      if (cartsRes.status === 'fulfilled' && cartsRes.value?.data?.data?.content) {
        setAbandonedCarts(cartsRes.value.data.data.content);
      }
      if (fuRes.status === 'fulfilled' && fuRes.value?.data?.data?.content) {
        setFollowUps(fuRes.value.data.data.content);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value?.data?.data) {
        setAiConfig(aiRes.value.data.data);
      }
      if (actRes.status === 'fulfilled' && actRes.value?.data?.data?.content) {
        setAiActivity(actRes.value.data.data.content);
      }
      if (teamRes.status === 'fulfilled' && teamRes.value?.data?.data?.teamMembers) {
        setTeam(teamRes.value.data.data.teamMembers);
      }
    } catch (e) {
      console.error('Error loading sales data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const res = await ecommerceService.salesManager.createCampaign(newCampaign);
      if (res.data?.success) {
        showToast('Campaign draft created successfully');
        setShowCampaignModal(false);
        setNewCampaign({ name: '', campaignType: 'DISCOUNT', channel: 'EMAIL', audienceSegmentId: 'segment_electronics_customers', budget: 25000 });
        loadData();
      }
    } catch (err) {
      showToast('Error creating campaign');
    }
  };

  const handleSubmitApproval = async (campId) => {
    try {
      const res = await ecommerceService.salesManager.submitCampaignApproval(campId, { comment: 'Ready for promotion review' });
      if (res.data?.success) {
        showToast('Campaign submitted for approval');
        loadData();
      }
    } catch (err) {
      showToast('Failed to submit approval');
    }
  };

  const handleActivateCampaign = async (campId) => {
    try {
      const res = await ecommerceService.salesManager.activateCampaign(campId, { scheduleExecution: true });
      if (res.data?.success) {
        showToast('Campaign activated and scheduled');
        loadData();
      }
    } catch (err) {
      showToast('Failed to activate campaign');
    }
  };

  const handleGenerateRecovery = async (cartId) => {
    try {
      const res = await ecommerceService.salesManager.createRecoveryDraft(cartId, { channel: 'EMAIL', tone: 'FRIENDLY' });
      if (res.data?.success) {
        setRecoveryDraft(res.data.data);
        showToast('AI Recovery draft generated for cart ' + cartId);
      }
    } catch (err) {
      showToast('Failed to generate draft');
    }
  };

  const handleApproveRecovery = async (draftId) => {
    try {
      const res = await ecommerceService.salesManager.approveRecoveryDraft(draftId, { decision: 'APPROVE', reviewComment: 'Approved by Sales Manager' });
      if (res.data?.success) {
        showToast('Recovery draft approved');
        if (recoveryDraft) {
          setRecoveryDraft({ ...recoveryDraft, status: 'APPROVED' });
        }
      }
    } catch (err) {
      showToast('Error approving draft');
    }
  };

  const handleSendRecovery = async (draftId) => {
    try {
      const res = await ecommerceService.salesManager.sendRecoveryDraft(draftId, { 'Idempotency-Key': 'recovery-' + draftId });
      if (res.data?.success) {
        showToast('Recovery message queued for delivery');
        if (recoveryDraft) {
          setRecoveryDraft({ ...recoveryDraft, status: 'QUEUED' });
        }
      }
    } catch (err) {
      showToast('Error queuing recovery email');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">E-Commerce Sales Manager</h1>
                <p className="text-sm text-emerald-300/80">Revenue Performance, AI Recovery Automation & Multi-Channel Campaigns</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg transition-all duration-200 border border-emerald-400/30 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl border border-slate-700/60 transition"
              title="Refresh Sales Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-emerald-500/20 pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'performance', label: 'Sales Metrics', icon: DollarSign },
            { id: 'products', label: 'Top Products', icon: ShoppingCart },
            { id: 'campaigns', label: 'Campaigns & Offers', icon: Target },
            { id: 'abandoned', label: 'Abandoned Carts', icon: Clock },
            { id: 'ai-sales', label: 'AI Sales Agent', icon: Bot },
            { id: 'team', label: 'Team Performance', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Net Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                ₹{Number(dashboard.totalRevenue || 1250000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+14.8% vs last month</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Orders</span>
                <ShoppingCart className="w-4 h-4 text-teal-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{dashboard.totalOrders || 850}</div>
              <div className="mt-2 text-xs text-slate-400">Avg Order Value: ₹{dashboard.averageOrderValue || '1,470.59'}</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Abandoned Carts</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{dashboard.abandonedCarts || 320}</div>
              <div className="mt-2 text-xs text-amber-400 font-medium">
                Recovered: {dashboard.recoveredCarts || 85} (₹{Number(dashboard.recoveredRevenue || 112500).toLocaleString('en-IN')})
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active Campaigns</span>
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{dashboard.activeCampaigns || 4}</div>
              <div className="mt-2 text-xs text-purple-400 font-medium">
                {dashboard.pendingCampaignApprovals || 2} Pending Approval
              </div>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
                <span>Top Performing Products</span>
                <button onClick={() => setActiveTab('products')} className="text-xs text-emerald-400 hover:underline">View All</button>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-medium uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Units Sold</th>
                      <th className="py-3 px-4">Net Sales</th>
                      <th className="py-3 px-4">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {products.length === 0 ? (
                      <tr><td colSpan="4" className="py-4 text-center text-slate-500">Loading products...</td></tr>
                    ) : (
                      products.map(p => (
                        <tr key={p.productId} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-medium text-white">{p.productName}</td>
                          <td className="py-3 px-4">{p.unitsSold}</td>
                          <td className="py-3 px-4 text-emerald-400 font-semibold">₹{Number(p.netSales).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">{p.conversionRate}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">AI Sales Quick Actions</h2>
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">Cart Recovery Engine</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Automatic lead follow-ups and abandoned cart recovery drafts.</p>
                </div>

                <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">Discount Safeguard</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">HUMAN APPROVAL</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">AI agent cannot fabricate or apply unapproved promotional discounts.</p>
                </div>

                <button
                  onClick={() => setActiveTab('abandoned')}
                  className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
                >
                  Review Abandoned Carts ({dashboard.abandonedCarts || 320})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Period Performance Breakdown (Oct 01 - Oct 28)</h2>
            <button
              onClick={() => ecommerceService.salesManager.exportReport({ reportType: 'SALES_PERFORMANCE', format: 'CSV' }).then(() => showToast('Export queued'))}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-xs">Gross Sales</span>
              <p className="text-xl font-bold text-white mt-1">₹1,250,000.00</p>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-xs">Discount Deductions</span>
              <p className="text-xl font-bold text-amber-400 mt-1">-₹85,000.00</p>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-xs">Refund Deductions</span>
              <p className="text-xl font-bold text-red-400 mt-1">-₹25,000.00</p>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-xs">Audited Net Sales</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">₹1,140,000.00</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-4 bg-slate-800/30 rounded-xl">
              <span className="text-slate-400">New Customers</span>
              <p className="text-lg font-bold text-white mt-1">210</p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-xl">
              <span className="text-slate-400">Repeat Customers</span>
              <p className="text-lg font-bold text-white mt-1">145</p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-xl">
              <span className="text-slate-400">Storefront Conversion</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">3.8%</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOP PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Product Sales & Conversion Analytics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-medium uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Product Title</th>
                  <th className="py-3 px-4">Units Sold</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">Refund Amount</th>
                  <th className="py-3 px-4">Net Sales</th>
                  <th className="py-3 px-4">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {products.map(p => (
                  <tr key={p.productId} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-slate-400">{p.productId}</td>
                    <td className="py-3 px-4 font-semibold text-white">{p.productName}</td>
                    <td className="py-3 px-4">{p.unitsSold}</td>
                    <td className="py-3 px-4">₹{Number(p.grossSales).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-red-400">₹{Number(p.refundAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">₹{Number(p.netSales).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">{p.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPAIGNS & OFFERS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Promotional Campaigns</h2>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Campaign Draft</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(camp => (
              <div key={camp.campaignId} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">{camp.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    camp.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : camp.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Type: <span className="text-slate-200">{camp.campaignType}</span> | Channel: <span className="text-slate-200">{camp.channel}</span></div>
                  <div>Audience: <span className="font-mono text-slate-300">{camp.audienceSegmentId}</span></div>
                  <div>Budget: <span className="text-emerald-400 font-semibold">₹{Number(camp.budget || 25000).toLocaleString('en-IN')}</span></div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  {camp.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmitApproval(camp.campaignId)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-lg font-medium"
                    >
                      Submit for Approval
                    </button>
                  )}
                  {camp.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleActivateCampaign(camp.campaignId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg font-medium flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Approve & Activate</span>
                    </button>
                  )}
                  {camp.status === 'ACTIVE' && (
                    <button
                      onClick={() => ecommerceService.salesManager.pauseCampaign(camp.campaignId).then(() => { showToast('Campaign paused'); loadData(); })}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Pause Campaign</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ABANDONED CARTS */}
      {activeTab === 'abandoned' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-2">Eligible Abandoned Carts</h2>
            <p className="text-xs text-slate-400 mb-4">Carts idle for &gt;60 mins, consent verified, within recovery attempt limits.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 font-medium uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Cart ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Cart Value</th>
                    <th className="py-3 px-4">Abandoned At</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {abandonedCarts.map(cart => (
                    <tr key={cart.cartId} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono text-slate-300">{cart.cartId}</td>
                      <td className="py-3 px-4">{cart.customerReference}</td>
                      <td className="py-3 px-4">{cart.itemCount} items</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">₹{Number(cart.cartValue).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-slate-400">{cart.abandonedAt}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleGenerateRecovery(cart.cartId)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium"
                        >
                          Generate AI Draft
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recovery Draft Review Card */}
          {recoveryDraft && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>AI Recovery Draft Review (Draft ID: {recoveryDraft.draftId})</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {recoveryDraft.status}
                </span>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-200 space-y-2">
                <div><span className="text-slate-400">Subject:</span> {recoveryDraft.subject}</div>
                <div><span className="text-slate-400">Content:</span> {recoveryDraft.content}</div>
              </div>

              <div className="flex items-center gap-3">
                {recoveryDraft.status === 'AWAITING_REVIEW' && (
                  <button
                    onClick={() => handleApproveRecovery(recoveryDraft.draftId)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Approve Recovery Draft
                  </button>
                )}
                {recoveryDraft.status === 'APPROVED' && (
                  <button
                    onClick={() => handleSendRecovery(recoveryDraft.draftId)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Queue for Delivery</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AI SALES AGENT */}
      {activeTab === 'ai-sales' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">AI Sales Agent Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2">
                <span className="text-slate-400 font-semibold">Agent Status</span>
                <p className="text-emerald-400 font-bold">{aiConfig?.status || 'ACTIVE'}</p>
                <p className="text-slate-400">Lead qualification and cart discovery active.</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2">
                <span className="text-slate-400 font-semibold">Approval Guardrails</span>
                <p className="text-amber-400 font-bold">MANDATORY HUMAN APPROVAL</p>
                <p className="text-slate-400">Promotions and recovery discounts require Sales Manager review before queuing.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Recent AI Agent Activity</h2>
            <div className="space-y-2">
              {aiActivity.map((evt, idx) => (
                <div key={idx} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-medium">{evt.eventType}</span>
                    <span className="text-slate-400 ml-2">({evt.cartId || evt.resourceId})</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">{evt.outcome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TEAM PERFORMANCE */}
      {activeTab === 'team' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Sales Team Productivity & Conversion</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-medium uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Campaigns Managed</th>
                  <th className="py-3 px-4">Revenue Influenced</th>
                  <th className="py-3 px-4">Leads Converted</th>
                  <th className="py-3 px-4">Follow-ups Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {team.map(m => (
                  <tr key={m.memberId} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">{m.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{m.role}</td>
                    <td className="py-3 px-4">{m.campaignsManaged}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">₹{Number(m.revenueInfluenced).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">{m.leadsConverted}</td>
                    <td className="py-3 px-4">{m.followUpsCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CAMPAIGN */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Sales Campaign Draft</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Electronics Mega Sale"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type</label>
                  <select
                    value={newCampaign.campaignType}
                    onChange={(e) => setNewCampaign({ ...newCampaign, campaignType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="DISCOUNT">Percentage Discount</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                    <option value="BUNDLE">Product Bundle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Channel</label>
                  <select
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="EMAIL">Email Marketing</option>
                    <option value="SMS">SMS Notification</option>
                    <option value="WEBSITE_CHAT">Web Chat Bot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Audience Segment ID</label>
                <input
                  type="text"
                  value={newCampaign.audienceSegmentId}
                  onChange={(e) => setNewCampaign({ ...newCampaign, audienceSegmentId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Budget Allocation (INR)</label>
                <input
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
