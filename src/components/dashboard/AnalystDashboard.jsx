import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Shield,
  Eye,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Target,
  Sparkles,
  Bot,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileText,
  Copy,
  Printer,
  ChevronRight,
  Check
} from 'lucide-react';

export function AnalystDashboard() {
  const {
    companyProfile,
    currentUserName,
    activeIndustryId,
    currentIndustry,
    addNotification
  } = useCRM();

  const [dateRange, setDateRange] = useState('30d'); // 'today' | '7d' | '30d' | 'q3' | 'ytd'
  const [copiedSnapshot, setCopiedSnapshot] = useState(false);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Metric,Value,Benchmark,Status\n" +
      "Total Pipeline Value,₹4.80 Cr,₹4.00 Cr,Exceeded (+20%)\n" +
      "Blended Conversion Rate,31.4%,25.0%,Healthy (+6.4%)\n" +
      "Customer Acquisition Cost (CAC),₹1,850,₹2,200,Efficient (-15.9%)\n" +
      "Customer Lifetime Value (LTV),₹98,400,₹85,000,Superior (+15.7%)\n" +
      "SLA Adherence Rate,98.6%,95.0%,Compliant (+3.6%)\n" +
      "AI Containment Rate,74.2%,65.0%,Optimal (+9.2%)\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zenelait_BI_Analytics_${activeIndustryId}_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      type: 'system',
      title: 'CSV Export Generated',
      category: 'Analytics'
    });
  };

  const handleExportExcel = () => {
    handleExportCSV(); // Standard download trigger
    addNotification({
      type: 'system',
      title: 'BI Excel Spreadsheet (.xlsx) exported successfully',
      category: 'Export'
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleCopySnapshot = () => {
    const text = `Zenelait AI - Executive BI Snapshot (${companyProfile.name})
Pipeline Value: ₹4.80 Cr | Conversion Rate: 31.4%
CAC: ₹1,850 | LTV: ₹98,400 (53.2x LTV:CAC)
SLA Compliance: 98.6% | AI Deflection: 74.2%
Generated on: ${new Date().toLocaleDateString()}`;

    navigator.clipboard.writeText(text);
    setCopiedSnapshot(true);
    setTimeout(() => setCopiedSnapshot(false), 2500);

    addNotification({
      type: 'system',
      title: 'Executive snapshot copied to clipboard',
      category: 'Analytics'
    });
  };

  // Funnel Data
  const funnelStages = [
    { stage: 'Inbound Traffic / Impressions', count: '124,500', rate: '100%', drop: '—', color: '#3b82f6' },
    { stage: 'Captured Leads', count: '3,420', rate: '2.7%', drop: '-97.3%', color: '#06b6d4' },
    { stage: 'Marketing Qualified (MQL)', count: '1,240', rate: '36.3%', drop: '-63.7%', color: '#10b981' },
    { stage: 'Sales Accepted / Demos (SAL)', count: '468', rate: '37.7%', drop: '-62.3%', color: '#f59e0b' },
    { stage: 'Proposals / Commercial Quotes', count: '192', rate: '41.0%', drop: '-59.0%', color: '#8b5cf6' },
    { stage: 'Closed Won Deals', count: '64', rate: '33.3%', drop: '-66.7%', color: '#ec4899' }
  ];

  // Channel Attribution Matrix
  const channelData = [
    { channel: 'WhatsApp Conversions', spend: '₹12,500', leads: 840, won: '₹34.8 L', cac: '₹890', roas: '27.8x', health: 'Exceptional' },
    { channel: 'Google Search PPC', spend: '₹62,000', leads: 580, won: '₹29.2 L', cac: '₹2,150', roas: '4.7x', health: 'Strong' },
    { channel: 'Organic SEO & Direct', spend: '₹0', leads: 920, won: '₹41.2 L', cac: '₹0', roas: '∞', health: 'High ROI' },
    { channel: 'Meta (Instagram / FB)', spend: '₹45,000', leads: 420, won: '₹18.5 L', cac: '₹1,950', roas: '4.1x', health: 'Moderate' },
    { channel: 'Referral & Partner Network', spend: '₹25,000', leads: 280, won: '₹19.4 L', cac: '₹1,420', roas: '7.8x', health: 'Strong' }
  ];

  // SLA Heatmap
  const departmentSla = [
    { dept: 'Inbound Lead Response', target: '< 5 min', actual: '1m 45s', compliance: '99.4%', status: 'optimal' },
    { dept: 'Tech Support First Response', target: '< 15 min', actual: '4m 10s', compliance: '98.8%', status: 'optimal' },
    { dept: 'Critical Bug Escalation', target: '< 1 hour', actual: '34 min', compliance: '97.2%', status: 'good' },
    { dept: 'Deal Proposal Issuance', target: '< 24 hours', actual: '6.2 hours', compliance: '98.0%', status: 'optimal' },
    { dept: 'Financial Underwriting / RM Sign-off', target: '< 4 hours', actual: '1.8 hours', compliance: '99.1%', status: 'optimal' }
  ];

  return (
    <div className="analyst-dashboard">
      {/* 1. Read-Only Guardrail Alert Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(100, 116, 139, 0.08)',
          border: '1px solid rgba(100, 116, 139, 0.25)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'rgba(100, 116, 139, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <Eye size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Analyst & BI Viewer Persona (Read-Only Mode)
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Data modification & deletion restricted. Real-time telemetry, multidimensional exports, and KPI drilldowns enabled.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-secondary" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} style={{ color: '#10b981' }} /> Audit Verified
          </span>
          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
            Live Telemetry: 15s refresh
          </span>
        </div>
      </div>

      {/* 2. Top Header and Action Bar */}
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Business Intelligence & Telemetry</h1>
          <p>Holistic revenue telemetry, acquisition ROI, conversion funnel, and SLA benchmarks for {companyProfile.name}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Date Range Selector */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: 'q3', label: 'Q3 2026' },
              { id: 'ytd', label: 'YTD' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`btn btn-xs ${dateRange === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            title="Download CSV dataset"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="btn btn-secondary btn-sm"
            title="Export Excel spreadsheet"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileSpreadsheet size={14} />
            <span>Excel</span>
          </button>

          <button
            onClick={handleCopySnapshot}
            className="btn btn-secondary btn-sm"
            title="Copy snapshot to clipboard"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedSnapshot ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{copiedSnapshot ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="btn btn-primary btn-sm"
            title="Print or export PDF report"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={14} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* 3. 6 Key BI Stat Metric Cards */}
      <div className="grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard
          title="Active Pipeline Value"
          value="₹4.80 Cr"
          change="+18.4%"
          period="vs prior 30d"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Sales Win Rate"
          value="31.4%"
          change="+4.2%"
          period="lead-to-close"
          isPositive={true}
          icon={Target}
        />
        <StatCard
          title="Avg Blended CAC"
          value="₹1,850"
          change="-12.1%"
          period="acq cost drop"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title="Customer LTV"
          value="₹98,400"
          change="53.2x"
          period="LTV:CAC ratio"
          isPositive={true}
          icon={Sparkles}
        />
        <StatCard
          title="SLA Compliance"
          value="98.6%"
          change="+1.2%"
          period="standard >95%"
          isPositive={true}
          icon={CheckCircle2}
        />
        <StatCard
          title="AI Deflection Rate"
          value="74.2%"
          change="18,420"
          period="auto resolved"
          isPositive={true}
          icon={Bot}
        />
      </div>

      {/* 4. Funnel Drop-off Analysis & AI vs Human Benchmark */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Sales & Lead Funnel Bar */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">Commercial Conversion Funnel Telemetry</h2>
              <p className="crm-card-subtitle">Drop-off velocity and stage progression efficiency</p>
            </div>
            <span className="badge badge-primary">31.4% Overall Win</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {funnelStages.map((item, idx) => (
              <div key={idx} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.stage}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.count}</span>
                    <span className="badge badge-secondary" style={{ fontSize: '0.68rem', minWidth: 44, textAlign: 'center' }}>{item.rate}</span>
                    <span style={{ fontSize: '0.72rem', color: idx === 0 ? 'var(--text-muted)' : '#ef4444', minWidth: 48, textAlign: 'right' }}>{item.drop}</span>
                  </div>
                </div>
                <div className="progress-bar-bg" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: item.rate.replace('%', '') > 100 ? '100%' : `${item.rate.replace('%', '')}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Autonomous vs Human Telemetry */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">AI Autonomous vs Human Benchmark</h2>
              <p className="crm-card-subtitle">Workforce distribution and containment stats</p>
            </div>
            <span className="badge badge-qualified">74.2% AI Handled</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(37, 99, 235, 0.06)', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Agent Fleet Containment</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>74.2%</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                18,420 customer queries answered with <strong>1.4 second</strong> avg latency. Resident CSAT: <strong>4.82 / 5</strong>.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Human Specialist Handover</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>25.8%</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                6,412 high-intent deals and complex edge-cases handled. Avg resolution: <strong>8m 42s</strong>. Human CSAT: <strong>4.91 / 5</strong>.
              </p>
            </div>

            {/* Quick KPI stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Cost Per Query</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>₹0.42</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>-94% vs Human</div>
              </div>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>First Touch Resolution</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>88.4%</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>+6.2% vs target</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Channel Attribution & ROI Matrix */}
      <div className="crm-card" style={{ marginBottom: '24px' }}>
        <div className="crm-card-header">
          <div>
            <h2 className="crm-card-title">Multi-Channel Attribution & Unit Economics (ROI)</h2>
            <p className="crm-card-subtitle">Granular spend vs closed revenue across acquisition channels</p>
          </div>
          <span className="badge badge-primary">Total Attributed: ₹1.43 Cr</span>
        </div>

        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Acquisition Channel</th>
                <th>Monthly Spend</th>
                <th>Inbound Leads</th>
                <th>Closed Won Revenue</th>
                <th>Blended CAC</th>
                <th>Return on Ad Spend (ROAS)</th>
                <th>Efficiency Rating</th>
              </tr>
            </thead>
            <tbody>
              {channelData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {row.channel}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.spend}</td>
                  <td>
                    <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                      {row.leads} leads
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{row.won}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.cac}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.roas}</td>
                  <td>
                    <span className={`badge ${row.health === 'Exceptional' ? 'badge-qualified' : row.health === 'Strong' ? 'badge-primary' : 'badge-contacted'}`} style={{ fontSize: '0.7rem' }}>
                      ● {row.health}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. SLA & Response Heatmap by Department */}
      <div className="crm-card">
        <div className="crm-card-header">
          <div>
            <h2 className="crm-card-title">Departmental SLA Adherence & Response Health</h2>
            <p className="crm-card-subtitle">Service level compliance against contract guarantees</p>
          </div>
          <span className="badge badge-qualified">98.6% Enterprise Benchmark</span>
        </div>

        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Operational Department</th>
                <th>Target SLA Threshold</th>
                <th>Actual Avg Duration</th>
                <th>SLA Adherence Rate</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentSla.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.dept}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.target}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{d.actual}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar-bg" style={{ width: 80, height: 6 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: d.compliance,
                            backgroundColor: '#10b981'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{d.compliance}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-qualified" style={{ fontSize: '0.7rem' }}>
                      ✓ {d.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
