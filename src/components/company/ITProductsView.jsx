import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Package,
  Sparkles,
  ShieldCheck,
  Edit,
  Trash2,
  X,
  Check
} from 'lucide-react';

export function ITProductsView() {
  const { companyProfile, addNotification } = useCRM();

  const [products, setProducts] = useState([
    {
      productId: 'PRD-101',
      name: 'HRMS Pro',
      code: 'HRMS-PRO',
      category: 'HR_SOFTWARE',
      description: 'Employee management, recruitment ATS, payroll and leave workflow platform',
      billingModel: 'SUBSCRIPTION',
      currency: 'INR',
      price: '₹4,999 / mo',
      status: 'ACTIVE'
    },
    {
      productId: 'PRD-102',
      name: 'Cloud ERP Enterprise',
      code: 'ERP-ENT',
      category: 'ENTERPRISE_SOFTWARE',
      description: 'End-to-end multi-warehouse inventory, supply chain and accounting automation',
      billingModel: 'SUBSCRIPTION',
      currency: 'INR',
      price: '₹14,999 / mo',
      status: 'ACTIVE'
    },
    {
      productId: 'PRD-103',
      name: 'AI LMS & Talent Academy',
      code: 'LMS-AI',
      category: 'EDTECH_SOFTWARE',
      description: 'Corporate employee training, certifications, and AI-driven skill tests',
      billingModel: 'PER_USER',
      currency: 'INR',
      price: '₹299 / user / mo',
      status: 'ACTIVE'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('HR_SOFTWARE');
  const [description, setDescription] = useState('');
  const [billingModel, setBillingModel] = useState('SUBSCRIPTION');
  const [price, setPrice] = useState('₹4,999 / mo');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newProd = {
      productId: `PRD-${products.length + 101}`,
      name,
      code: code.toUpperCase(),
      category,
      description,
      billingModel,
      currency: 'INR',
      price,
      status: 'ACTIVE'
    };

    setProducts(prev => [newProd, ...prev]);
    setShowAddModal(false);

    api.createAdminProduct(newProd);

    addNotification({
      type: 'system',
      title: `Product ${name} (${newProd.code}) created and added to sales catalog!`,
      category: 'Catalog'
    });

    setName('');
    setCode('');
    setDescription('');
  };

  const toggleProductStatus = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === id) {
        const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        addNotification({
          type: 'system',
          title: `Product ${p.name} status changed to ${nextStatus}`,
          category: 'Catalog'
        });
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  return (
    <div className="it-products-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>IT Products & Solutions Catalog 💻</h1>
          <p>Configure software products (HRMS, ERP, LMS) available for opportunities, proposals, and pricing in {companyProfile.name}</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>+ Add IT Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {products.map((prod) => (
          <div
            key={prod.productId}
            className="crm-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: '3px solid var(--primary)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.68rem', marginBottom: '4px' }}>
                    {prod.code}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    {prod.name}
                  </h3>
                </div>

                <span
                  className={`badge ${prod.status === 'ACTIVE' ? 'badge-qualified' : 'badge-error'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  ● {prod.status}
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>
                Category: {prod.category} • {prod.billingModel}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
                {prod.description}
              </p>
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Base Price</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{prod.price}</div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => toggleProductStatus(prod.productId)}
                  className={`btn btn-xs ${prod.status === 'ACTIVE' ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {prod.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="crm-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h2>+ Add IT Product / SaaS Solution</h2>
              <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="crm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="HRMS Pro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Product Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="HRMS-PRO"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="HR_SOFTWARE">HR Software</option>
                    <option value="ENTERPRISE_SOFTWARE">Enterprise ERP</option>
                    <option value="EDTECH_SOFTWARE">EdTech / LMS</option>
                    <option value="CUSTOM_SAAS">Custom SaaS</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Billing Model</label>
                  <select
                    className="form-control"
                    value={billingModel}
                    onChange={(e) => setBillingModel(e.target.value)}
                  >
                    <option value="SUBSCRIPTION">Monthly Subscription</option>
                    <option value="PER_USER">Per User License</option>
                    <option value="ONE_TIME">One-Time License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Pricing Display (e.g., ₹4,999 / mo)</label>
                <input
                  type="text"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Describe software capabilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              </div>

              <div className="crm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
