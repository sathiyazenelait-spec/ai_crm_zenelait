import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { AIEmployeeWorkstation } from './AIEmployeeWorkstation';
import {
  Bot,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Activity,
  Zap,
  Play,
  ShieldCheck,
  GitFork,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Layers
} from 'lucide-react';

export function AIAgentsView() {
  const { aiAgents, setActiveModal, currentIndustry, navigateTo } = useCRM();
  const [viewMode, setViewMode] = useState('workstation'); // 'workstation' | 'roster'
  const [expandedAgentId, setExpandedAgentId] = useState(null);
  const [showAllAgents, setShowAllAgents] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Mode Switcher Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setViewMode('workstation')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: viewMode === 'workstation' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'workstation' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: viewMode === 'workstation' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={14} />
            <span>⚡ Live AI Employee Workstation</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('roster')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: viewMode === 'roster' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'roster' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: viewMode === 'roster' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>🗂️ {currentIndustry.name} Fleet Roster</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigateTo('workflows')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <GitFork size={14} style={{ color: currentIndustry.color }} />
            <span>Workflow Tester</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveModal('createAgent')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Deploy Custom AI Agent</span>
          </button>
        </div>
      </div>

      {viewMode === 'workstation' ? (
        <AIEmployeeWorkstation />
      ) : (
        <div>
          <div className="page-title-row" style={{ marginBottom: '18px' }}>
            <div className="page-title-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  className="badge"
                  style={{
                    backgroundColor: currentIndustry.accentLight,
                    color: currentIndustry.color,
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  {currentIndustry.name}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• Specialized Agent Mesh</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Industry Agent Directory</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Pre-configured multi-channel autonomous models calibrated for {currentIndustry.name} customer lifecycles.
              </p>
            </div>
          </div>

          {/* Agents Cards Grid */}
          <div className="grid-3" style={{ marginBottom: '16px' }}>
            {(showAllAgents ? aiAgents : aiAgents.slice(0, 6)).map((agent) => (
              <div key={agent.id} className="agent-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="agent-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: currentIndustry.accentLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem'
                        }}
                      >
                        {agent.avatar || '🤖'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{agent.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {agent.role || 'Autonomous Agent'}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={agent.status} />
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', minHeight: '42px', margin: '10px 0', lineHeight: 1.45 }}>
                    {agent.description}
                  </p>

                  {/* Guardrails if regulated */}
                  {agent.guardrails && (
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(5, 150, 105, 0.08)',
                        border: '1px solid rgba(5, 150, 105, 0.2)',
                        fontSize: '0.72rem',
                        color: '#059669',
                        fontWeight: 600,
                        marginBottom: '12px'
                      }}
                    >
                      🛡️ {agent.guardrails}
                    </div>
                  )}

                  {/* Capabilities */}
                  {agent.capabilities && agent.capabilities.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {agent.capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="badge"
                            style={{
                              backgroundColor: 'var(--bg-main)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.68rem'
                            }}
                          >
                            ✓ {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Features Toggle */}
                  {agent.features && agent.features.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{
                          width: '100%',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border)'
                        }}
                        onClick={() => setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                          <Sparkles size={12} style={{ color: currentIndustry.color }} />
                          <span>{agent.features.length} Autonomous Capabilities</span>
                        </span>
                        {expandedAgentId === agent.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {expandedAgentId === agent.id && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          {agent.features.map((feat, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '6px',
                                fontSize: '0.72rem',
                                color: 'var(--text-main)',
                                lineHeight: 1.4
                              }}
                            >
                              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>✓</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats Box */}
                  <div className="agent-stats-grid">
                    {agent.leads !== undefined && (
                      <div className="agent-stat-item">
                        <span className="agent-stat-label">Inquiries Handled</span>
                        <span className="agent-stat-num">{agent.leads}</span>
                      </div>
                    )}
                    {agent.appointments !== undefined && (
                      <div className="agent-stat-item">
                        <span className="agent-stat-label">Booked Slots</span>
                        <span className="agent-stat-num">{agent.appointments}</span>
                      </div>
                    )}
                    {agent.resolved !== undefined && (
                      <div className="agent-stat-item">
                        <span className="agent-stat-label">Resolved Tickets</span>
                        <span className="agent-stat-num">{agent.resolved}</span>
                      </div>
                    )}
                    {agent.accuracy && (
                      <div className="agent-stat-item">
                        <span className="agent-stat-label">Model Accuracy</span>
                        <span className="agent-stat-num" style={{ color: '#10b981' }}>{agent.accuracy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Channels and Performance Footer */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {agent.channels?.map((ch) => (
                        <span
                          key={ch}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            backgroundColor: 'var(--bg-main)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                      Active 24/7
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => navigateTo('workflows')}
                  >
                    <Play size={12} />
                    <span>Test Agent In Workflow</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {aiAgents.length > 6 && (
            <div className="grid-view-more-bar" style={{ marginBottom: '24px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAllAgents(!showAllAgents)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 16px' }}
              >
                <span>{showAllAgents ? 'Show Less (First 6)' : `View All ${aiAgents.length} Agents (${aiAgents.length - 6} more)`}</span>
                <ChevronDown size={14} style={{ transform: showAllAgents ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
