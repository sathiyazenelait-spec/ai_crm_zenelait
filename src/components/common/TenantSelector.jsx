import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  ShieldAlert,
  Code2,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Hotel,
  Plane,
  Factory,
  ShieldCheck,
  Crown,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  Code2,
  Building2,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Hotel,
  Plane,
  Factory,
  ShieldCheck
};

export function TenantSelector() {
  const {
    tenants,
    currentTenant,
    activeTenantId,
    switchTenant,
    isPlatformView,
    setIsPlatformView,
    industryPresets,
    setActiveModal,
    activeIndustryId,
    switchIndustry
  } = useCRM();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPreset = industryPresets[activeIndustryId] || industryPresets.software_it;
  const CurrentIcon = ICON_MAP[currentPreset?.icon] || Building2;

  return (
    <div className="tenant-selector-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="tenant-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minWidth: '220px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {isPlatformView ? (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            <Crown size={16} />
          </div>
        ) : (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: currentTenant?.color || '#3b82f6',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            <CurrentIcon size={16} />
          </div>
        )}

        <div style={{ flex: 1, textAlign: 'left', lineHeight: 1.2 }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{isPlatformView ? 'Zenelait Platform' : currentTenant?.name}</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {isPlatformView ? 'Root Super Admin' : currentPreset?.shortName}
          </span>
        </div>

        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div
          className="tenant-menu-popover crm-card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '320px',
            maxHeight: '480px',
            overflowY: 'auto',
            padding: '8px',
            zIndex: 100,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)'
          }}
        >
          {/* Platform Level View */}
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Platform Infrastructure
          </div>
          <button
            className={`tenant-opt-btn ${isPlatformView ? 'active' : ''}`}
            onClick={() => {
              setIsPlatformView(true);
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: isPlatformView ? 'var(--primary-light)' : 'transparent',
              color: isPlatformView ? 'var(--primary)' : 'var(--text-main)',
              cursor: 'pointer',
              marginBottom: '6px'
            }}
          >
            <div style={{ width: 26, height: 26, borderRadius: '6px', backgroundColor: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={14} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>Zenelait Platform Admin</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Super Admin • Multi-Tenant Controller</div>
            </div>
            {isPlatformView && <Check size={14} style={{ color: 'var(--primary)' }} />}
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '6px 0' }} />

          {/* Quick 9-Industry Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Customer Companies (9 Industries)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Object.values(industryPresets).map((preset) => {
              const IconComp = ICON_MAP[preset.icon] || Building2;
              const isCurrent = !isPlatformView && activeIndustryId === preset.id;
              const matchingTenant = tenants.find(t => t.industryId === preset.id);

              return (
                <button
                  key={preset.id}
                  className={`tenant-opt-btn ${isCurrent ? 'active' : ''}`}
                  onClick={() => {
                    switchIndustry(preset.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isCurrent ? 'var(--primary-light)' : 'transparent',
                    color: isCurrent ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '6px',
                      backgroundColor: preset.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    <IconComp size={14} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {matchingTenant ? matchingTenant.name : preset.defaultCompanyName}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {preset.name} • {preset.aiEmployees.length} AI Agents
                    </div>
                  </div>
                  {isCurrent && <Check size={14} style={{ color: 'var(--primary)' }} />}
                </button>
              );
            })}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '8px 0' }} />

          {/* HR Register New Company Button */}
          <button
            className="btn btn-primary"
            style={{
              width: '100%',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px'
            }}
            onClick={() => {
              setIsOpen(false);
              setActiveModal('registerCompany');
            }}
          >
            <Plus size={14} />
            <span>Register New Company (HR Portal)</span>
          </button>
        </div>
      )}
    </div>
  );
}
