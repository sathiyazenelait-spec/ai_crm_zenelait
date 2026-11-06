import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, change, period, isPositive, icon: Icon, color = 'blue' }) {
  const getColorStyle = (c) => {
    switch (c) {
      case 'blue':
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' };
      case 'emerald':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' };
      case 'purple':
        return { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' };
      case 'rose':
        return { bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e' };
      case 'cyan':
        return { bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' };
    }
  };

  const cStyle = getColorStyle(color);

  return (
    <div className="metric-card">
      <div className="metric-icon-box" style={{ backgroundColor: cStyle.bg, color: cStyle.color }}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="metric-card-content">
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value}</div>
        <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{change}</span>
          <span className="metric-period">{period}</span>
        </div>
      </div>
    </div>
  );
}
