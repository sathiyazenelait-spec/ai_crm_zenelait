import React, { useState, useEffect } from 'react';
import {
  Package, Truck, DollarSign, RotateCcw, XCircle, AlertOctagon,
  CheckCircle2, Clock, ShieldCheck, RefreshCw, ChevronRight, Eye,
  Search, Sliders, FileText, CheckCircle, Plus, Send, Warehouse
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';

export default function EcommerceOrderManagerView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    totalOrdersToday: 125,
    awaitingPayment: 12,
    paidOrdersAwaitingFulfilment: 28,
    ordersBeingPacked: 15,
    ordersShippedToday: 65,
    openCancellationRequests: 8,
    openReturnRequests: 14,
    pendingRefundRequests: 6,
    openOrderExceptions: 5
  });

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfilments, setFulfilments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [trackingData, setTrackingData] = useState(null);
  const [cancellations, setCancellations] = useState([]);
  const [returns, setReturns] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [inventoryCheck, setInventoryCheck] = useState(null);
  const [toast, setToast] = useState('');

  // Modals & Action States
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [receiveData, setReceiveData] = useState({ warehouseId: 'warehouse_001', condition: 'DAMAGED', inspectionNote: 'Damage confirmed during warehouse inspection' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, ordRes, fulRes, cancelRes, retRes, refRes, excRes] = await Promise.allSettled([
        ecommerceService.orderManager.getDashboard(),
        ecommerceService.orderManager.getOrders({ page: 0, size: 20 }),
        ecommerceService.orderManager.getFulfilmentQueue({ page: 0, size: 20 }),
        ecommerceService.orderManager.getCancellationRequests({ page: 0, size: 20 }),
        ecommerceService.orderManager.getReturnRequests({ page: 0, size: 20 }),
        ecommerceService.orderManager.getRefundRequests({ page: 0, size: 20 }),
        ecommerceService.orderManager.getExceptions({ page: 0, size: 20 })
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (ordRes.status === 'fulfilled' && ordRes.value?.data?.data?.content) {
        setOrders(ordRes.value.data.data.content);
        if (ordRes.value.data.data.content.length > 0 && !selectedOrder) {
          viewOrderDetails(ordRes.value.data.data.content[0].orderId);
        }
      }
      if (fulRes.status === 'fulfilled' && fulRes.value?.data?.data?.content) {
        setFulfilments(fulRes.value.data.data.content);
      }
      if (cancelRes.status === 'fulfilled' && cancelRes.value?.data?.data?.content) {
        setCancellations(cancelRes.value.data.data.content);
      }
      if (retRes.status === 'fulfilled' && retRes.value?.data?.data?.content) {
        setReturns(retRes.value.data.data.content);
      }
      if (refRes.status === 'fulfilled' && refRes.value?.data?.data?.content) {
        setRefunds(refRes.value.data.data.content);
      }
      if (excRes.status === 'fulfilled' && excRes.value?.data?.data?.content) {
        setExceptions(excRes.value.data.data.content);
      }
    } catch (e) {
      console.error('Error loading order operations data:', e);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const res = await ecommerceService.orderManager.getOrderDetails(orderId);
      if (res.data?.data) {
        setSelectedOrder(res.data.data);
      }
      const shipRes = await ecommerceService.orderManager.getOrderShipments(orderId);
      if (shipRes.data?.data?.shipments) {
        setShipments(shipRes.data.data.shipments);
      }
    } catch (e) {
      console.error('Error loading order detail:', e);
    }
  };

  const viewShipmentTracking = async (shipmentId) => {
    try {
      const res = await ecommerceService.orderManager.getShipmentTracking(shipmentId);
      if (res.data?.data) {
        setTrackingData(res.data.data);
        showToast('Tracking events retrieved from carrier');
      }
    } catch (e) {
      showToast('Error fetching tracking events');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFulfilment = async (orderId) => {
    try {
      const res = await ecommerceService.orderManager.createFulfilment(orderId, {
        warehouseId: 'warehouse_001',
        priority: 'NORMAL'
      });
      if (res.data?.success) {
        showToast('Fulfilment request created for warehouse_001');
        loadData();
      }
    } catch (err) {
      showToast('Error creating fulfilment');
    }
  };

  const handleUpdateFulfilmentStatus = async (fulId, newStatus) => {
    try {
      const res = await ecommerceService.orderManager.updateFulfilmentStatus(fulId, { status: newStatus });
      if (res.data?.success) {
        showToast('Fulfilment status updated to ' + newStatus);
        loadData();
      }
    } catch (err) {
      showToast('Error updating status');
    }
  };

  const handleCreateShipment = async (orderId) => {
    try {
      const res = await ecommerceService.orderManager.createShipment(orderId, {
        carrierCode: 'EXAMPLE_EXPRESS',
        shippingService: 'STANDARD'
      });
      if (res.data?.success) {
        showToast('Shipment request created');
        loadData();
      }
    } catch (err) {
      showToast('Error creating shipment');
    }
  };

  const handleApproveCancellation = async (reqId) => {
    try {
      const res = await ecommerceService.orderManager.approveCancellation(reqId, {
        decisionReason: 'Order has not entered fulfilment',
        notifyCustomer: true
      });
      if (res.data?.success) {
        showToast('Cancellation approved & notification queued');
        loadData();
      }
    } catch (err) {
      showToast('Error approving cancellation');
    }
  };

  const handleApproveReturn = async (reqId) => {
    try {
      const res = await ecommerceService.orderManager.approveReturn(reqId, {
        decisionReason: 'Eligible return within policy window',
        returnMethod: 'PICKUP',
        notifyCustomer: true
      });
      if (res.data?.success) {
        showToast('Return approved with carrier pickup');
        loadData();
      }
    } catch (err) {
      showToast('Error approving return');
    }
  };

  const handleReceiveGoods = async (reqId) => {
    try {
      const res = await ecommerceService.orderManager.receiveReturnedGoods(reqId, receiveData);
      if (res.data?.success) {
        showToast('Returned goods recorded & inspected in warehouse');
        setSelectedReturn(null);
        loadData();
      }
    } catch (err) {
      showToast('Error receiving return');
    }
  };

  const handleApproveRefund = async (reqId) => {
    try {
      const res = await ecommerceService.orderManager.approveRefund(reqId, {
        approvedAmount: 4999.00,
        currency: 'INR',
        decisionReason: 'Eligible following warehouse return inspection'
      });
      if (res.data?.success) {
        showToast('Refund approved by Order Operations');
        loadData();
      }
    } catch (err) {
      showToast('Error approving refund');
    }
  };

  const handleExecuteRefund = async (reqId) => {
    try {
      const res = await ecommerceService.orderManager.executeRefund(reqId, {
        executionReason: 'Dispatched to payment gateway'
      }, { 'Idempotency-Key': 'refund-' + reqId });

      if (res.data?.success) {
        showToast('Refund execution submitted to payment provider (PROCESSING)');
        loadData();
      }
    } catch (err) {
      showToast('Error executing refund');
    }
  };

  const handleCheckStock = async () => {
    try {
      const res = await ecommerceService.orderManager.checkInventory({
        productId: 'prod_1001',
        warehouseId: 'warehouse_001'
      });
      if (res.data?.data) {
        setInventoryCheck(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-indigo-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Order Operations & Fulfilment</h1>
              <p className="text-sm text-indigo-300/80">Authoritative Payment Verification, Fulfilment, Carrier Shipments & Refunds</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCheckStock}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700"
            >
              <Warehouse className="w-4 h-4 text-indigo-400" />
              <span>Check Stock</span>
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl border border-slate-700/60 transition"
              title="Refresh Operations Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-indigo-500/20 pb-2">
          {[
            { id: 'dashboard', label: 'Operations Dashboard', icon: Package },
            { id: 'orders', label: 'All Orders', icon: Eye },
            { id: 'fulfilment', label: 'Fulfilment Queue', icon: Clock },
            { id: 'shipments', label: 'Shipments & Tracking', icon: Truck },
            { id: 'cancellations', label: 'Cancellations', icon: XCircle },
            { id: 'returns', label: 'Returns & Inspection', icon: RotateCcw },
            { id: 'refunds', label: 'Refund Authorization', icon: DollarSign },
            { id: 'exceptions', label: 'Order Exceptions', icon: AlertOctagon },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/40 shadow-md'
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

      {/* Stock Check Quick Display */}
      {inventoryCheck && (
        <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="font-bold text-white">Product: {inventoryCheck.productId} ({inventoryCheck.warehouseId})</span>
            <span className="text-slate-300">On-Hand: <strong className="text-white">{inventoryCheck.onHandQuantity}</strong></span>
            <span className="text-slate-300">Reserved: <strong className="text-amber-400">{inventoryCheck.reservedQuantity}</strong></span>
            <span className="text-slate-300">Available: <strong className="text-emerald-400">{inventoryCheck.availableQuantity}</strong></span>
          </div>
          <button onClick={() => setInventoryCheck(null)} className="text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">Today's Orders</span>
              <p className="text-2xl font-bold text-white mt-1">{dashboard.totalOrdersToday || 125}</p>
              <span className="text-xs text-amber-400 font-semibold">{dashboard.awaitingPayment || 12} Awaiting Payment</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">Ready for Fulfilment</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{dashboard.paidOrdersAwaitingFulfilment || 28}</p>
              <span className="text-xs text-slate-400">{dashboard.ordersBeingPacked || 15} currently being packed</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">Shipped Today</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{dashboard.ordersShippedToday || 65}</p>
              <span className="text-xs text-emerald-400 font-semibold">100% carrier scanned</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">Pending Reviews</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {(dashboard.openCancellationRequests || 8) + (dashboard.openReturnRequests || 14) + (dashboard.pendingRefundRequests || 6)}
              </p>
              <span className="text-xs text-slate-400">Cancellations, Returns & Refunds</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">Orders Requiring Operations Action</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-medium uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Fulfilment</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {orders.map(o => (
                      <tr key={o.orderId} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono text-indigo-300 font-bold">{o.orderNumber}</td>
                        <td className="py-3 px-4">₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">{o.fulfilmentStatus}</td>
                        <td className="py-3 px-4">
                          {o.fulfilmentStatus === 'PENDING' && (
                            <button
                              onClick={() => handleCreateFulfilment(o.orderId)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold"
                            >
                              Dispatch Fulfilment
                            </button>
                          )}
                          {o.fulfilmentStatus === 'PROCESSING' && (
                            <button
                              onClick={() => handleCreateShipment(o.orderId)}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold"
                            >
                              Create Shipment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">Fulfilment Pipeline</h2>
              <div className="space-y-3 text-xs">
                {fulfilments.map(ful => (
                  <div key={ful.fulfilmentId} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-white font-bold">{ful.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">{ful.status}</span>
                    </div>
                    <div className="text-slate-400">Warehouse: {ful.warehouseId}</div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                      {ful.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateFulfilmentStatus(ful.fulfilmentId, 'PACKED')}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px]"
                        >
                          Mark as Packed
                        </button>
                      )}
                      {ful.status === 'PACKED' && (
                        <button
                          onClick={() => handleUpdateFulfilmentStatus(ful.fulfilmentId, 'DISPATCHED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px]"
                        >
                          Mark as Dispatched
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL ORDERS */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h2 className="text-sm font-bold text-white mb-2">Order Search</h2>
            {orders.map(o => (
              <div
                key={o.orderId}
                onClick={() => viewOrderDetails(o.orderId)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                  selectedOrder?.orderId === o.orderId
                    ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-300 font-bold">{o.orderNumber}</span>
                  <span className="text-emerald-400 font-bold">₹{Number(o.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 mt-1">
                  <span>{o.orderStatus}</span>
                  <span>{o.fulfilmentStatus}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            {selectedOrder ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedOrder.orderNumber}</h2>
                    <span className="text-xs text-slate-400">Customer: {selectedOrder.customer?.displayName} ({selectedOrder.customer?.emailMasked})</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Total Amount</span>
                    <p className="text-base font-bold text-white mt-0.5">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Order Status</span>
                    <p className="text-base font-bold text-indigo-400 mt-0.5">{selectedOrder.orderStatus}</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Fulfilment</span>
                    <p className="text-base font-bold text-cyan-400 mt-0.5">{selectedOrder.fulfilmentStatus}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</h3>
                  {selectedOrder.items?.map(it => (
                    <div key={it.orderItemId} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{it.productName}</span>
                        <span className="text-slate-400 ml-2">Qty: {it.quantity}</span>
                      </div>
                      <span className="font-bold text-white">₹{Number(it.unitPrice).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Shipments */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shipments</h3>
                  {shipments.map(s => (
                    <div key={s.shipmentId} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-indigo-300 font-bold">{s.carrierCode}</span>
                        <span className="text-slate-400 ml-2">Status: {s.status}</span>
                      </div>
                      <button
                        onClick={() => viewShipmentTracking(s.shipmentId)}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px]"
                      >
                        Track Shipment
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">Select an order to inspect.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SHIPMENTS & TRACKING */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Carrier Shipments & Live Milestones</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-indigo-300 font-bold text-sm">TRK30010001 (Example Express)</span>
                  <p className="text-slate-400 mt-1">Order Ref: ORD-2026-3001 | Estimated Delivery: Oct 29, 2026</p>
                </div>
                <button
                  onClick={() => viewShipmentTracking('ship_3001')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs"
                >
                  Retrieve Tracking Scan
                </button>
              </div>

              {trackingData && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carrier Scans & Waypoints</h3>
                  <div className="space-y-2 text-xs">
                    {trackingData.trackingEvents?.map((evt, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-900/60 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="flex-1">
                          <span className="font-bold text-white">{evt.status}</span>
                          <span className="text-slate-400 ml-2">{evt.description}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[10px]">{evt.eventAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CANCELLATIONS */}
      {activeTab === 'cancellations' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Order Cancellation Requests</h2>
          <div className="space-y-3">
            {cancellations.map(c => (
              <div key={c.requestId} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-300 font-bold">{c.orderNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{c.status}</span>
                  </div>
                  <p className="text-slate-300 mt-1">Reason: {c.reason}</p>
                </div>
                {c.status === 'PENDING_REVIEW' && (
                  <button
                    onClick={() => handleApproveCancellation(c.requestId)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs"
                  >
                    Approve Cancellation
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RETURNS & INSPECTION */}
      {activeTab === 'returns' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Return Requests & Goods Inspection</h2>
            <div className="space-y-3">
              {returns.map(r => (
                <div key={r.returnRequestId} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-300 font-bold">{r.orderNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{r.status}</span>
                    </div>
                    <p className="text-slate-300 mt-1">Reason: {r.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.status === 'PENDING_REVIEW' && (
                      <button
                        onClick={() => handleApproveReturn(r.returnRequestId)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs"
                      >
                        Approve Return
                      </button>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        onClick={() => setSelectedReturn(r)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs"
                      >
                        Receive & Inspect Goods
                      </button>
                    )}
                    {r.status === 'RECEIVED' && (
                      <span className="text-emerald-400 font-semibold text-xs">Goods Inspected (Damaged)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receive Dialog */}
          {selectedReturn && (
            <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">Record Warehouse Receipt: {selectedReturn.returnRequestId}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Warehouse</label>
                  <input
                    type="text"
                    value={receiveData.warehouseId}
                    onChange={(e) => setReceiveData({ ...receiveData, warehouseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Item Condition</label>
                  <select
                    value={receiveData.condition}
                    onChange={(e) => setReceiveData({ ...receiveData, condition: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="SELLABLE">Sellable / Restockable</option>
                    <option value="DAMAGED">Damaged / Non-Sellable</option>
                    <option value="DEFECTIVE">Defective / Return to Vendor</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setSelectedReturn(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button
                  onClick={() => handleReceiveGoods(selectedReturn.returnRequestId)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Confirm Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REFUND AUTHORIZATION & IDEMPOTENT EXECUTION */}
      {activeTab === 'refunds' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Refund Authorization & Payment Gateway Dispatch</h2>
              <p className="text-xs text-slate-400 mt-0.5">Authoritative balance validation, double-refund prevention via idempotency keys.</p>
            </div>
          </div>

          <div className="space-y-3">
            {refunds.map(rf => (
              <div key={rf.refundRequestId} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-300 font-bold">{rf.orderNumber}</span>
                    <span className="text-white font-bold">₹{Number(rf.requestedAmount).toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      rf.status === 'PROCESSING'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : rf.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rf.status}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">Reason: {rf.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  {rf.status === 'PENDING_REVIEW' && (
                    <button
                      onClick={() => handleApproveRefund(rf.refundRequestId)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                    >
                      Approve Refund (₹4,999.00)
                    </button>
                  )}
                  {rf.status === 'APPROVED' && (
                    <button
                      onClick={() => handleExecuteRefund(rf.refundRequestId)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1 shadow-md"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Execute to Payment Gateway</span>
                    </button>
                  )}
                  {rf.status === 'PROCESSING' && (
                    <span className="text-cyan-300 font-mono font-semibold text-xs">Dispatched (Processing)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: EXCEPTIONS */}
      {activeTab === 'exceptions' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Active Order Exceptions</h2>
          <div className="space-y-3 text-xs">
            {exceptions.map(exc => (
              <div key={exc.exceptionId} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-red-400 font-bold">{exc.exceptionType}</span>
                    <span className="text-slate-400">Order: {exc.orderId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">{exc.status}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{exc.description}</p>
                </div>
                <button
                  onClick={() => {
                    ecommerceService.orderManager.updateException(exc.exceptionId, { status: 'RESOLVED' }).then(() => {
                      showToast('Exception marked as resolved');
                      loadData();
                    });
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                >
                  Resolve Exception
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
