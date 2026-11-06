import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  statusCode = null,
  onRetry = null
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <AlertTriangle size={26} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#f87171' }}>
          {title}
        </h4>
        {statusCode && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}
          >
            HTTP {statusCode}
          </span>
        )}
      </div>

      <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#94a3b8', maxWidth: '420px', lineHeight: '1.4' }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          Retry Request
        </button>
      )}
    </div>
  );
}
