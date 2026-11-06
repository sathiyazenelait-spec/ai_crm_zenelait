import React, { useState } from 'react';

export function AreaTrendChart({ data }) {
  const [activePoint, setActivePoint] = useState(null);

  const width = 580;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(...data.map(d => d.leads), 70);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const yLeads = height - paddingY - (d.leads / maxVal) * chartHeight;
    const yConversions = height - paddingY - ((d.conversions * 8) / maxVal) * chartHeight;
    return { ...d, x, yLeads, yConversions };
  });

  const leadsPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yLeads}`, '');
  const conversionsPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yConversions}`, '');
  const leadsArea = `${leadsPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Leads</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Conversions</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - paddingY - ratio * chartHeight;
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        <path d={leadsArea} fill="url(#leadsGradient)" />

        {/* Lines */}
        <path d={leadsPath} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
        <path d={conversionsPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />

        {/* Interactive circles and labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.yLeads}
              r={activePoint === i ? 6 : 4}
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => setActivePoint(i)}
              onMouseLeave={() => setActivePoint(null)}
            />
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="11"
            >
              {p.day}
            </text>
          </g>
        ))}
      </svg>
      {activePoint !== null && (
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <strong>{points[activePoint].day}:</strong> {points[activePoint].leads} Leads, {points[activePoint].conversions} Conversions
        </div>
      )}
    </div>
  );
}
