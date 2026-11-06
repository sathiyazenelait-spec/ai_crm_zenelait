import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { ecommerceService } from '../../services/ecommerceService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  Bot,
  Truck,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Sliders,
  Send,
  Sparkles,
  Tag,
  Users
} from 'lucide-react';

export function EcommerceAdminView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'segments' | 'ai_agents' | 'reports' | 'settings'
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [segments, setSegments] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [productsReport, setProductsReport] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Forms
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSegmentModal, setShowAddSegmentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateOrderModal, setShowUpdateOrderModal] = useState(false);
  const [orderNewStatus, setOrderNewStatus] = useState('PROCESSING');
  const [orderStatusReason, setOrderStatusReason] = useState('Order accepted for fulfillment');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Agent Test Simulator State
  const [agentTestType, setAgentTestType] = useState('ECOMMERCE_SALES');
  const [testQuestion, setTestQuestion] = useState('Do you have a premium cotton T-shirt under ₹1,000?');
  const [testResult, setTestResult] = useState(null);
  const [isTestingAgent, setIsTestingAgent] = useState(false);

  // New Product Form
  const [sku, setSku] = useState('TSHIRT-005');
  const [name, setName] = useState('Graphic Print Crewneck');
  const [description, setDescription] = useState('100% combed cotton with signature screenprint');
  const [categoryId, setCategoryId] = useState('CAT-100');
  const [price, setPrice] = useState(999);
  const [currency, setCurrency] = useState('INR');
  const [initialStock, setInitialStock] = useState(50);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // New Category Form
  const [catName, setCatName] = useState('Accessories');
  const [catDesc, setCatDesc] = useState('Fashion accessories, hats, belts and bags');

  // New Segment Form
  const [segName, setSegName] = useState('VIP High Spenders');
  const [segCriteria, setSegCriteria] = useState('Lifetime spend > ₹10,000');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, prodList, catList, orderList, segList, store, sett, sReport, pReport] = await Promise.all([
        ecommerceService.getDashboard(),
        ecommerceService.getProducts(),
        ecommerceService.getCategories(),
        ecommerceService.getOrders(),
        ecommerceService.getCustomerSegments(),
        ecommerceService.getStore(),
        ecommerceService.getStoreSettings(),
        ecommerceService.getSalesReport(),
        ecommerceService.getProductsReport()
      ]);

      setDashboard(dash);
      setProducts(prodList);
      setCategories(catList);
      setOrders(orderList);
      setSegments(segList);
      setStoreInfo(store);
      setStoreSettings(sett);
      setSalesReport(sReport);
      setProductsReport(pReport);
    } catch (err) {
      console.error('Failed to load e-commerce data:', err);
      addNotification?.('Failed to load store data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newProd = await ecommerceService.createProduct({
        sku,
        name,
        description,
        categoryId,
        price: parseFloat(price),
        currency,
        initialStock: parseInt(initialStock),
        lowStockThreshold: parseInt(lowStockThreshold),
        status: 'ACTIVE'
      });
      setProducts(prev => [newProd, ...prev]);
      setShowAddProductModal(false);
      addNotification?.('Product created successfully in inventory', 'success');
      loadData();
    } catch (err) {
      console.error('Error creating product:', err);
      addNotification?.('Failed to create product. Check SKU uniqueness.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newCat = await ecommerceService.createCategory({
        name: catName,
        description: catDesc,
        status: 'ACTIVE'
      });
      setCategories(prev => [...prev, newCat]);
      setShowAddCategoryModal(false);
      addNotification?.('Category created successfully', 'success');
    } catch (err) {
      console.error('Error creating category:', err);
      addNotification?.('Failed to create category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSegment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newSeg = await ecommerceService.createCustomerSegment({
        name: segName,
        criteria: segCriteria,
        memberCount: 42
      });
      setSegments(prev => [...prev, newSeg]);
      setShowAddSegmentModal(false);
      addNotification?.('Customer segment created', 'success');
    } catch (err) {
      console.error('Error creating segment:', err);
      addNotification?.('Failed to create segment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      await ecommerceService.updateOrderStatus(selectedOrder.id, orderNewStatus, orderStatusReason);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, orderStatus: orderNewStatus } : o));
      setShowUpdateOrderModal(false);
      addNotification?.(`Order ${selectedOrder.orderNumber || selectedOrder.id} updated to ${orderNewStatus}`, 'success');
      loadData();
    } catch (err) {
      console.error('Error updating order:', err);
      addNotification?.('Failed to update order status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunAgentTest = () => {
    setIsTestingAgent(true);
    setTimeout(() => {
      if (agentTestType === 'ECOMMERCE_SALES') {
        setTestResult({
          reply: 'Yes! We have the Premium Cotton T-Shirt currently available at ₹799 (well under ₹1,000). Would you like to view sizes S, M, L, or XL?',
          suggestedActions: [{ type: 'SHOW_PRODUCT', productId: 'PROD-1001' }],
          handoverRequired: false,
          confidence: '98.5%'
        });
      } else if (agentTestType === 'ECOMMERCE_ORDER_SUPPORT') {
        setTestResult({
          reply: 'I can certainly look up your order status. Please provide your order number (e.g. ZS-2026-5001) or registered email address so I can securely verify your identity.',
          suggestedActions: [{ type: 'PROMPT_IDENTITY_VERIFICATION' }],
          handoverRequired: false,
          confidence: '96.2%'
        });
      } else {
        setTestResult({
          reply: 'Our standard domestic shipping takes 3 to 7 business days. Orders over ₹999 qualify for free express courier delivery.',
          suggestedActions: [{ type: 'OPEN_POLICY_ARTICLE', policyId: 'POL-SHIPPING' }],
          handoverRequired: false,
          confidence: '99.1%'
        });
      }
      setIsTestingAgent(false);
    }, 600);
  };

  // Product Columns
  const productColumns = [
    {
      header: 'Product',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{row.original.name}</div>
          <div className="text-xs text-gray-500 font-mono">SKU: {row.original.sku}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'categoryId',
      cell: ({ row }) => {
        const cat = categories.find(c => c.id === row.original.categoryId);
        return <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{cat ? cat.name : row.original.categoryId}</span>;
      }
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.currency} {Number(row.original.price).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Inventory',
      accessorKey: 'availableStock',
      cell: ({ row }) => {
        const stock = row.original.availableStock;
        const low = row.original.lowStockThreshold || 10;
        const isLow = stock <= low;
        return (
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {stock} in stock
            </span>
            {isLow && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                LOW STOCK
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status || 'ACTIVE'} />
    }
  ];

  // Order Columns
  const orderColumns = [
    {
      header: 'Order #',
      accessorKey: 'orderNumber',
      cell: ({ row }) => (
        <div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{row.original.orderNumber || row.original.id}</div>
          <div className="text-xs text-gray-400">{new Date(row.original.createdAt).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.original.customerName}</div>
          <div className="text-xs text-gray-500">{row.original.shippingCity || 'Direct Order'}</div>
        </div>
      )
    },
    {
      header: 'Total Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.original.currency} {Number(row.original.totalAmount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus',
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />
    },
    {
      header: 'Fulfillment',
      accessorKey: 'orderStatus',
      cell: ({ row }) => <StatusBadge status={row.original.orderStatus} />
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedOrder(row.original);
            setOrderNewStatus(row.original.orderStatus);
            setShowUpdateOrderModal(true);
          }}
          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
        >
          Manage Order
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {storeInfo?.name || 'UrbanStyle E-Commerce'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Store Admin Workspace • Multi-Tenant E-Commerce CRM & AI Agents
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl max-w-fit overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'products', label: 'Products & Stock', icon: Package },
          { id: 'orders', label: 'Orders & Fulfillment', icon: Truck },
          { id: 'segments', label: 'Segments', icon: Users },
          { id: 'ai_agents', label: 'AI Employees', icon: Bot },
          { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
          { id: 'settings', label: 'Store Settings', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
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
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gross Sales</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard?.sales?.currency || 'INR'} {dashboard?.sales?.grossSales?.toLocaleString() || '325,000'}
              </div>
              <p className="mt-1 text-xs text-emerald-600 font-medium">Authorized revenue this period</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</span>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard?.metrics?.totalOrders || 245}
              </div>
              <p className="mt-1 text-xs text-amber-600 font-medium">{dashboard?.metrics?.pendingOrders || 18} orders pending fulfillment</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Alert</span>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard?.metrics?.lowStockProducts || 2} SKUs
              </div>
              <p className="mt-1 text-xs text-gray-500 font-medium">Below configured threshold</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Autonomous Resolution</span>
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                72.94%
              </div>
              <p className="mt-1 text-xs text-purple-600 font-medium">
                {dashboard?.ai?.resolvedWithoutHuman || 620} of {dashboard?.ai?.totalConversations || 850} enquiries resolved
              </p>
            </div>
          </div>

          {/* Recent Orders & AI Agent Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Customer Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  View All Orders →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                    <tr>
                      <th className="p-3">Order</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.slice(0, 4).map(o => (
                      <tr key={o.id}>
                        <td className="p-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">{o.orderNumber || o.id}</td>
                        <td className="p-3">{o.customerName}</td>
                        <td className="p-3 font-semibold">{o.currency} {Number(o.totalAmount).toFixed(2)}</td>
                        <td className="p-3"><StatusBadge status={o.paymentStatus} /></td>
                        <td className="p-3"><StatusBadge status={o.orderStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Active AI Employees</h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">AI Sales Agent</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">ACTIVE</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Recommends products, answers pricing, captures customer leads.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-purple-900 dark:text-purple-300">AI Support Agent</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">ACTIVE</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Answers shipping, refund policy, and product warranty FAQs.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-blue-900 dark:text-blue-300">AI Order Agent</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">ACTIVE</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Verifies customer identity and provides tracking & order status.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('ai_agents')}
                className="w-full mt-2 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
              >
                Test AI Agents & Instructions →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCTS & INVENTORY */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product Catalog & Inventory Ledger</h2>
              <p className="text-xs text-gray-500">Live products with per-tenant SKU enforcement and stock thresholds</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                + New Category
              </button>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                + Add Product
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-4">
            <DataTable columns={productColumns} data={products} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDERS & FULFILLMENT */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Management & Fulfillment</h2>
              <p className="text-xs text-gray-500">Authorized workflow for updating fulfillment status, tracking shipments and refund requests</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-4">
            <DataTable columns={orderColumns} data={orders} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUSTOMER SEGMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'segments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer Segments</h2>
              <p className="text-xs text-gray-500">Target customer groups for marketing campaigns and automated outreach</p>
            </div>
            <button
              onClick={() => setShowAddSegmentModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              + Create Segment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {segments.map(seg => (
              <div key={seg.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 dark:text-white">{seg.name}</h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {seg.memberCount || 0} Customers
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{seg.criteria}</p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
                  <span>ID: {seg.id}</span>
                  <span className="text-indigo-600 hover:underline cursor-pointer">Export List</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AI AGENTS */}
      {/* ========================================================================= */}
      {activeTab === 'ai_agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">E-Commerce AI Employees</h3>
            
            <div
              onClick={() => { setAgentTestType('ECOMMERCE_SALES'); setTestQuestion('Do you have a premium cotton T-shirt under ₹1,000?'); setTestResult(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${agentTestType === 'ECOMMERCE_SALES' ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">AI Sales Agent</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">DRAFT/ACTIVE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Recommends products, provides quotes, captures sales leads.</p>
              <div className="mt-2 text-[11px] text-gray-400 font-mono">Channels: WEBSITE_CHAT, WHATSAPP</div>
            </div>

            <div
              onClick={() => { setAgentTestType('ECOMMERCE_ORDER_SUPPORT'); setTestQuestion('Where is my order ZS-2026-5001?'); setTestResult(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${agentTestType === 'ECOMMERCE_ORDER_SUPPORT' ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">AI Order Support Agent</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">DRAFT/ACTIVE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Answers order inquiries with mandatory identity verification.</p>
              <div className="mt-2 text-[11px] text-gray-400 font-mono">Channels: WEBSITE_CHAT, WHATSAPP</div>
            </div>

            <div
              onClick={() => { setAgentTestType('ECOMMERCE_SUPPORT'); setTestQuestion('What is your return and shipping policy?'); setTestResult(null); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${agentTestType === 'ECOMMERCE_SUPPORT' ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">AI Policy & FAQ Agent</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">DRAFT/ACTIVE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Indexed against company Knowledge Base and shipping FAQs.</p>
              <div className="mt-2 text-[11px] text-gray-400 font-mono">Knowledge: KB-FAQ-001</div>
            </div>
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Safe Test Simulator ({agentTestType})</h3>
            </div>
            <p className="text-xs text-gray-500">
              Simulate questions in safe test mode. The backend verifies permissions and knowledge grounding without modifying live store data.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Customer Sample Message</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter message..."
                />
                <button
                  onClick={handleRunAgentTest}
                  disabled={isTestingAgent || !testQuestion}
                  className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isTestingAgent ? 'Evaluating...' : 'Test Agent'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>AI Agent Output (Safe Test Sandbox)</span>
                  <span className="text-emerald-600 font-mono">Confidence: {testResult.confidence}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  {testResult.reply}
                </div>
                {testResult.suggestedActions?.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-500">Backend Suggested Actions:</span>
                    {testResult.suggestedActions.map((act, i) => (
                      <span key={i} className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                        {act.type} {act.productId ? `[${act.productId}]` : ''}
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
      {/* TAB 6: REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Total Net Revenue</span>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
                {salesReport?.currency || 'INR'} {salesReport?.netSales?.toLocaleString() || '312,500'}
              </div>
              <span className="text-xs text-emerald-600">Avg Order Value: ₹{salesReport?.averageOrderValue || '1,326'}</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Conversion Rate</span>
              <div className="text-xl font-bold mt-1 text-indigo-600">3.48%</div>
              <span className="text-xs text-gray-500">From website visitors to checkout</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500">Refunds Processed</span>
              <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
                ₹{salesReport?.totalRefunds?.toLocaleString() || '12,500'}
              </div>
              <span className="text-xs text-amber-600">Under verified payment integrations</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Top Performing Products</h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {productsReport.map(prod => (
                <div key={prod.sku} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{prod.name}</div>
                    <div className="text-xs text-gray-500 font-mono">SKU: {prod.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">₹{prod.revenue?.toLocaleString()}</div>
                    <div className="text-xs text-emerald-600 font-medium">{prod.unitsSold} units sold</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: STORE SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">E-Commerce Store Configuration</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Store Name:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{storeInfo?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Default Currency:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{storeInfo?.currency || 'INR'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Default GST / Tax Rate:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{storeSettings?.defaultTaxRate || 18}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Free Shipping Threshold:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{storeSettings?.freeShippingThreshold || 999}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Cancellation Window:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{storeSettings?.orderCancellationWindowHours || 24} Hours</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Customer Support Email:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{storeInfo?.supportEmail}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Product */}
      <FormDialog
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Add New Product to Inventory"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">SKU (Unique per tenant)</label>
            <input
              type="text"
              required
              value={sku}
              onChange={e => setSku(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Price (INR)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Initial Stock</label>
              <input
                type="number"
                required
                min="0"
                value={initialStock}
                onChange={e => setInitialStock(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Low Stock Threshold</label>
              <input
                type="number"
                required
                min="1"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddProductModal(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Add Category */}
      <FormDialog
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        title="Create Product Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category Name</label>
            <input
              type="text"
              required
              value={catName}
              onChange={e => setCatName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={catDesc}
              onChange={e => setCatDesc(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddCategoryModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white">Save</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Add Segment */}
      <FormDialog
        isOpen={showAddSegmentModal}
        onClose={() => setShowAddSegmentModal(false)}
        title="Create Customer Segment"
      >
        <form onSubmit={handleCreateSegment} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Segment Name</label>
            <input
              type="text"
              required
              value={segName}
              onChange={e => setSegName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Criteria / Filter Rules</label>
            <input
              type="text"
              required
              value={segCriteria}
              onChange={e => setSegCriteria(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddSegmentModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white">Create Segment</button>
          </div>
        </form>
      </FormDialog>

      {/* Modal: Update Order */}
      <FormDialog
        isOpen={showUpdateOrderModal}
        onClose={() => setShowUpdateOrderModal(false)}
        title={`Update Order: ${selectedOrder?.orderNumber || selectedOrder?.id}`}
      >
        <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">New Fulfillment Status</label>
            <select
              value={orderNewStatus}
              onChange={e => setOrderNewStatus(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Audit Reason / Status Note</label>
            <input
              type="text"
              value={orderStatusReason}
              onChange={e => setOrderStatusReason(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowUpdateOrderModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white">Save Changes</button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
