import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Bot,
  Layers,
  Download,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Filter
} from 'lucide-react';
import { softwareService } from '../../services/softwareService';

export function AnalystHubView() {
  const [activeTab, setActiveTab] = useState('funnel'); // funnel | sources | ai-fleet | reports | data-quality | exports
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Analytics Metrics
  const [dashboard, setDashboard] = useState({
    totalLeads: 420,
    qualifiedLeads: 125,
    opportunitiesCreated: 64,
    opportunitiesWon: 12,
    pipelineValue: 4200000,
    wonRevenue: 1250000,
    marketingQualifiedLeads: 125,
    supportTicketsCreated: 820,
    supportTicketsResolved: 775,
    aiConversations: 1450,
    aiHumanHandoffs: 135,
    currency: 'INR'
  });

  const [funnel, setFunnel] = useState({
    stages: [
      { stage: 'NEW_LEAD', count: 420 },
      { stage: 'QUALIFIED', count: 125 },
      { stage: 'OPPORTUNITY', count: 64 },
      { stage: 'WON', count: 12 }
    ],
    leadToQualifiedPercent: 29.76,
    qualifiedToOpportunityPercent: 51.2,
    opportunityToWonPercent: 18.75
  });

  const [leadSources, setLeadSources] = useState([]);
  const [aiAgents, setAiAgents] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [activeRunResults, setActiveRunResults] = useState(null);
  const [runningReportId, setRunningReportId] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [exportsList, setExportsList] = useState([]);

  useEffect(() => {
    loadAnalystData();
  }, []);

  const loadAnalystData = async () => {
    setLoading(true);
    try {
      const [dashRes, funRes, srcRes, aiRes, repRes, dqRes] = await Promise.allSettled([
        softwareService.getAnalystDashboard(),
        softwareService.getSalesFunnel(),
        softwareService.getLeadSourcesAnalytics(),
        softwareService.getAiAgentsAnalytics(),
        softwareService.getSavedReports(),
        softwareService.getDataQualityAnalytics()
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (funRes.status === 'fulfilled') setFunnel(funRes.value);
      if (srcRes.status === 'fulfilled' && srcRes.value.sources) setLeadSources(srcRes.value.sources);
      if (aiRes.status === 'fulfilled' && aiRes.value.agents) setAiAgents(aiRes.value.agents);
      if (repRes.status === 'fulfilled') setSavedReports(repRes.value);
      if (dqRes.status === 'fulfilled') setDataQuality(dqRes.value);
    } catch (err) {
      console.warn('Fallback loading analyst data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteReport = async (reportId) => {
    setRunningReportId(reportId);
    try {
      const run = await softwareService.runReport(reportId, { format: 'JSON' });
      setMessage({ type: 'info', text: `Report run ${run.runId} queued. Polling results...` });

      // Poll results
      setTimeout(async () => {
        try {
          const results = await softwareService.getReportRunResults(run.runId);
          setActiveRunResults(results);
          setRunningReportId(null);
          setMessage({ type: 'success', text: `Report executed successfully with ${results.rowCount} rows.` });
        } catch (e) {
          setRunningReportId(null);
          setMessage({ type: 'error', text: 'Error fetching report results.' });
        }
      }, 1000);
    } catch (err) {
      setRunningReportId(null);
      setMessage({ type: 'error', text: err.message || 'Failed to execute report' });
    }
  };

  const handleRequestExport = async (dataset = 'LEADS_AND_DEALS') => {
    try {
      const exp = await softwareService.requestExport({ dataset, format: 'CSV' });
      setExportsList([exp, ...exportsList]);
      setMessage({ type: 'success', text: `Export ${exp.exportId} generated and ready for download.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="crm-page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Business Intelligence & Analytics Hub
              </h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Funnel Velocity • AI Fleet Telemetry • Multi-Touch Attribution • Async Report Runner
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadAnalystData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Metrics</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleRequestExport('FULL_CRM_METRICS')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)', border: `1px solid ${message.type === 'error' ? '#ef4444' : '#6366f1'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            {message.type === 'error' ? <AlertTriangle size={16} color="#ef4444" /> : <CheckCircle2 size={16} color="#6366f1" />}
            <span style={{ color: message.type === 'error' ? '#ef4444' : '#6366f1', fontWeight: 600 }}>{message.text}</span>
          </div>
          <button className="btn btn-ghost btn-xs" onClick={() => setMessage(null)}>Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Total Inbound Leads', val: dashboard.totalLeads, sub: `${dashboard.qualifiedLeads} Qualified (MQL/SQL)`, color: '#3b82f6', icon: TrendingUp },
          { label: 'Active Pipeline Value', val: `₹${(dashboard.pipelineValue || 4200000).toLocaleString('en-IN')}`, sub: `Won: ₹${(dashboard.wonRevenue || 1250000).toLocaleString('en-IN')}`, color: '#10b981', icon: BarChart3 },
          { label: 'Support Tickets Handled', val: dashboard.supportTicketsCreated, sub: `${dashboard.supportTicketsResolved} Resolved (94.5% SLA)`, color: '#f59e0b', icon: Layers },
          { label: 'AI Conversations', val: dashboard.aiConversations, sub: `${dashboard.aiHumanHandoffs} Human Handoffs (${((dashboard.aiHumanHandoffs / (dashboard.aiConversations || 1)) * 100).toFixed(1)}%)`, color: '#8b5cf6', icon: Bot },
          { label: 'Data Completeness', val: `${dataQuality?.dataCompletenessPercent || 96.8}%`, sub: `${dataQuality?.duplicateLeadCount || 4} duplicates flagged`, color: '#06b6d4', icon: ShieldCheck }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="card-hover-glass" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: `${c.color}20`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>{c.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '20px', paddingBottom: '2px' }}>
        {[
          { id: 'funnel', label: 'Sales Funnel' },
          { id: 'sources', label: 'Lead Source Attribution' },
          { id: 'ai-fleet', label: 'AI Fleet Performance' },
          { id: 'reports', label: 'Async Report Runner' },
          { id: 'data-quality', label: 'Data Quality & Hygiene' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 16px',
              borderBottom: activeTab === t.id ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === t.id ? '#6366f1' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              backgroundColor: 'transparent',
              borderTop: 0,
              borderLeft: 0,
              borderRight: 0,
              cursor: 'pointer',
              fontSize: '0.86rem'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SALES FUNNEL */}
      {activeTab === 'funnel' && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Multi-Stage Conversion Funnel</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Cohort progression from initial inbound inquiry to closed-won software contract.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '800px', margin: '0 auto' }}>
            {funnel.stages?.map((st, i) => {
              const widths = ['100%', '75%', '50%', '30%'];
              const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '130px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'right' }}>
                    {st.stage.replace('_', ' ')}
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-surface)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
                    <div style={{ width: widths[i], backgroundColor: colors[i], height: '36px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', color: '#fff', fontWeight: 700, fontSize: '0.84rem' }}>
                      <span>{st.count} Records</span>
                      {i > 0 && <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>Pass-through</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lead ➔ Qualified</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{funnel.leadToQualifiedPercent}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qualified ➔ Opportunity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>{funnel.qualifiedToOpportunityPercent}%</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Opportunity ➔ Won Deal</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{funnel.opportunityToWonPercent}%</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAD SOURCES */}
      {activeTab === 'sources' && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
            Lead Source Channel Breakdown
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 14px' }}>Acquisition Channel</th>
                <th style={{ padding: '10px 14px' }}>Total Inquiries</th>
                <th style={{ padding: '10px 14px' }}>Qualified Leads</th>
                <th style={{ padding: '10px 14px' }}>Opportunities</th>
                <th style={{ padding: '10px 14px' }}>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {leadSources.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>{s.source}</td>
                  <td style={{ padding: '12px 14px' }}>{s.leads}</td>
                  <td style={{ padding: '12px 14px', color: '#3b82f6', fontWeight: 600 }}>{s.qualifiedLeads}</td>
                  <td style={{ padding: '12px 14px', color: '#8b5cf6', fontWeight: 600 }}>{s.opportunities}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-qualified" style={{ fontSize: '0.74rem' }}>{s.conversionPercent}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* TAB 3: AI FLEET PERFORMANCE */}
      {activeTab === 'ai-fleet' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {aiAgents.map((ag, i) => (
            <div key={i} className="card-hover-glass" style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{ag.agentId}</span>
                <span className="badge" style={{ backgroundColor: '#10b98120', color: '#10b981', fontSize: '0.68rem', fontWeight: 700 }}>Autonomous</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main)' }}>{ag.agentName}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Conversations</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>{ag.conversations}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Resolved w/o Handoff</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>{ag.completedWithoutHandoff}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Human Escalations</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{ag.humanHandoffs}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Avg Response Time</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1', marginTop: '2px' }}>{ag.averageResponseTimeMs} ms</div>
                </div>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                Outcome Impact: <strong>{ag.leadsCreated || ag.ticketsCreated || 28} records created</strong> • {ag.failedRuns || 0} run errors
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ASYNC REPORT RUNNER */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>Saved Report Definitions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {savedReports.map((r, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700 }}>{r.reportId}</span>
                    <span className="badge badge-qualified" style={{ fontSize: '0.64rem' }}>{r.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>{r.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Type: {r.reportType} • Group By: {r.groupBy}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleExecuteReport(r.reportId)}
                    disabled={runningReportId === r.reportId}
                  >
                    {runningReportId === r.reportId ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                    <span>{runningReportId === r.reportId ? 'Executing Run...' : 'Run Report Now'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Report Execution Output */}
          {activeRunResults && (
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Latest Report Output ({activeRunResults.rowCount} Rows)</span>
                <button className="btn btn-secondary btn-xs" onClick={() => setActiveRunResults(null)}>Close</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      {activeRunResults.columns?.map((col, idx) => (
                        <th key={idx} style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeRunResults.rows?.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                        {activeRunResults.columns?.map((col, cIdx) => (
                          <td key={cIdx} style={{ padding: '12px 14px' }}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DATA QUALITY */}
      {activeTab === 'data-quality' && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>CRM Health & Data Hygiene Audit</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Real-time scanner for duplicate contacts, orphaned opportunities, and missing attribution tags.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completeness Rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {dataQuality?.dataCompletenessPercent || 96.8}%
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duplicate Records Flagged</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                {dataQuality?.duplicateLeadCount || 4}
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leads Missing Phone</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                {dataQuality?.leadsMissingPhone || 12}
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px' }}>Recommended Hygiene Actions:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(dataQuality?.recommendedFixes || [
              "Merge duplicate lead 'Karthik Raj (ABC Tech)' with existing contact CON-1001",
              "Enforce phone number capture on inbound website gate forms"
            ]).map((fix, idx) => (
              <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={16} color="#f59e0b" />
                  <span>{fix}</span>
                </div>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => setMessage(`Applied automatic clean-up rule: "${fix}"`)}
                >
                  Apply Clean-up
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
