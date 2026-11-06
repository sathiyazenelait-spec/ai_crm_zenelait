import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import {
  Megaphone,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Sparkles,
  Share2,
  PieChart,
  MousePointerClick,
  Eye,
  ArrowUpRight,
  Zap,
  BarChart2,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';

export function MarketingDashboard() {
  const {
    companyProfile,
    currentUserName,
    activeIndustryId,
    currentIndustry,
    navigateTo,
    setActiveModal,
    addNotification
  } = useCRM();

  const [activeDripToggles, setActiveDripToggles] = useState({
    'drip-1': true,
    'drip-2': true,
    'drip-3': false
  });

  // Industry-tailored Marketing KPIs and Channel Attribution
  const getMarketingData = () => {
    switch (activeIndustryId) {
      case 'real_estate':
        return {
          kpis: {
            inboundLeads: { value: '412 Leads', change: '+32%', period: 'this month', isPositive: true },
            avgCpl: { value: '₹420', change: '-18%', period: 'cost per qualified lead', isPositive: true },
            roas: { value: '14.2x', change: '+2.8x', period: 'campaign ROAS', isPositive: true },
            dripConversion: { value: '28.4%', change: '+4.2%', period: 'lead-to-site-visit rate', isPositive: true }
          },
          channels: [
            { name: 'Meta (Instagram & FB Ads)', visitors: '14,200', leads: 184, cpl: '₹380', roas: '15.4x', share: '45%' },
            { name: 'Google Search Ads', visitors: '8,400', leads: 122, cpl: '₹510', roas: '16.8x', share: '30%' },
            { name: 'WhatsApp Click-to-Chat', visitors: '4,100', leads: 74, cpl: '₹220', roas: '12.0x', share: '18%' },
            { name: 'Property Portals (99Acres)', visitors: '2,800', leads: 32, cpl: '₹680', roas: '9.5x', share: '7%' }
          ],
          drips: [
            { id: 'drip-1', name: 'Luxury Penthouse Virtual Tour Nurture', channel: 'WhatsApp + Email', sent: '1,240', openRate: '78%', replyRate: '34%' },
            { id: 'drip-2', name: 'Price Drop & Early Bird Pre-Launch Alert', channel: 'WhatsApp Broadcast', sent: '3,800', openRate: '92%', replyRate: '48%' },
            { id: 'drip-3', name: 'NRI Investor Quarterly Newsletter', channel: 'Email Sequence', sent: '890', openRate: '45%', replyRate: '12%' }
          ]
        };
      case 'hospitals':
        return {
          kpis: {
            inboundLeads: { value: '620 Inquiries', change: '+24%', period: 'this month', isPositive: true },
            avgCpl: { value: '₹140', change: '-22%', period: 'cost per OPD inquiry', isPositive: true },
            roas: { value: '9.6x', change: '+1.4x', period: 'campaign ROAS', isPositive: true },
            dripConversion: { value: '42.0%', change: '+5.5%', period: 'inquiry-to-booking rate', isPositive: true }
          },
          channels: [
            { name: 'Google Local & Search (Cardio/Ortho)', visitors: '18,500', leads: 310, cpl: '₹120', roas: '11.2x', share: '50%' },
            { name: 'Preventive Health Camp Ads (Meta)', visitors: '12,000', leads: 190, cpl: '₹160', roas: '8.4x', share: '31%' },
            { name: 'WhatsApp Appointment Bot', visitors: '6,400', leads: 120, cpl: '₹65', roas: '14.0x', share: '19%' }
          ],
          drips: [
            { id: 'drip-1', name: 'Annual Cardiac Wellness Checkup Reminder', channel: 'WhatsApp', sent: '2,400', openRate: '88%', replyRate: '41%' },
            { id: 'drip-2', name: 'Post-Op Care & Physiotherapy Guide', channel: 'Email + SMS', sent: '620', openRate: '94%', replyRate: '28%' }
          ]
        };
      case 'financial_services':
        return {
          kpis: {
            inboundLeads: { value: '285 Applications', change: '+45%', period: 'this month', isPositive: true },
            avgCpl: { value: '₹340', change: '-15%', period: 'cost per loan application', isPositive: true },
            roas: { value: '18.4x', change: '+3.2x', period: 'disbursement ROAS', isPositive: true },
            dripConversion: { value: '31.2%', change: '+6.1%', period: 'application-to-sanction', isPositive: true }
          },
          channels: [
            { name: 'Google Ads (MSME Working Capital)', visitors: '9,200', leads: 135, cpl: '₹380', roas: '22.0x', share: '48%' },
            { name: 'LinkedIn B2B Promoter Ads', visitors: '4,500', leads: 82, cpl: '₹420', roas: '16.5x', share: '29%' },
            { name: 'Financial Referral Drips', visitors: '3,100', leads: 68, cpl: '₹180', roas: '14.2x', share: '23%' }
          ],
          drips: [
            { id: 'drip-1', name: 'Instant EMI Calculator Drip Sequence', channel: 'WhatsApp Bot', sent: '1,850', openRate: '86%', replyRate: '49%' },
            { id: 'drip-2', name: 'Pre-Approved Loan Sanction Expiry Notice', channel: 'SMS + WhatsApp', sent: '410', openRate: '95%', replyRate: '62%' }
          ]
        };
      default: // software_it & others
        return {
          kpis: {
            inboundLeads: { value: '540 MQLs', change: '+28%', period: 'this month', isPositive: true },
            avgCpl: { value: '$38.50', change: '-14%', period: 'cost per qualified demo', isPositive: true },
            roas: { value: '8.4x', change: '+1.6x', period: 'pipeline ROI', isPositive: true },
            dripConversion: { value: '22.6%', change: '+3.8%', period: 'trial-to-paid conversion', isPositive: true }
          },
          channels: [
            { name: 'Google Search Ads (CRM & AI keywords)', visitors: '22,400', leads: 245, cpl: '$32.00', roas: '9.2x', share: '45%' },
            { name: 'LinkedIn B2B Sponsored Content', visitors: '11,200', leads: 160, cpl: '$48.00', roas: '8.1x', share: '30%' },
            { name: 'ProductHunt & Tech Directory Inbound', visitors: '6,800', leads: 85, cpl: '$18.00', roas: '11.0x', share: '16%' },
            { name: 'Organic SEO & Tech Blogs', visitors: '8,900', leads: 50, cpl: '$0.00', roas: 'Infinite', share: '9%' }
          ],
          drips: [
            { id: 'drip-1', name: '14-Day Enterprise SaaS Trial Onboarding', channel: 'Email Sequence', sent: '1,820', openRate: '64%', replyRate: '28%' },
            { id: 'drip-2', name: 'AI WhatsApp Omnichannel Feature Announcement', channel: 'In-App + Email', sent: '4,100', openRate: '72%', replyRate: '35%' },
            { id: 'drip-3', name: 'Stalled Deal Re-activation with 15% Promo', channel: 'WhatsApp Broadcast', sent: '340', openRate: '88%', replyRate: '44%' }
          ]
        };
    }
  };

  const marketingData = getMarketingData();

  const toggleDrip = (id) => {
    setActiveDripToggles((prev) => {
      const updated = !prev[id];
      addNotification({
        type: 'system',
        title: updated ? 'AI Drip Campaign Activated 🚀' : 'Campaign Paused',
        category: 'Marketing'
      });
      return { ...prev, [id]: updated };
    });
  };

  return (
    <div className="marketing-dashboard">
      {/* Title Bar */}
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontWeight: 700 }}>
              Marketing & Growth Hub
            </span>
            <span className="badge" style={{ backgroundColor: companyProfile.color ? `${companyProfile.color}22` : 'rgba(37,99,235,0.12)', color: companyProfile.color || '#2563eb' }}>
              {companyProfile.name}
            </span>
          </div>
          <h1>Multi-Channel Attribution & Campaign Engine</h1>
          <p>Real-time lead attribution, ROAS tracking, CPL benchmarks, and automated AI drip funnels</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('templates')}>
            <Sparkles size={15} />
            <span>AI Campaign Templates</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('addAutomation')}>
            <Megaphone size={15} />
            <span>+ Launch New Campaign</span>
          </button>
        </div>
      </div>

      {/* 4 Marketing KPIs */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Inbound Leads"
          value={marketingData.kpis.inboundLeads.value}
          change={marketingData.kpis.inboundLeads.change}
          period={marketingData.kpis.inboundLeads.period}
          isPositive={marketingData.kpis.inboundLeads.isPositive}
          icon={Target}
          color="pink"
        />
        <StatCard
          title="Blended Cost Per Lead (CPL)"
          value={marketingData.kpis.avgCpl.value}
          change={marketingData.kpis.avgCpl.change}
          period={marketingData.kpis.avgCpl.period}
          isPositive={marketingData.kpis.avgCpl.isPositive}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Campaign Return (ROAS)"
          value={marketingData.kpis.roas.value}
          change={marketingData.kpis.roas.change}
          period={marketingData.kpis.roas.period}
          isPositive={marketingData.kpis.roas.isPositive}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="AI Drip Conversion"
          value={marketingData.kpis.dripConversion.value}
          change={marketingData.kpis.dripConversion.change}
          period={marketingData.kpis.dripConversion.period}
          isPositive={marketingData.kpis.dripConversion.isPositive}
          icon={Zap}
          color="blue"
        />
      </div>

      {/* 2-Column Section: Lead Attribution Table + Active AI Drips */}
      <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
        {/* Left Column: Attribution by Acquisition Channel */}
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Channel Attribution & ROAS</h3>
            </div>
            <span className="badge badge-lead-captured">Live Tracking</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Channel Source</th>
                  <th>Traffic</th>
                  <th>Leads</th>
                  <th>CPL</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {marketingData.channels.map((ch, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{ch.name}</td>
                    <td>{ch.visitors}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', fontWeight: 700 }}>
                        {ch.leads}
                      </span>
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{ch.cpl}</td>
                    <td>
                      <strong style={{ color: '#8b5cf6' }}>{ch.roas}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Automated AI Drip Campaigns */}
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#ec4899' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Automated AI Nurture Drips</h3>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('workflows')}>
              <span>View All Workflows</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {marketingData.drips.map((drip) => {
              const isActive = activeDripToggles[drip.id] ?? true;
              return (
                <div
                  key={drip.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    border: `1px solid ${isActive ? 'rgba(236, 72, 153, 0.25)' : 'var(--border)'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{drip.name}</div>
                    <button
                      onClick={() => toggleDrip(drip.id)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        borderRadius: '999px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        backgroundColor: isActive ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff'
                      }}
                    >
                      {isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Channel: <strong style={{ color: 'var(--text-main)' }}>{drip.channel}</strong> • Dispatched: <strong>{drip.sent}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Open Rate: </span>
                      <strong style={{ color: '#10b981' }}>{drip.openRate}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Engagement / Reply: </span>
                      <strong style={{ color: 'var(--primary)' }}>{drip.replyRate}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
