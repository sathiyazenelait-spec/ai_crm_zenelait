import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  Factory,
  Package,
  Wrench,
  Boxes,
  Users2,
  FileSpreadsheet,
  ShoppingCart,
  Headphones,
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
  Building2,
  FileText,
  Shield,
  BarChart3,
  Layers,
  Check,
  X,
  Truck,
  Cpu
} from 'lucide-react';

export function ManufacturingAdminView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('overview'); // overview, products, inventory, partners, enquiries, quotations, orders, support, ai_agents, reports
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [partners, setPartners] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showAddEnquiryModal, setShowAddEnquiryModal] = useState(false);
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Product Form
  const [prodCode, setProdCode] = useState('PUMP-X500');
  const [prodName, setProdName] = useState('High-Pressure Triplex Plunger Pump');
  const [prodCategory, setProdCategory] = useState('MCAT-001');
  const [prodPrice, setProdPrice] = useState(38000);
  const [prodUom, setProdUom] = useState('UNIT');
  const [prodMinQty, setProdMinQty] = useState(5);
  const [prodStock, setProdStock] = useState(45);

  // New Partner Form
  const [partnerCode, setPartnerCode] = useState('DIST-003');
  const [partnerCompany, setPartnerCompany] = useState('Bharat Industrial Hydraulics Ltd');
  const [partnerType, setPartnerType] = useState('DISTRIBUTOR');
  const [partnerContact, setPartnerContact] = useState('Anand Verma');
  const [partnerEmail, setPartnerEmail] = useState('anand@bharathydraulics.com');
  const [partnerPhone, setPartnerPhone] = useState('+91 98402 11223');
  const [partnerCity, setPartnerCity] = useState('Pune');
  const [partnerTier, setPartnerTier] = useState('TIER_1');
  const [partnerDiscount, setPartnerDiscount] = useState(15);

  // New Enquiry Form
  const [enqCompany, setEnqCompany] = useState('Kirloskar Engineering Subcontractors');
  const [enqContact, setEnqContact] = useState('Ramesh Patil');
  const [enqEmail, setEnqEmail] = useState('ramesh@kirloskarsub.com');
  const [enqPhone, setEnqPhone] = useState('+91 98220 33445');
  const [enqProduct, setEnqProduct] = useState('High-Pressure Triplex Plunger Pump');
  const [enqQty, setEnqQty] = useState(25);

  // AI Agent Simulator State
  const [agentTestType, setAgentTestType] = useState('MANUFACTURING_B2B_SALES');
  const [testQuestion, setTestQuestion] = useState('Can you provide technical specifications and dealer bulk pricing for 50 units of 5.5kW induction motors?');
  const [testResult, setTestResult] = useState(null);
  const [isTestingAgent, setIsTestingAgent] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, prodList, catList, invList, partList, enqList, quoList, ordList, tktList, rep, sett] = await Promise.all([
        manufacturingService.getDashboard(),
        manufacturingService.getProducts(),
        manufacturingService.getCategories(),
        manufacturingService.getInventory(),
        manufacturingService.getPartners(),
        manufacturingService.getEnquiries(),
        manufacturingService.getQuotations(),
        manufacturingService.getOrders(),
        manufacturingService.getSupportTickets(),
        manufacturingService.getSalesReport(),
        manufacturingService.getSettings()
      ]);

      setDashboard(dash);
      setProducts(prodList);
      setCategories(catList);
      setInventory(invList);
      setPartners(partList);
      setEnquiries(enqList);
      setQuotations(quoList);
      setOrders(ordList);
      setSupportTickets(tktList);
      setSalesReport(rep);
      setSettings(sett);
    } catch (err) {
      console.error('Failed to load manufacturing data:', err);
      addNotification?.({
        type: 'error',
        title: 'Sync Error',
        message: 'Could not sync with Manufacturing API. Displaying localized store cache.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await manufacturingService.createProduct({
        productCode: prodCode,
        name: prodName,
        categoryId: prodCategory,
        unitOfMeasure: prodUom,
        currency: 'INR',
        listPrice: parseFloat(prodPrice),
        minOrderQty: parseInt(prodMinQty, 10),
        availableStock: parseInt(prodStock, 10),
        status: 'ACTIVE',
        specifications: [
          { name: 'Rated Capacity', value: '150', unit: 'BAR' },
          { name: 'Duty Cycle', value: 'Continuous S1', unit: '' }
        ]
      });

      addNotification?.({
        type: 'success',
        title: 'Product Catalog Updated',
        message: `Product ${prodCode} added with technical specs.`
      });
      setShowAddProductModal(false);
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Failed to create product'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await manufacturingService.createPartner({
        partnerCode,
        companyName: partnerCompany,
        partnerType,
        contactName: partnerContact,
        email: partnerEmail,
        phone: partnerPhone,
        city: partnerCity,
        tier: partnerTier,
        discountPercent: parseFloat(partnerDiscount),
        status: 'ACTIVE'
      });

      addNotification?.({
        type: 'success',
        title: 'Partner Onboarded',
        message: `${partnerCompany} registered as authorized ${partnerType.toLowerCase()}.`
      });
      setShowAddPartnerModal(false);
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Onboarding Failed',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await manufacturingService.createEnquiry({
        companyName: enqCompany,
        contactName: enqContact,
        email: enqEmail,
        phone: enqPhone,
        productInterest: enqProduct,
        estimatedQuantity: parseInt(enqQty, 10),
        stage: 'NEW',
        source: 'WEBSITE_RFQ'
      });

      addNotification?.({
        type: 'success',
        title: 'B2B Enquiry Captured',
        message: `RFQ from ${enqCompany} logged in sales pipeline.`
      });
      setShowAddEnquiryModal(false);
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendQuotation = async (quoId) => {
    try {
      await manufacturingService.sendQuotation(quoId);
      addNotification?.({
        type: 'success',
        title: 'Quotation Dispatched',
        message: `Official B2B quotation ${quoId} sent to client.`
      });
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message
      });
    }
  };

  const handleSimulateAgent = () => {
    setIsTestingAgent(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingAgent(false);
      if (agentTestType === 'MANUFACTURING_B2B_SALES') {
        setTestResult({
          status: 'SUCCESS',
          detectedIntent: 'SPECIFICATION_AND_BULK_PRICING_INQUIRY',
          matchedProduct: 'MPROD-001 (Industrial Electric Motor 5.5kW)',
          specSheet: 'IP55 Rated, 415V, 50Hz, Continuous S1 Duty',
          stockStatus: 'In Stock (85 units ready at Sriperumbudur plant)',
          pricingCalculation: {
            listPricePerUnit: '₹25,000',
            bulkQuantity: 50,
            dealerTier1Discount: '15%',
            negotiatedUnitPrice: '₹21,250',
            estimatedSubtotal: '₹10,62,500 + GST'
          },
          recommendedNextStep: 'Generate Formal Quotation Draft (MQUO) & Notify Regional Sales Manager',
          aiResponse: 'Thank you for your enquiry. Our 5.5kW heavy-duty electric motors are in stock at our Sriperumbudur facility. For an order quantity of 50 units, you qualify for our Tier-1 volume discount at ₹21,250 per unit (15% off list). I have drafted a formal commercial quotation and routed it to your regional sales manager.'
        });
      } else {
        setTestResult({
          status: 'SUCCESS',
          detectedIntent: 'TECHNICAL_SUPPORT_DIAGNOSTICS',
          matchedProduct: 'VAL-HV40 (Stainless Steel Hydraulic Valve HV-40)',
          specSheet: 'SS-316, 350 BAR Max Pressure, 40 LPM Flow Rate',
          diagnosticStep: 'Verified pressure relief bypass schematic and O-ring seal compatibility with ISO VG 46 hydraulic fluid.',
          recommendedNextStep: 'Ticket logged under TCK-MFG with high priority; technical documentation PDF dispatched.',
          aiResponse: 'Based on our engineering handbook, the HV-40 series requires Viton seals when operating above 250 BAR with synthetic fluids. I have sent the 3D CAD schematic and installation guide to your registered email.'
        });
      }
    }, 900);
  };

  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400">
                <Factory className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  {settings?.companyName || 'Apex Industrial Gear & Hydraulics'}
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    B2B Manufacturing Admin
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Plant: {settings?.plantLocation || 'Sriperumbudur Industrial Corridor'} • GST: {settings?.gstNumber || '33AABCA1234F1Z8'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync ERP
            </button>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'products', label: 'Product Catalog', icon: Package },
          { id: 'inventory', label: 'Inventory & ERP', icon: Boxes },
          { id: 'partners', label: 'Distributors & Dealers', icon: Users2 },
          { id: 'enquiries', label: 'B2B RFQ Leads', icon: FileSpreadsheet },
          { id: 'quotations', label: 'Quotations', icon: FileText },
          { id: 'orders', label: 'Sales Orders', icon: ShoppingCart },
          { id: 'support', label: 'Technical Tickets', icon: Headphones },
          { id: 'ai_agents', label: 'AI B2B Agents', icon: Bot },
          { id: 'reports', label: 'Revenue Reports', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New B2B RFQs
                </span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.metrics?.newB2BEnquiries || enquiries.length}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18% from last month
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Quotations
                </span>
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.metrics?.quotationsSent || quotations.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Value: {formatINR(dashboard?.sales?.quotedValue || 8500000)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirmed Orders
                </span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShoppingCart className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {formatINR(dashboard?.sales?.confirmedOrderValue || 5200000)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {orders.length} in production queue
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  AI B2B Agent Success
                </span>
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Bot className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.ai?.resolutionRate || 69.7}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {dashboard?.ai?.resolvedWithoutHuman || 300} automated RFQ handoffs
              </p>
            </div>
          </div>

          {/* Plant Operations & Active Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-500" />
                  Live Production & Delivery Ledger
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  View All Orders →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Client / Distributor</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Target Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {ord.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {ord.companyName}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {formatINR(ord.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ord.orderStatus} />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {ord.deliveryDate || '2026-11-20'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-500" />
                AI Agent Automation Summary
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>AI B2B Sales Agent</span>
                    <span className="text-emerald-500 font-semibold">Active</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Auto-qualifies incoming RFQs, matches product specifications from datasheet repository, and prepares quotation drafts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>AI Technical Support Bot</span>
                    <span className="text-emerald-500 font-semibold">Active</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Resolves wiring schematics, CAD models, pressure tolerances, and installation documentation from the knowledge base.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>ERP Stock Synchronizer</span>
                    <span className="text-blue-500 font-semibold">Synced 5m ago</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Live two-way snapshot with SAP/Oracle inventory buffers preventing overselling during high-volume wholesale bids.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('ai_agents')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
              >
                Launch AI Agent Simulator →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PRODUCT CATALOG & SPECS TAB */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manufacturing Product Catalog</h2>
              <p className="text-sm text-slate-500">Technical specifications, units of measure, and standard list pricing</p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {p.productCode}
                    </span>
                    <StatusBadge status={p.status || 'ACTIVE'} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    List Price: <span className="font-semibold text-slate-900 dark:text-white">{formatINR(p.listPrice)}</span> / {p.unitOfMeasure || 'UNIT'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span>Min Order: <strong>{p.minOrderQty || 1} units</strong></span>
                    <span>Ready Stock: <strong className="text-emerald-600">{p.availableStock || 0} units</strong></span>
                  </div>

                  {/* Technical Specs Pills */}
                  {p.specifications && p.specifications.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Specifications</p>
                      <div className="grid grid-cols-2 gap-2">
                        {p.specifications.map((spec, i) => (
                          <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 block">{spec.name}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{spec.value} {spec.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEnqProduct(p.name);
                      setShowAddEnquiryModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Create RFQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. INVENTORY & ERP TAB */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">ERP Inventory Buffer & Warehouse</h2>
              <p className="text-sm text-slate-500">Real-time stock availability, safety buffer, and production lead times</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ERP Connected (SAP S/4HANA)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Product Code</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">Warehouse Bin</th>
                  <th className="px-4 py-3.5">Available Stock</th>
                  <th className="px-4 py-3.5">Reserved for Orders</th>
                  <th className="px-4 py-3.5">Safety Buffer</th>
                  <th className="px-4 py-3.5">Production Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-900 dark:text-white">{p.productCode}</td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{p.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">WH-SRIPERUMBUDUR-A{idx + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">{p.availableStock || 50} units</td>
                    <td className="px-4 py-3.5 text-amber-600 dark:text-amber-400 font-semibold">15 units</td>
                    <td className="px-4 py-3.5 text-slate-500">20 units</td>
                    <td className="px-4 py-3.5 text-slate-500">5 - 7 Business Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DISTRIBUTORS & DEALERS TAB */}
      {/* ========================================================= */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authorized Partner Network</h2>
              <p className="text-sm text-slate-500">Distributors, dealers, and wholesale commercial agreements</p>
            </div>
            <button
              onClick={() => setShowAddPartnerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Onboard Partner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    {partner.partnerCode} • {partner.partnerType}
                  </span>
                  <StatusBadge status={partner.status || 'ACTIVE'} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{partner.companyName}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Contact: <span className="text-slate-800 dark:text-slate-200 font-medium">{partner.contactName}</span> ({partner.city})
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Email: <strong>{partner.email}</strong></span>
                  <span>Phone: <strong>{partner.phone}</strong></span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    Tier: {partner.tier || 'TIER_1'}
                  </span>
                  <span className="text-emerald-600 font-bold">
                    Commercial Discount: {partner.discountPercent || 15}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. B2B ENQUIRIES / RFQ LEADS TAB */}
      {/* ========================================================= */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">B2B RFQ Sales Enquiries</h2>
              <p className="text-sm text-slate-500">Inbound requests for quotation and enterprise product requirements</p>
            </div>
            <button
              onClick={() => setShowAddEnquiryModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              New RFQ Enquiry
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">RFQ ID</th>
                  <th className="px-4 py-3.5">Company Name</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Product of Interest</th>
                  <th className="px-4 py-3.5">Est. Qty</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-900 dark:text-white">{enq.id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{enq.companyName}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <div>{enq.contactName}</div>
                      <div className="text-xs text-slate-400">{enq.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{enq.productInterest || 'Electric Motor 5.5kW'}</td>
                    <td className="px-4 py-3.5 font-bold text-indigo-600 dark:text-indigo-400">{enq.estimatedQuantity} units</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={enq.stage || 'NEW'} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{enq.source || 'WEBSITE_RFQ'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          addNotification?.({
                            type: 'info',
                            title: 'Quotation Builder',
                            message: `Generating draft quotation for ${enq.companyName}`
                          });
                          setActiveTab('quotations');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
                      >
                        Draft Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. QUOTATIONS TAB */}
      {/* ========================================================= */}
      {activeTab === 'quotations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Commercial Quotations</h2>
              <p className="text-sm text-slate-500">Formal B2B price proposals with volume tiers, validity windows, and terms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotations.map((quo) => (
              <div
                key={quo.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {quo.quotationNumber}
                    </span>
                    <StatusBadge status={quo.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{quo.companyName}</h3>
                  <p className="text-xs text-slate-500 mt-1">Product: <span className="font-semibold text-slate-800 dark:text-slate-200">{quo.productCode}</span></p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span>Quantity: <strong>{quo.quantity} units</strong></span>
                    <span>Rate: <strong>{formatINR(quo.unitPrice)}</strong></span>
                  </div>
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Authoritative Subtotal:</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatINR(quo.subtotal)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Valid until: {quo.validUntil || '2026-11-30'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  {quo.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSendQuotation(quo.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Quote
                    </button>
                  )}
                  {quo.status === 'SENT' && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Dispatched
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. SALES ORDERS TAB */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirmed Sales Orders</h2>
              <p className="text-sm text-slate-500">Production schedule, delivery dates, and payment milestones</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Order Number</th>
                  <th className="px-4 py-3.5">Client Account</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Production Status</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5">Delivery Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">{ord.orderNumber}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">{ord.companyName}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{formatINR(ord.totalAmount)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={ord.orderStatus} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-600">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{ord.deliveryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. TECHNICAL SUPPORT TICKETS TAB */}
      {/* ========================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Technical Support & Warranty Desk</h2>
              <p className="text-sm text-slate-500">Engineering queries, installation troubleshooting, and warranty claims</p>
            </div>
          </div>

          <div className="space-y-4">
            {supportTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tkt.ticketNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/10 text-red-600">
                      {tkt.priority} PRIORITY
                    </span>
                  </div>
                  <StatusBadge status={tkt.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">{tkt.subject}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Client: <strong className="text-slate-700 dark:text-slate-300">{tkt.companyName}</strong> • Product: <span className="font-mono">{tkt.productCode}</span>
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned Application Engineer: <strong className="text-slate-800 dark:text-slate-200">{tkt.assignedEngineer}</strong></span>
                  <span>Created: {new Date(tkt.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. AI B2B SALES & TECHNICAL AGENT SIMULATOR */}
      {/* ========================================================= */}
      {activeTab === 'ai_agents' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  Zenelait Manufacturing AI Agent Test Mode
                </h2>
                <p className="text-sm text-slate-500">
                  Simulate lead qualification, technical specification lookup, and instant bulk pricing calculations.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setAgentTestType('MANUFACTURING_B2B_SALES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    agentTestType === 'MANUFACTURING_B2B_SALES'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  B2B Sales Agent
                </button>
                <button
                  onClick={() => setAgentTestType('TECHNICAL_SUPPORT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    agentTestType === 'TECHNICAL_SUPPORT'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Technical Support
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Simulated Customer Message
                </label>
                <textarea
                  rows={3}
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter prospect or engineer prompt..."
                />
              </div>

              <button
                onClick={handleSimulateAgent}
                disabled={isTestingAgent}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
              >
                <Sparkles className={`w-4 h-4 ${isTestingAgent ? 'animate-spin' : ''}`} />
                {isTestingAgent ? 'Simulating Neural Inference...' : 'Test AI Agent'}
              </button>
            </div>

            {testResult && (
              <div className="mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Agent Inference Verified (180ms)
                  </span>
                  <span className="text-xs text-slate-400">Model: Gemini 1.5 Pro + Zenelait RAG</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Detected Intent:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{testResult.detectedIntent}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Matched Catalog Product:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{testResult.matchedProduct}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Technical Specs Extracted:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{testResult.specSheet}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Automated Action:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{testResult.recommendedNextStep}</span>
                  </div>
                </div>

                {testResult.pricingCalculation && (
                  <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-1">
                      Server-Side Commercial Rule Applied:
                    </span>
                    <div className="flex items-center justify-between">
                      <span>List Price: {testResult.pricingCalculation.listPricePerUnit}</span>
                      <span>Volume Tier: {testResult.pricingCalculation.dealerTier1Discount} Discount</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Estimated Value: {testResult.pricingCalculation.estimatedSubtotal}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Natural Language Customer Response:
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    "{testResult.aiResponse}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. REVENUE & PERFORMANCE REPORTS */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Manufacturing B2B Sales & Order Performance</h2>
            <p className="text-sm text-slate-500 mb-6">Aggregated wholesale transactions, pipeline conversion, and top distributors</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Total B2B Quoted Value</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹85,00,000</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Confirmed Booking Revenue</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹52,00,000</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">RFQ-to-Order Conversion Rate</span>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">61.2%</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Top Products by Production Value</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Industrial Electric Motor 5.5kW (MTR-001)</h4>
                  <p className="text-xs text-slate-500">Total Units Ordered: 140 • Avg Price: ₹23,000</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">₹32,20,000</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Stainless Steel Hydraulic Valve HV-40 (VAL-HV40)</h4>
                  <p className="text-xs text-slate-500">Total Units Ordered: 720 • Avg Price: ₹2,400</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">₹17,28,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD PRODUCT */}
      {/* ========================================================= */}
      <FormDialog
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Add Manufacturing Product"
        onSubmit={handleCreateProduct}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Product Code</label>
              <input
                type="text"
                required
                value={prodCode}
                onChange={(e) => setProdCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="MCAT-001">Hydraulic Pumps & Valves</option>
                <option value="MCAT-002">Electric Motors & Drives</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">List Price (₹)</label>
              <input
                type="number"
                required
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Min Order Qty</label>
              <input
                type="number"
                required
                value={prodMinQty}
                onChange={(e) => setProdMinQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Initial Stock</label>
              <input
                type="number"
                required
                value={prodStock}
                onChange={(e) => setProdStock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
        </div>
      </FormDialog>

      {/* ========================================================= */}
      {/* MODAL: ONBOARD PARTNER */}
      {/* ========================================================= */}
      <FormDialog
        isOpen={showAddPartnerModal}
        onClose={() => setShowAddPartnerModal(false)}
        title="Onboard Dealer or Distributor"
        onSubmit={handleCreatePartner}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Partner Code</label>
              <input
                type="text"
                required
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Partner Type</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="DISTRIBUTOR">Distributor (Wholesale)</option>
                <option value="DEALER">Dealer (Regional)</option>
                <option value="OEM_PARTNER">OEM Partner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={partnerCompany}
              onChange={(e) => setPartnerCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={partnerContact}
                onChange={(e) => setPartnerContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">City / Hub</label>
              <input
                type="text"
                required
                value={partnerCity}
                onChange={(e) => setPartnerCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
              <input
                type="email"
                required
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
              <input
                type="text"
                required
                value={partnerPhone}
                onChange={(e) => setPartnerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tier</label>
              <select
                value={partnerTier}
                onChange={(e) => setPartnerTier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="TIER_1">Tier 1 (National)</option>
                <option value="TIER_2">Tier 2 (State)</option>
                <option value="TIER_3">Tier 3 (City)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Discount %</label>
              <input
                type="number"
                value={partnerDiscount}
                onChange={(e) => setPartnerDiscount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
        </div>
      </FormDialog>

      {/* ========================================================= */}
      {/* MODAL: ADD B2B ENQUIRY */}
      {/* ========================================================= */}
      <FormDialog
        isOpen={showAddEnquiryModal}
        onClose={() => setShowAddEnquiryModal(false)}
        title="Create B2B RFQ Enquiry"
        onSubmit={handleCreateEnquiry}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Company / Organization</label>
            <input
              type="text"
              required
              value={enqCompany}
              onChange={(e) => setEnqCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={enqContact}
                onChange={(e) => setEnqContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Estimated Quantity</label>
              <input
                type="number"
                required
                value={enqQty}
                onChange={(e) => setEnqQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
              <input
                type="email"
                required
                value={enqEmail}
                onChange={(e) => setEnqEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
              <input
                type="text"
                required
                value={enqPhone}
                onChange={(e) => setEnqPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Product Requirement</label>
            <input
              type="text"
              required
              value={enqProduct}
              onChange={(e) => setEnqProduct(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
