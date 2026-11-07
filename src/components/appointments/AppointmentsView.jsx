import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, Plus, Clock, Search, User, CheckCircle2 } from 'lucide-react';

export function AppointmentsView() {
  const { appointments, setActiveModal, addNotification } = useCRM();
  const [filterTab, setFilterTab] = useState('Upcoming');

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Appointments</h1>
          <p>Automated meeting scheduler synced with Google Calendar and Outlook</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActiveModal('scheduleAppointment')}
        >
          <Plus size={16} />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* Tabs Toolbar */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${filterTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <strong>{appointments.length}</strong> total meetings scheduled
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="crm-card">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Company</th>
                <th>Date & Time</th>
                <th>Meeting Type</th>
                <th>Host</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-sm">
                        {apt.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600 }}>{apt.customer}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{apt.company}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Clock size={14} style={{ color: 'var(--primary)' }} />
                      <span>{apt.dateTime}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        fontSize: '0.78rem'
                      }}
                    >
                      {apt.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{apt.host}</td>
                  <td>
                    <StatusBadge status={apt.status} />
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => addNotification && addNotification({
                        type: 'info',
                        title: `Reschedule link generated for ${apt.title || 'Meeting'}`
                      })}
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
