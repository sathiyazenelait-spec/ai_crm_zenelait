import React from 'react';
import { Globe, MessageSquare, Mail, Phone, Share2 } from 'lucide-react';

function InstagramIcon({ size = 13, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function ChannelBadge({ channel }) {
  const getChannelConfig = (ch) => {
    const lower = (ch || '').toLowerCase();
    if (lower.includes('website') || lower.includes('web')) {
      return { icon: Globe, label: 'Website', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
    }
    if (lower.includes('whatsapp')) {
      return { icon: MessageSquare, label: 'WhatsApp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
    if (lower.includes('email') || lower.includes('mail')) {
      return { icon: Mail, label: 'Email', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    }
    if (lower.includes('instagram') || lower.includes('ig')) {
      return { icon: InstagramIcon, label: 'Instagram', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' };
    }
    if (lower.includes('referral')) {
      return { icon: Share2, label: 'Referral', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' };
    }
    return { icon: Phone, label: ch || 'Direct', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' };
  };

  const config = getChannelConfig(channel);
  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`
      }}
    >
      <Icon size={13} color={config.color} />
      {config.label}
    </span>
  );
}
