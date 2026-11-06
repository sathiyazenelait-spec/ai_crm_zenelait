import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Calendar as CalendarIcon, Clock, Plus, Video, MapPin, User, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export function CalendarView() {
  const { appointments, setActiveModal, addNotification, aiEmployeesList } = useCRM();
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [selectedDay, setSelectedDay] = useState(3); // Oct 3

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="calendar-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Calendar & Appointments</h1>
          <p>Schedule product demos, client discovery meetings, and internal syncs</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActiveModal('scheduleAppointment')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>+ Schedule Meeting</span>
        </button>
      </div>

      {/* AI Smart Calendar & Appointment Assistant Banner */}
      <div
        className="crm-card"
        style={{
          padding: '14px 20px',
          marginBottom: '18px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
              fontSize: '1.2rem'
            }}
          >
            {aiEmployeesList?.find(e => e.roleCategory === 'APPOINTMENTS')?.avatar || '📅'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {aiEmployeesList?.find(e => e.roleCategory === 'APPOINTMENTS')?.name || 'AI Calendar Coordinator'} • Autonomous Meeting Assistant
              </strong>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>24/7 Slot Sync</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Eliminates scheduling back-and-forth by auto-negotiating time slots, provisioning Google Meet video links, and sending pre-meeting WhatsApp reminders.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            addNotification?.({
              type: 'crm',
              title: '⚡ AI Calendar Coordinator Dispatched 2-Hour Reminders & Synced Slots',
              category: 'Appointments'
            });
          }}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <Sparkles size={14} />
          <span>⚡ AI Auto-Confirm & WhatsApp Reminder Dispatch</span>
        </button>
      </div>

      {/* Calendar & Agenda Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '20px' }}>
        
        {/* Left: Interactive Calendar Grid Card */}
        <div className="crm-card" style={{ padding: '24px' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>October 2026</h2>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-secondary btn-icon btn-xs"><ChevronLeft size={14} /></button>
                <button className="btn btn-secondary btn-icon btn-xs"><ChevronRight size={14} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {['month', 'week', 'day'].map((m) => (
                <button
                  key={m}
                  className={`btn btn-xs ${viewMode === m ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode(m)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Days Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
            {daysOfWeek.map((d) => (
              <div key={d} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Offset for Thursday Oct 1 */}
            <div style={{ height: '70px', backgroundColor: 'transparent' }} />
            <div style={{ height: '70px', backgroundColor: 'transparent' }} />
            <div style={{ height: '70px', backgroundColor: 'transparent' }} />
            <div style={{ height: '70px', backgroundColor: 'transparent' }} />

            {calendarDays.map((d) => {
              const isSelected = selectedDay === d;
              const hasEvents = d === 3 || d === 5 || d === 8;

              return (
                <div
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  style={{
                    height: '70px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                    {d}
                  </div>
                  {hasEvents && (
                    <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '1px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d === 3 ? '3 Meetings' : 'Demo Call'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date Agenda */}
        <div className="crm-card" style={{ padding: '24px' }}>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Selected Date Agenda</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0 0 0' }}>
              Friday, Oct {selectedDay}, 2026
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {appointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  borderLeft: '4px solid var(--primary)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{apt.type}</span>
                  <span className="badge badge-qualified" style={{ fontSize: '0.65rem' }}>{apt.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {apt.customer} • {apt.company}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} />
                    <span>{apt.dateTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={13} />
                    <span>{apt.platform || 'Google Meet / Zoom'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} />
                    <span>Host: {apt.host}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
