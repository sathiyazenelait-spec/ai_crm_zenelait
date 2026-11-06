import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Sparkles,
  ArrowRight,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export function IndustryWorkflowView() {
  const { currentIndustry, industryPresets, switchIndustry, approveFinancialAction, approvalQueue } = useCRM();
  const [simStep, setSimStep] = useState(null); // null or step number
  const [isSimulating, setIsSimulating] = useState(false);
  const [customInput, setCustomInput] = useState(currentIndustry.simulation?.sampleQuery || '');
  const [extractedData, setExtractedData] = useState(null);

  const startSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);
    setExtractedData(null);

    const stages = currentIndustry.workflowStages;
    let currentIdx = 1;

    const timer = setInterval(() => {
      currentIdx += 1;
      if (currentIdx <= stages.length) {
        setSimStep(currentIdx);
        if (currentIdx === 3) {
          setExtractedData(currentIndustry.simulation?.extractedEntities);
        }
      } else {
        clearInterval(timer);
        setIsSimulating(false);
      }
    }, 1200);
  };

  const resetSimulation = () => {
    setSimStep(null);
    setIsSimulating(false);
    setExtractedData(null);
  };

  return (
    <div>
      {/* Header Row */}
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              className="badge"
              style={{
                backgroundColor: currentIndustry.accentLight,
                color: currentIndustry.color,
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              {currentIndustry.shortName}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• End-to-End Workflow Architecture</span>
          </div>
          <h1>{currentIndustry.name} Workflow & AI Engine</h1>
          <p>{currentIndustry.description}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={resetSimulation}
            disabled={isSimulating || simStep === null}
          >
            <RotateCcw size={14} />
            <span>Reset Flow</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={startSimulation}
            disabled={isSimulating}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={14} className={isSimulating ? 'pulse' : ''} />
            <span>{isSimulating ? 'Simulating Pipeline...' : 'Run Live Workflow Test'}</span>
          </button>
        </div>
      </div>

      {/* Industry Switcher Strip */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '4px' }}>
            Switch Industry:
          </span>
          {Object.values(industryPresets).map((preset) => (
            <button
              key={preset.id}
              className={`btn btn-sm ${currentIndustry.id === preset.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                switchIndustry(preset.id);
                setSimStep(null);
                setCustomInput(preset.simulation?.sampleQuery || '');
              }}
              style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              {preset.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Regulated Approval Banner (if Financial Services) */}
      {currentIndustry.id === 'financial_services' && (
        <div
          className="crm-card"
          style={{
            marginBottom: '20px',
            borderLeft: '4px solid #059669',
            backgroundColor: 'rgba(5, 150, 105, 0.06)',
            padding: '16px 20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#059669', color: '#fff' }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Regulated Action Guardrails & Human Approval Mode Active
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  For compliance, credit underwriting and legal liability, autonomous AI cannot issue binding term sheets without authorized Human RM sign-off.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-warning" style={{ fontWeight: 600 }}>
                {approvalQueue.filter(a => a.status === 'Pending Approval').length} Actions Pending RM Review
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Visual Pipeline & Simulation Sandbox Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 380px', gap: '24px' }}>
        
        {/* Left Column: Visual Step-by-Step Flowchart */}
        <div className="crm-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: currentIndustry.color }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Autonomous Pipeline Architecture</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {currentIndustry.workflowStages.length} Continuous Stages
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            {currentIndustry.workflowStages.map((stage, idx) => {
              const isPast = simStep !== null && simStep > stage.step;
              const isCurrent = simStep === stage.step;
              const isPending = simStep !== null && simStep < stage.step;

              return (
                <div
                  key={stage.step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: isCurrent
                      ? `2px solid ${currentIndustry.color}`
                      : '1px solid var(--border)',
                    backgroundColor: isCurrent
                      ? currentIndustry.accentLight
                      : isPast
                      ? 'rgba(16, 185, 129, 0.06)'
                      : 'var(--bg-card)',
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrent ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                    position: 'relative'
                  }}
                >
                  {/* Step Number Bubble */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isPast
                        ? '#10b981'
                        : isCurrent
                        ? currentIndustry.color
                        : 'var(--border)',
                      color: isPast || isCurrent ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : stage.step}
                  </div>

                  {/* Stage Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {stage.title}
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.65rem',
                          backgroundColor:
                            stage.type === 'ai'
                              ? 'var(--primary-light)'
                              : stage.type === 'human'
                              ? 'rgba(245, 158, 11, 0.12)'
                              : stage.type === 'closed'
                              ? 'rgba(16, 185, 129, 0.12)'
                              : 'var(--bg-main)',
                          color:
                            stage.type === 'ai'
                              ? 'var(--primary)'
                              : stage.type === 'human'
                              ? '#f59e0b'
                              : stage.type === 'closed'
                              ? '#10b981'
                              : 'var(--text-secondary)',
                          fontWeight: 600
                        }}
                      >
                        {stage.actor}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {stage.desc}
                    </p>
                  </div>

                  {/* Action Icon / Status */}
                  <div>
                    {isCurrent && (
                      <span
                        className="badge badge-primary pulse"
                        style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        Processing...
                      </span>
                    )}
                    {isPast && (
                      <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Testing Playground & Extraction Sandbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Test Sandbox Card */}
          <div className="crm-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={18} style={{ color: currentIndustry.color }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Simulation Console</h3>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Customer Inquiry Prompt ({currentIndustry.shortName}):
              </label>
              <textarea
                rows={3}
                className="form-control"
                style={{ fontSize: '0.825rem', resize: 'vertical' }}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type customer message..."
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.825rem', marginBottom: '16px' }}
              onClick={startSimulation}
              disabled={isSimulating}
            >
              <Play size={14} />
              <span>{isSimulating ? 'Running Workflow...' : 'Execute Live Test'}</span>
            </button>

            {/* AI Response Output */}
            {simStep !== null && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Bot size={15} style={{ color: currentIndustry.color }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    AI Auto-Responder Output:
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                  {currentIndustry.simulation?.aiResponse}
                </p>
              </div>
            )}

            {/* Extracted Structured JSON Entities */}
            {extractedData && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                  Structured Requirement Extraction:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        borderBottom: '1px dashed var(--border)',
                        paddingBottom: '4px'
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', textAlign: 'right', maxWidth: '60%' }}>
                        {value.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Employees on this Workflow */}
          <div className="crm-card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700 }}>
              AI Employees Assigned ({currentIndustry.aiEmployees.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentIndustry.aiEmployees.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ fontSize: '1.2rem' }}>{agent.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{agent.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {agent.role}
                    </div>
                  </div>
                  <span className="badge badge-qualified" style={{ fontSize: '0.65rem' }}>
                    {agent.accuracy}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
