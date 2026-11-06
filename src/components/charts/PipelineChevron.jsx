import React from 'react';

export function PipelineChevron({ stages = [] }) {
  if (!stages || !Array.isArray(stages) || stages.length === 0) {
    return (
      <div className="pipeline-flow-container" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No pipeline stages active
      </div>
    );
  }

  const getStageColor = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: '#3b82f6' };
      case 'cyan':
        return { bg: 'linear-gradient(135deg, #0284c7, #06b6d4)', border: '#06b6d4' };
      case 'emerald':
        return { bg: 'linear-gradient(135deg, #059669, #10b981)', border: '#10b981' };
      case 'amber':
        return { bg: 'linear-gradient(135deg, #d97706, #f59e0b)', border: '#f59e0b' };
      case 'purple':
        return { bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: '#a855f7' };
      default:
        return { bg: 'linear-gradient(135deg, #4b5563, #6b7280)', border: '#6b7280' };
    }
  };

  return (
    <div className="pipeline-flow-container">
      {stages.map((stage, idx) => {
        const colorStyle = getStageColor(stage.color);
        return (
          <div key={stage.id} className="pipeline-step-item">
            <div className="pipeline-step-header">
              <span className="pipeline-badge-pill" style={{ background: colorStyle.bg }}>
                {stage.name}
              </span>
              <span className="pipeline-pct">{stage.percentage}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
              <span className="pipeline-count">{stage.count}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>leads</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
