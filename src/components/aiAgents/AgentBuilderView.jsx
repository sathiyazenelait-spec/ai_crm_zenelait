import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Bot, Sparkles, Check, ArrowRight, ArrowLeft, Upload, MessageSquare, Globe, Mail, Shield } from 'lucide-react';

function InstagramIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function AgentBuilderView() {
  const { addAiAgent, navigateTo } = useCRM();
  const [step, setStep] = useState(1); // 1: Configure, 2: Knowledge, 3: Channels, 4: Review

  const [agentForm, setAgentForm] = useState({
    name: 'Tech Inbound SDR Bot',
    role: 'Lead Qualification & Demo Booking',
    systemPrompt: 'You are an elite Sales Development Representative for ABC Technologies. Qualify website visitors, assess technical requirements, and schedule product demos.',
    selectedDocs: ['Product Brochure.pdf', 'Pricing Plans.pdf', 'API Documentation.pdf'],
    channels: {
      website: true,
      whatsapp: true,
      email: true,
      instagram: false
    },
    tools: {
      createLead: true,
      calcScore: true,
      scheduleDemo: true,
      sendQuotation: false
    },
    humanHandover: true
  });

  const handleDeploy = () => {
    addAiAgent({
      name: agentForm.name,
      description: `${agentForm.role} • Active on ${Object.keys(agentForm.channels).filter(k => agentForm.channels[k]).join(', ')}`
    });
    navigateTo('ai-employees');
  };

  return (
    <div className="agent-builder-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>AI Agent Builder</h1>
          <p>Create and deploy custom autonomous AI employees with custom knowledge and tools</p>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '640px', margin: '0 auto' }}>
          {[
            { num: 1, label: 'Configure' },
            { num: 2, label: 'Knowledge' },
            { num: 3, label: 'Channels' },
            { num: 4, label: 'Review' }
          ].map((st, i) => (
            <div key={st.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: step >= st.num ? 'var(--primary)' : 'var(--border)',
                  color: step >= st.num ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                {st.num}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: step === st.num ? 700 : 500, color: step === st.num ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {st.label}
              </span>
              {i < 3 && <div style={{ width: '40px', height: '2px', backgroundColor: step > st.num ? 'var(--primary)' : 'var(--border)', margin: '0 8px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="crm-card" style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
        {/* STEP 1: Configure */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Step 1: Agent Role & Persona</h3>

            <div>
              <label className="form-label">Agent Name *</label>
              <input
                type="text"
                className="form-control"
                value={agentForm.name}
                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Role & Purpose *</label>
              <input
                type="text"
                className="form-control"
                value={agentForm.role}
                onChange={(e) => setAgentForm({ ...agentForm, role: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">System Instructions / AI Prompt</label>
              <textarea
                rows={4}
                className="form-control"
                value={agentForm.systemPrompt}
                onChange={(e) => setAgentForm({ ...agentForm, systemPrompt: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Allowed Tools & Actions</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agentForm.tools.createLead}
                    onChange={(e) => setAgentForm({ ...agentForm, tools: { ...agentForm.tools, createLead: e.target.checked } })}
                  />
                  <span>Create / Update Leads in CRM</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agentForm.tools.calcScore}
                    onChange={(e) => setAgentForm({ ...agentForm, tools: { ...agentForm.tools, calcScore: e.target.checked } })}
                  />
                  <span>Calculate Lead Fit Score (0-100)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agentForm.tools.scheduleDemo}
                    onChange={(e) => setAgentForm({ ...agentForm, tools: { ...agentForm.tools, scheduleDemo: e.target.checked } })}
                  />
                  <span>Schedule Google Meet / Zoom Demos</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agentForm.tools.sendQuotation}
                    onChange={(e) => setAgentForm({ ...agentForm, tools: { ...agentForm.tools, sendQuotation: e.target.checked } })}
                  />
                  <span>Send PDF Price Quotation</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Knowledge */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Step 2: Assign Knowledge Base</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Select documents and datasets the AI agent will use for semantic search and Q&A grounding.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Product Brochure.pdf', 'Pricing Plans.pdf', 'FAQ Document.pdf', 'API Documentation.pdf', 'Company Overview.docx'].map((doc) => (
                <label
                  key={doc}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc}</span>
                  <input
                    type="checkbox"
                    checked={agentForm.selectedDocs.includes(doc)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAgentForm({ ...agentForm, selectedDocs: [...agentForm.selectedDocs, doc] });
                      } else {
                        setAgentForm({ ...agentForm, selectedDocs: agentForm.selectedDocs.filter(d => d !== doc) });
                      }
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Channels */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Step 3: Deploy Channels</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agentForm.channels.website}
                  onChange={(e) => setAgentForm({ ...agentForm, channels: { ...agentForm.channels, website: e.target.checked } })}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Website Live Widget</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Embed JS snippet on domain</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agentForm.channels.whatsapp}
                  onChange={(e) => setAgentForm({ ...agentForm, channels: { ...agentForm.channels, whatsapp: e.target.checked } })}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>WhatsApp Business</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cloud API integration</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agentForm.channels.email}
                  onChange={(e) => setAgentForm({ ...agentForm, channels: { ...agentForm.channels, email: e.target.checked } })}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Email Inbound</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Auto-reply & thread drafting</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agentForm.channels.instagram}
                  onChange={(e) => setAgentForm({ ...agentForm, channels: { ...agentForm.channels, instagram: e.target.checked } })}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Instagram Direct</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DM auto-responder</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Deploy */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Step 4: Review & Deploy</h3>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                🤖 {agentForm.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                {agentForm.role}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>
                <strong>Knowledge Base:</strong> {agentForm.selectedDocs.join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* Step Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '18px', marginTop: '24px' }}>
          {step > 1 ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleDeploy}>
              <Sparkles size={14} /> Deploy AI Agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
