import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { realEstateService } from '../../services/realEstateService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  Building2,
  Home,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  Users,
  Eye,
  Key
} from 'lucide-react';

export function RealEstateInventoryView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('properties'); // 'projects' | 'properties' | 'site-visits' | 'pricing' | 'amenities'
  const [projects, setProjects] = useState([]);
  const [properties, setProperties] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);
  const [siteVisitSlots, setSiteVisitSlots] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Project Form
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectCategory, setProjectCategory] = useState('RESIDENTIAL');
  const [projectCity, setProjectCity] = useState('Chennai');

  // Property Unit Form
  const [unitNumber, setUnitNumber] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('PROJ-001');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [areaSqFt, setAreaSqFt] = useState(1450);
  const [priceAmount, setPriceAmount] = useState(9500000);
  const [availability, setAvailability] = useState('AVAILABLE');

  // Slot Form
  const [slotDate, setSlotDate] = useState('2026-10-24T10:00:00+05:30');
  const [slotCoordinator, setSlotCoordinator] = useState('Suresh Nair');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projRes, propRes, visitRes, slotRes, ruleRes, amenRes] = await Promise.all([
        realEstateService.getProjects(),
        realEstateService.getProperties(),
        realEstateService.getSiteVisits(),
        realEstateService.getSiteVisitSlots(),
        realEstateService.getPricingRules(),
        realEstateService.getAmenities()
      ]);

      if (projRes.success) setProjects(projRes.data || []);
      if (propRes.success) setProperties(propRes.data || []);
      if (visitRes.success) setSiteVisits(visitRes.data || []);
      if (slotRes.success) setSiteVisitSlots(slotRes.data || []);
      if (ruleRes.success) setPricingRules(ruleRes.data || []);
      if (amenRes.success) setAmenities(amenRes.data || []);
    } catch (err) {
      console.error('Error loading real estate inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !projectCode.trim()) {
      setFormError('Please enter Project Name and Project Code');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    const res = await realEstateService.createProject({
      name: projectName,
      projectCode,
      propertyCategory: projectCategory,
      location: { city: projectCity, state: 'Tamil Nadu', country: 'India' }
    });

    setIsSubmitting(false);
    if (res.success) {
      addNotification({
        type: 'success',
        title: `Project "${projectName}" created successfully!`,
        category: 'Real Estate'
      });
      setShowAddProjectModal(false);
      setProjectName('');
      setProjectCode('');
      fetchData();
    } else {
      setFormError(res.error || 'Failed to create project');
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!unitNumber.trim()) {
      setFormError('Please enter a valid Unit Number');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);

    const proj = projects.find((p) => p.projectId === selectedProjectId);
    const res = await realEstateService.createProperty({
      projectId: selectedProjectId,
      projectName: proj?.name || 'GreenNest Residency',
      unitNumber,
      propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      areaSqFt: Number(areaSqFt),
      price: { amount: Number(priceAmount), currency: 'INR' },
      availability
    });

    setIsSubmitting(false);
    if (res.success) {
      addNotification({
        type: 'success',
        title: `Property Unit ${unitNumber} added to inventory!`,
        category: 'Real Estate'
      });
      setShowAddPropertyModal(false);
      setUnitNumber('');
      fetchData();
    } else {
      setFormError(res.error || 'Failed to add property unit');
    }
  };

  const handleToggleAvailability = async (property) => {
    const nextStatus = property.availability === 'AVAILABLE' ? 'RESERVED' : 'AVAILABLE';
    const res = await realEstateService.updateAvailability(property.propertyId, nextStatus);
    if (res.success) {
      addNotification({
        type: 'info',
        title: `Unit ${property.unitNumber} marked as ${nextStatus}`,
        category: 'Real Estate'
      });
      fetchData();
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await realEstateService.createSiteVisitSlot({
      projectId: 'PROJ-001',
      coordinatorName: slotCoordinator,
      startAt: slotDate,
      capacity: 1
    });
    setIsSubmitting(false);
    if (res.success) {
      addNotification({
        type: 'success',
        title: 'New Site Visit Slot opened on calendar!',
        category: 'Real Estate'
      });
      setShowAddSlotModal(false);
      fetchData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '16px',
          padding: '24px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}
            >
              REAL ESTATE TENANT WORKSPACE
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>TEN-RE-001 · GreenNest Properties</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc' }}>
            Property Inventory & Development Hub
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.9375rem' }}>
            Manage residential projects, property units, pricing models, amenities, and site visit appointments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddProjectModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Building2 size={16} />
            + New Project
          </button>
          <button
            onClick={() => setShowAddPropertyModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Plus size={16} />
            Add Property Unit
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>Active Projects</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981' }}>{projects.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Chennai & Bengaluru Townships</div>
        </div>
        <div style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>Total Units in Inventory</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#3b82f6' }}>128</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>92 Available · 36 Booked</div>
        </div>
        <div style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>Site Visits This Month</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f59e0b' }}>74</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>AI Bot Scheduled: 68%</div>
        </div>
        <div style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>Pending Bookings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ec4899' }}>12</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Value: ₹14.8 Cr</div>
        </div>
      </div>

      {/* Sub-Tabs Nav */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
        {[
          { id: 'properties', label: 'Units & Inventory', icon: Home, count: properties.length },
          { id: 'projects', label: 'Projects Master', icon: Building2, count: projects.length },
          { id: 'site-visits', label: 'Site Visits & Calendar', icon: Calendar, count: siteVisits.length },
          { id: 'pricing', label: 'Pricing & Offers', icon: DollarSign, count: pricingRules.length },
          { id: 'amenities', label: 'Amenities & Types', icon: Sparkles, count: amenities.length }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: isActive ? '#10b981' : '#94a3b8',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              {tab.label}
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  background: isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#ffffff' : '#94a3b8'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Units & Inventory */}
      {activeTab === 'properties' && (
        <DataTable
          columns={[
            {
              header: 'Unit / Code',
              accessor: 'unitNumber',
              render: (val, row) => (
                <div>
                  <div style={{ fontWeight: '700', color: '#f8fafc' }}>Unit {val}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.projectName}</div>
                </div>
              )
            },
            { header: 'Type', accessor: 'propertyType' },
            {
              header: 'Specs',
              accessor: 'bedrooms',
              render: (val, row) => (
                <span>
                  {val} BHK · {row.bathrooms} Bath · {row.areaSqFt} sq.ft
                </span>
              )
            },
            {
              header: 'Floor / Facing',
              accessor: 'floor',
              render: (val, row) => <span>Floor {val} · {row.facing || 'East'}</span>
            },
            {
              header: 'Price',
              accessor: 'price',
              render: (val) => (
                <span style={{ fontWeight: '700', color: '#10b981' }}>
                  ₹{((val?.amount || 0) / 100000).toFixed(1)} Lakhs
                </span>
              )
            },
            {
              header: 'Availability',
              accessor: 'availability',
              isStatus: true
            }
          ]}
          data={properties}
          searchKey="unitNumber"
          searchPlaceholder="Search by unit number or project..."
          filterKey="availability"
          filterOptions={[
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'Reserved', value: 'RESERVED' },
            { label: 'Booked', value: 'BOOKED' }
          ]}
          actions={[
            {
              label: 'Toggle Availability',
              icon: Key,
              onClick: (row) => handleToggleAvailability(row)
            }
          ]}
          isLoading={isLoading}
        />
      )}

      {/* Tab 2: Projects Master */}
      {activeTab === 'projects' && (
        <DataTable
          columns={[
            {
              header: 'Project Name',
              accessor: 'name',
              render: (val, row) => (
                <div>
                  <div style={{ fontWeight: '700', color: '#f8fafc' }}>{val}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.projectCode}</div>
                </div>
              )
            },
            { header: 'Category', accessor: 'propertyCategory' },
            {
              header: 'Location',
              accessor: 'location',
              render: (val) => <span>{val?.city || 'Chennai'}, {val?.state || 'TN'}</span>
            },
            {
              header: 'Units (Total / Avail)',
              accessor: 'totalUnits',
              render: (val, row) => (
                <span>
                  <strong style={{ color: '#10b981' }}>{row.availableUnits || 42}</strong> / {val || 64}
                </span>
              )
            },
            { header: 'Status', accessor: 'status', isStatus: true }
          ]}
          data={projects}
          searchKey="name"
          searchPlaceholder="Search projects..."
          isLoading={isLoading}
        />
      )}

      {/* Tab 3: Site Visits */}
      {activeTab === 'site-visits' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              onClick={() => setShowAddSlotModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#fff',
                fontSize: '0.8125rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Calendar size={14} />
              Open Site Visit Slot
            </button>
          </div>
          <DataTable
            columns={[
              {
                header: 'Customer / Lead',
                accessor: 'leadName',
                render: (val, row) => (
                  <div>
                    <div style={{ fontWeight: '700', color: '#f8fafc' }}>{val}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.phone}</div>
                  </div>
                )
              },
              { header: 'Project', accessor: 'projectName' },
              { header: 'Coordinator', accessor: 'coordinatorName' },
              { header: 'Scheduled At', accessor: 'scheduledAt' },
              { header: 'Notes', accessor: 'notes' },
              { header: 'Status', accessor: 'status', isStatus: true }
            ]}
            data={siteVisits}
            searchKey="leadName"
            searchPlaceholder="Search site visits..."
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Tab 4: Pricing & Offers */}
      {activeTab === 'pricing' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#f8fafc' }}>Active Pricing Rules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pricingRules.map((rule) => (
                <div
                  key={rule.ruleId}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#f8fafc' }}>{rule.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '4px' }}>
                    Type: {rule.type} · Rate: {rule.ratePerSqFt ? `+₹${rule.ratePerSqFt}/sq.ft` : `+₹${rule.fixedAmount}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#f8fafc' }}>Booking & Token Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <div>• <strong>Initial Token Deposit:</strong> 10% of total unit agreement value</div>
              <div>• <strong>Reservation Hold Period:</strong> 7 calendar days before release</div>
              <div>• <strong>Payment Gateways:</strong> Razorpay UPI, Net Banking, RTGS/NEFT</div>
              <div>• <strong>Mandatory KYC Documents:</strong> PAN Card, Aadhaar, 3 Months Salary Slips</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Amenities */}
      {activeTab === 'amenities' && (
        <DataTable
          columns={[
            { header: 'Amenity Name', accessor: 'name' },
            { header: 'Category', accessor: 'category' }
          ]}
          data={amenities}
          searchKey="name"
          searchPlaceholder="Search amenities..."
          isLoading={isLoading}
        />
      )}

      {/* Modal: New Project */}
      <FormDialog
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        title="Create New Real Estate Project"
        description="Add a residential or commercial development to your company workspace."
        onSubmit={handleCreateProject}
        isSubmitting={isSubmitting}
        submitLabel="Create Project"
        error={formError}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GreenNest Residency"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Project Code *
              </label>
              <input
                type="text"
                required
                placeholder="GN-RES-001"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                City
              </label>
              <input
                type="text"
                value={projectCity}
                onChange={(e) => setProjectCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
          </div>
        </div>
      </FormDialog>

      {/* Modal: New Property Unit */}
      <FormDialog
        isOpen={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
        title="Add Property Unit to Inventory"
        description="Register a specific flat, villa, or commercial unit with pricing and specs."
        onSubmit={handleCreateProperty}
        isSubmitting={isSubmitting}
        submitLabel="Add Unit"
        error={formError}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Unit Number *
              </label>
              <input
                type="text"
                required
                placeholder="A-1204"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              >
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Bedrooms (BHK)
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Bathrooms
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Super Built-up (sq.ft)
              </label>
              <input
                type="number"
                value={areaSqFt}
                onChange={(e) => setAreaSqFt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Price (INR)
              </label>
              <input
                type="number"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="BOOKED">Booked</option>
              </select>
            </div>
          </div>
        </div>
      </FormDialog>

      {/* Modal: New Site Visit Slot */}
      <FormDialog
        isOpen={showAddSlotModal}
        onClose={() => setShowAddSlotModal(false)}
        title="Open Site Visit Slot"
        description="Make a calendar slot available for customer property inspections."
        onSubmit={handleCreateSlot}
        isSubmitting={isSubmitting}
        submitLabel="Open Slot"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
              Coordinator Name
            </label>
            <input
              type="text"
              value={slotCoordinator}
              onChange={(e) => setSlotCoordinator(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
              Date & Time Slot
            </label>
            <input
              type="text"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
