import React from 'react';

export function LoadingState({ message = 'Loading data...', rows = 3 }) {
  return (
    <div style={{ padding: '32px 20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '500' }}>{message}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '48px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        ))}
      </div>
    </div>
  );
}
