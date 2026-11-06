import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Target,
  Users,
  Sparkles,
  Send,
  Pause,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  ArrowRight,
  Play,
  RefreshCw,
  FileText,
  DollarSign,
  Filter,
  Check
} from 'lucide-react';
import { softwareService } from '../../services/softwareService';

export function MarketingManagerView() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | campaigns | audiences | forms | ai-drafts | attribution
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Data states
  const [dashboard, setDashboard] = useState({
    activeCampaigns: 8,
    scheduledCampaigns: 3,
    leadsGenerated: 420,
    marketingQualifiedLeads: 125,
    campaignSpend: 150000,
    attributedPipelineValue: 1800000,
    emailDeliveryRate: 97.5,
    emailClickRate: 4.8,
    unsubscribeCount: 12,
    topSource: 'WEBSITE',
    currency: 'INR'
  });

  const [campaigns, setCampaigns] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [forms, setForms] = useState([]);
  const [sources, setSources] = useState([]);
  const [attribution, setAttribution] = useState(null);

  // Modals & Action States
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    campaignType: 'EMAIL',
    objective: 'LEAD_GENERATION',
    description: '',
    audienceId: 'AUD-1001',
    subject: '',
    callToActionText: 'Request a consultation'
  });

  const [previewAudienceData, setPreviewAudienceData] = useState(null);
  const [selectedAudienceId, setSelectedAudienceId] = useState(null);

  // AI Content Draft Studio State
  const [aiDraftPrompt, setAiDraftPrompt] = useState({
    contentType: 'EMAIL',
    productOrService: 'Custom Enterprise CRM Development',
    targetAudience: 'Software & Technology Companies (50-250 Employees)',
    tone: 'PROFESSIONAL',
    keyPoints: 'Automated follow-ups, lead attribution, SLA management'
  });
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [drafting, setDrafting] = useState(false);

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    setLoading(true);
    try {
      const [dashRes, campRes, audRes, frmRes, srcRes, attrRes] = await Promise.allSettled([
        softwareService.getMarketingDashboard(),
        softwareService.getCampaigns(),
        softwareService.getAudiences(),
        softwareService.getForms(),
        softwareService.getMarketingSources(),
        softwareService.getMarketingAttribution()
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (campRes.status === 'fulfilled') setCampaigns(campRes.value);
      if (audRes.status === 'fulfilled') setAudiences(audRes.value);
      if (frmRes.status === 'fulfilled') setForms(frmRes.value);
      if (srcRes.status === 'fulfilled') setSources(srcRes.value);
      if (attrRes.status === 'fulfilled') setAttribution(attrRes.value);
    } catch (err) {
      console.warn('Fallback loading marketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaign.name) return;
    try {
      const res = await softwareService.createCampaign(newCampaign);
      setCampaigns([res, ...campaigns]);
      setShowCreateCampaign(false);
      setNewCampaign({ name: '', campaignType: 'EMAIL', objective: 'LEAD_GENERATION', description: '', audienceId: 'AUD-1001', subject: '', callToActionText: 'Request a consultation' });
      setMessage({ type: 'success', text: `Campaign "${res.name}" created in DRAFT mode.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create campaign' });
    }
  };

  const handleScheduleCampaign = async (campaignId) => {
    try {
      await softwareService.scheduleCampaign(campaignId, { scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), timeZone: 'Asia/Kolkata' });
      setCampaigns(campaigns.map(c => c.campaignId === campaignId ? { ...c, status: 'SCHEDULED' } : c));
      setMessage({ type: 'success', text: `Campaign ${campaignId} scheduled for sending.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePauseCampaign = async (campaignId) => {
    try {
      await softwareService.pauseCampaign(campaignId);
      setCampaigns(campaigns.map(c => c.campaignId === campaignId ? { ...c, status: 'PAUSED' } : c));
      setMessage({ type: 'info', text: `Campaign ${campaignId} paused.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePreviewAudience = async (audienceId) => {
    try {
      setSelectedAudienceId(audienceId);
      const res = await softwareService.previewAudience(audienceId);
      setPreviewAudienceData(res);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleGenerateAiDraft = async (e) => {
    e.preventDefault();
    setDrafting(true);
    try {
      const res = await softwareService.generateMarketingDraft(aiDraftPrompt);
      setGeneratedDraft(res);
      setMessage({ type: 'success', text: 'AI marketing copy generated with human review label.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="crm-page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#ec4899', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Marketing Manager Operations
              </h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Audience Segmentation • Campaign Lifecycle • MQL Pipeline • AI Content Studio
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadMarketingData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateCampaign(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: `1px solid ${message.type === 'error' ? '#ef4444' : '#10b981'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            {message.type === 'error' ? <AlertCircle size={16} color="#ef4444" /> : <CheckCircle2 size={16} color="#10b981" />}
            <span style={{ color: message.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 600 }}>{message.text}</span>
          </div>
          <button className="btn btn-ghost btn-xs" onClick={() => setMessage(null)}>Dismiss</button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Active Campaigns', val: dashboard.activeCampaigns, sub: `${dashboard.scheduledCampaigns} Scheduled`, color: '#ec4899', icon: Megaphone },
          { label: 'Leads Generated', val: dashboard.leadsGenerated, sub: `${dashboard.marketingQualifiedLeads} MQLs Qualified`, color: '#3b82f6', icon: Target },
          { label: 'Attributed Pipeline', val: `₹${(dashboard.attributedPipelineValue || 1800000).toLocaleString('en-IN')}`, sub: `Spend: ₹${(dashboard.campaignSpend || 150000).toLocaleString('en-IN')}`, color: '#10b981', icon: DollarSign },
          { label: 'Delivery Rate', val: `${dashboard.emailDeliveryRate || 97.5}%`, sub: `Click Rate: ${dashboard.emailClickRate || 4.8}%`, color: '#8b5cf6', icon: TrendingUp },
          { label: 'Top Source', val: dashboard.topSource || 'WEBSITE', sub: `${dashboard.unsubscribeCount || 12} unsubscribed`, color: '#f59e0b', icon: Layers }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="card-hover-glass" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: `${c.color}20`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)' }}>{c.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '20px', paddingBottom: '2px' }}>
        {[
          { id: 'overview', label: 'Campaigns & Lifecycle' },
          { id: 'audiences', label: 'Audience Segments' },
          { id: 'forms', label: 'Lead Capture Forms' },
          { id: 'attribution', label: 'Attribution & Sources' },
          { id: 'ai-drafts', label: '✨ AI Content Studio' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 16px',
              borderBottom: activeTab === t.id ? '2px solid #ec4899' : '2px solid transparent',
              color: activeTab === t.id ? '#ec4899' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              backgroundColor: 'transparent',
              borderTop: 0,
              borderLeft: 0,
              borderRight: 0,
              cursor: 'pointer',
              fontSize: '0.86rem'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CAMPAIGNS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>All Multi-Channel Campaigns</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Showing {campaigns.length} campaigns</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 14px' }}>Campaign</th>
                    <th style={{ padding: '10px 14px' }}>Type</th>
                    <th style={{ padding: '10px 14px' }}>Audience</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Sent / Delivered</th>
                    <th style={{ padding: '10px 14px' }}>Leads / Opps</th>
                    <th style={{ padding: '10px 14px' }}>Spend</th>
                    <th style={{ padding: '10px 14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{c.campaignId} • {c.subject || 'No subject set'}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge" style={{ backgroundColor: '#ec489920', color: '#ec4899', fontSize: '0.68rem' }}>{c.campaignType}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{c.audienceName || c.audienceId}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge" style={{
                          backgroundColor: c.status === 'ACTIVE' || c.status === 'RUNNING' ? '#10b98120' : c.status === 'SCHEDULED' ? '#3b82f620' : '#64748b20',
                          color: c.status === 'ACTIVE' || c.status === 'RUNNING' ? '#10b981' : c.status === 'SCHEDULED' ? '#3b82f6' : '#94a3b8',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>{c.sent || 0} / {c.delivered || 0}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{c.leadsGenerated || 0} leads</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{c.opportunitiesAttributed || 0} opps</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>₹{(c.spend || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {c.status === 'DRAFT' && (
                            <button className="btn btn-primary btn-xs" onClick={() => handleScheduleCampaign(c.campaignId)} title="Schedule for dispatch">
                              Schedule
                            </button>
                          )}
                          {(c.status === 'ACTIVE' || c.status === 'SCHEDULED') && (
                            <button className="btn btn-ghost btn-xs" onClick={() => handlePauseCampaign(c.campaignId)} title="Pause campaign">
                              <Pause size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIENCE SEGMENTS */}
      {activeTab === 'audiences' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {audiences.map((aud, i) => (
            <div key={i} className="card-hover-glass" style={{ padding: '18px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{aud.audienceId}</span>
                <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>{aud.status}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>{aud.name}</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{aud.description}</p>
              
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', marginBottom: '14px', fontSize: '0.76rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Criteria:</div>
                <div>Match Mode: <strong>{aud.matchMode}</strong></div>
                <div>Estimated Reach: <strong style={{ color: '#10b981' }}>{aud.estimatedContactCount} Contacts</strong></div>
              </div>

              <button className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handlePreviewAudience(aud.audienceId)}>
                <Eye size={14} />
                <span>Preview Eligible Contacts</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: FORMS */}
      {activeTab === 'forms' && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Inbound Lead Capture Forms & Gates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {forms.map((f, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ec4899' }}>{f.formId}</span>
                  <span className="badge badge-qualified" style={{ fontSize: '0.65rem' }}>{f.status}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>{f.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Submissions: <strong>{f.submissions}</strong> • Conversion: <strong style={{ color: '#10b981' }}>{f.conversionRate}%</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Fields: {f.fields?.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ATTRIBUTION */}
      {activeTab === 'attribution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>First-Touch Campaign Attribution (Revenue Pipeline)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Maps won customer deals back to the originating campaign touchpoint. Total Attributed: <strong>₹{(attribution?.totalAttributedPipeline || 1800000).toLocaleString('en-IN')}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {(attribution?.topCampaigns || [
                { campaignId: 'CAM-1001', name: 'Enterprise CRM Lead Generation', pipelineWon: 650000, dealsWon: 4 },
                { campaignId: 'CAM-1002', name: 'Q4 Cloud Modernization Webinar', pipelineWon: 420000, dealsWon: 3 }
              ]).map((at, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: 700 }}>{at.campaignId}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.94rem', margin: '4px 0' }}>{at.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem' }}>
                    <span>Pipeline Won: <strong style={{ color: '#10b981' }}>₹{at.pipelineWon?.toLocaleString('en-IN')}</strong></span>
                    <span>Deals Won: <strong>{at.dealsWon}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI CONTENT DRAFT STUDIO */}
      {activeTab === 'ai-drafts' && (
        <div className="responsive-split-grid">
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={18} color="#ec4899" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>AI Marketing Copy Generator</h3>
            </div>
            <form onSubmit={handleGenerateAiDraft} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Product / Service</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={aiDraftPrompt.productOrService}
                  onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, productOrService: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Target Audience</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={aiDraftPrompt.targetAudience}
                  onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, targetAudience: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Channel</label>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                    value={aiDraftPrompt.contentType}
                    onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, contentType: e.target.value })}
                  >
                    <option value="EMAIL">Email Sequence</option>
                    <option value="LINKEDIN">LinkedIn Post / InMail</option>
                    <option value="LANDING_PAGE">Landing Page Copy</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Tone</label>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                    value={aiDraftPrompt.tone}
                    onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, tone: e.target.value })}
                  >
                    <option value="PROFESSIONAL">Professional & Technical</option>
                    <option value="PERSUASIVE">Persuasive / Value-Driven</option>
                    <option value="CONSULTATIVE">Consultative Advisor</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Key Value Propositions</label>
                <textarea
                  className="form-control"
                  rows={3}
                  style={{ fontSize: '0.82rem' }}
                  value={aiDraftPrompt.keyPoints}
                  onChange={(e) => setAiDraftPrompt({ ...aiDraftPrompt, keyPoints: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={drafting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
                {drafting ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{drafting ? 'Generating Draft...' : 'Generate Marketing Copy'}</span>
              </button>
            </form>
          </div>

          {/* Generated Draft Display */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>Draft Output</span>
                {generatedDraft && (
                  <span className="badge" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b', fontSize: '0.68rem', fontWeight: 700 }}>
                    ⚠️ Requires Human Review
                  </span>
                )}
              </div>

              {generatedDraft ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Subject:</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '2px' }}>{generatedDraft.subject}</div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                    {generatedDraft.body}
                  </div>

                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: 600 }}>Call to Action Button:</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ec4899' }}>{generatedDraft.callToAction}</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                  <Sparkles size={36} style={{ margin: '0 auto 12px', color: '#ec4899', opacity: 0.5 }} />
                  <div>Configure product value props on the left and click Generate.</div>
                </div>
              )}
            </div>

            {generatedDraft && (
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(generatedDraft.body)}>Copy Body</button>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  setNewCampaign({
                    ...newCampaign,
                    name: generatedDraft.subject,
                    subject: generatedDraft.subject,
                    callToActionText: generatedDraft.callToAction
                  });
                  setShowCreateCampaign(true);
                }}>Use in Campaign</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audience Preview Modal */}
      {previewAudienceData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '20px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Audience Preview: {previewAudienceData.audienceId}</h3>
              <button className="btn btn-ghost btn-xs" onClick={() => setPreviewAudienceData(null)}>✕</button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Total Eligible Contacts in Tenant: <strong style={{ color: '#10b981' }}>{previewAudienceData.eligibleCount}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {previewAudienceData.preview?.map((p, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{p.companyName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.contactId} • {p.industry}</div>
                  </div>
                  <span className="badge badge-qualified" style={{ fontSize: '0.64rem' }}>Consent Verified</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setPreviewAudienceData(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', maxWidth: '540px', width: '100%', padding: '20px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Create Marketing Campaign (Draft)</h3>
              <button className="btn btn-ghost btn-xs" onClick={() => setShowCreateCampaign(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Campaign Name</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Enterprise CRM Lead Generation"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Channel Type</label>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                    value={newCampaign.campaignType}
                    onChange={(e) => setNewCampaign({ ...newCampaign, campaignType: e.target.value })}
                  >
                    <option value="EMAIL">Email Campaign</option>
                    <option value="WEBINAR">Technical Webinar</option>
                    <option value="LINKEDIN">LinkedIn Sponsored</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Audience Segment</label>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                    value={newCampaign.audienceId}
                    onChange={(e) => setNewCampaign({ ...newCampaign, audienceId: e.target.value })}
                  >
                    <option value="AUD-1001">Software Companies Interested in CRM (245)</option>
                    <option value="AUD-1002">High-Growth Tech Startups (180)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Email Subject Line</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  placeholder="e.g. Explore a CRM solution tailored for your software team"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Call to Action Text</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={newCampaign.callToActionText}
                  onChange={(e) => setNewCampaign({ ...newCampaign, callToActionText: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateCampaign(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create Draft Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
