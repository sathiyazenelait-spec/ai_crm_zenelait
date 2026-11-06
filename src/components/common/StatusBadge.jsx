import React from 'react';
import { CheckCircle2, Clock, Bot, UserCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

export function StatusBadge({ status }) {
  const getStatusStyle = (s) => {
    switch (s) {
      case 'Qualified':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '#10b98140', icon: CheckCircle2 };
      case 'Contacted':
        return { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '#06b6d440', icon: ArrowUpRight };
      case 'Proposal':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '#f59e0b40', icon: Clock };
      case 'New':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '#3b82f640', icon: AlertCircle };
      case 'In Progress':
        return { bg: 'rgba(139, 92, 246, 0.15)', color: '#a855f7', border: '#a855f740', icon: Clock };
      case 'AI Responded':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '#10b98140', icon: Bot };
      case 'Waiting':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '#f59e0b40', icon: Clock };
      case 'Human Handover':
        return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '#818cf840', icon: UserCheck };
      case 'Lead Captured':
        return { bg: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '#ec489940', icon: CheckCircle2 };
      case 'Confirmed':
      case 'Active':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '#10b98140', icon: CheckCircle2 };
      case 'Pending':
      case 'Paused':
        return { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '#eab30840', icon: Clock };
      case 'Enterprise':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '#3b82f640' };
      case 'SMB':
        return { bg: 'rgba(139, 92, 246, 0.15)', color: '#a855f7', border: '#a855f740' };
      case 'Startup':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '#10b98140' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: '#64748b40' };
    }
  };

  const style = getStatusStyle(status);
  const Icon = style.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap'
      }}
    >
      {Icon && <Icon size={12} />}
      {status}
    </span>
  );
}
