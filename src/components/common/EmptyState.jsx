import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

export function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'Get started by creating your first entry.',
  actionLabel = null,
  onAction = null
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.01)',
        borderRadius: '12px',
        border: '1px dashed rgba(255, 255, 255, 0.1)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '600', color: '#f1f5f9' }}>
        {title}
      </h4>
      <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#94a3b8', maxWidth: '360px', lineHeight: '1.4' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
          }}
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
