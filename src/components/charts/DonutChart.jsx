import React, { useState } from 'react';

export function DonutChart({ data = [], totalCount = 0, centerLabel = 'Total Leads' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const radius = 68;
  const strokeWidth = 22;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let currentOffset = 0;
  const validData = Array.isArray(data) ? data : [];

  return (
    <div className="donut-chart-wrapper">
      <div style={{ position: 'relative', width: 170, height: 170 }}>
        <svg height={170} width={170} viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
          {validData.map((item, index) => {
            const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotationOffset = (currentOffset / 100) * 360;
            currentOffset += item.percentage;

            return (
              <circle
                key={item.name}
                stroke={item.color}
                fill="transparent"
                strokeWidth={hoveredIdx === index ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                style={{
                  strokeDashoffset,
                  transformOrigin: '50% 50%',
                  transform: `rotate(${rotationOffset}deg)`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                r={normalizedRadius}
                cx={85}
                cy={85}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {hoveredIdx !== null ? `${data[hoveredIdx].percentage}%` : totalCount}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {hoveredIdx !== null ? data[hoveredIdx].name : centerLabel}
          </span>
        </div>
      </div>

      <div className="donut-legend-list">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="donut-legend-item"
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              cursor: 'pointer',
              opacity: hoveredIdx === null || hoveredIdx === index ? 1 : 0.45,
              transition: 'opacity 0.2s ease'
            }}
          >
            <div className="donut-legend-left">
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  display: 'inline-block'
                }}
              />
              <span>{item.name}</span>
            </div>
            <span className="donut-legend-pct">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
