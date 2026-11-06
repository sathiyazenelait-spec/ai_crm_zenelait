import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { X, CheckCheck, Bell, Calendar, UserPlus, MessageSquare, Bot } from 'lucide-react';

export function NotificationsDrawer() {
  const { isNotifDrawerOpen, setIsNotifDrawerOpen, notifications, markAllNotificationsRead, navigateTo } = useCRM();
  const [filter, setFilter] = useState('All');

  if (!isNotifDrawerOpen) return null;

  const categories = ['All', 'Leads', 'Appointments', 'System'];

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'All') return true;
    return n.category === filter;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'lead':
        return <UserPlus size={16} style={{ color: '#3b82f6' }} />;
      case 'appointment':
        return <Calendar size={16} style={{ color: '#10b981' }} />;
      case 'message':
        return <MessageSquare size={16} style={{ color: '#ec4899' }} />;
      case 'handover':
        return <Bot size={16} style={{ color: '#a855f7' }} />;
      default:
        return <Bell size={16} style={{ color: '#f59e0b' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={() => setIsNotifDrawerOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Notifications</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Stay updated with lead activities</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={markAllNotificationsRead}
              title="Mark all as read"
            >
              <CheckCheck size={16} />
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setIsNotifDrawerOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              No notifications found
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: item.unread ? 'var(--primary-light)' : 'var(--bg-surface)',
                  border: `1px solid ${item.unread ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
                onClick={() => {
                  if (item.category === 'Leads') navigateTo('leads');
                  else if (item.category === 'Appointments') navigateTo('appointments');
                  setIsNotifDrawerOpen(false);
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getNotifIcon(item.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: item.unread ? '600' : '500', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
