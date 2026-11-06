import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import { AreaTrendChart } from '../charts/AreaTrendChart';
import { DonutChart } from '../charts/DonutChart';
import {
  Users,
  Target,
  CheckCircle,
  IndianRupee,
  Download,
  Calendar,
  BarChart2,
  PieChart
} from 'lucide-react';

export function ReportsAnalyticsView() {
  const { metrics, leadSources, trendData } = useCRM();

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Reports & Analytics</h1>
          <p>Real-time analytics on lead conversions, acquisition sources, and revenue</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={14} />
            <span>Sep 28, 2026 - Oct 4, 2026</span>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => alert('Exporting comprehensive CRM report as CSV/PDF...')}
          >
            <Download size={15} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Leads"
          value={metrics.totalLeads.value}
          change={metrics.totalLeads.change}
          period={metrics.totalLeads.period}
          isPositive={true}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Qualified Leads"
          value={metrics.qualifiedLeads.value}
          change={metrics.qualifiedLeads.change}
          period={metrics.qualifiedLeads.period}
          isPositive={true}
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Conversions"
          value={metrics.conversions.value}
          change={metrics.conversions.change}
          period={metrics.conversions.period}
          isPositive={true}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          title="Pipeline Revenue"
          value="₹5,40,000"
          change="+48%"
          period="vs last month"
          isPositive={true}
          icon={IndianRupee}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        {/* Trend Area Chart */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
              <span>Leads & Conversions Trend</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Daily Volume</span>
          </div>
          <AreaTrendChart data={trendData} />
        </div>

        {/* Lead Sources Donut Chart */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <PieChart size={18} style={{ color: 'var(--primary)' }} />
              <span>Lead Acquisition Sources</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>248 Total</span>
          </div>
          <DonutChart data={leadSources} totalCount={248} />
        </div>
      </div>
    </div>
  );
}
