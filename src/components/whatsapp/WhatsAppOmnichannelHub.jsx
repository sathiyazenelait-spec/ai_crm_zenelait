import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MessageSquare, Send, FileText, Calendar, UserCheck, Bot, CheckCheck, RefreshCw, Smartphone, Phone, Sparkles, AlertCircle } from 'lucide-react';

export function WhatsAppOmnichannelHub() {
  const { currentTenant, token } = useCRM();
  const [messages, setMessages] = useState([]);
  const [activeContact, setActiveContact] = useState('+91 98765 43210');
  const [replyText, setReplyText] = useState('');
  const [simText, setSimText] = useState('Hi! Can you share the official software pricing and brochure?');
  const [simPhone, setSimPhone] = useState('+91 98765 43210');
  const [simName, setSimName] = useState('Rohan Deshmukh');
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const messagesEndRef = useRef(null);
  const backendHost = import.meta.env.VITE_API_URL || 'https://trustworthy-liberation-production-90f6.up.railway.app';

  // Fetch all WhatsApp messages for tenant
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${backendHost}/api/v1/whatsapp/messages?tenantId=${currentTenant?.id || 'TEN-IT-001'}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Could not fetch WhatsApp messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000); // Poll every 8s for live chat simulation
    return () => clearInterval(interval);
  }, [currentTenant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  // Group messages by contact phone
  const contactsMap = {};
  messages.forEach(msg => {
    if (!contactsMap[msg.senderPhone]) {
      contactsMap[msg.senderPhone] = {
        phone: msg.senderPhone,
        name: msg.senderName || 'Customer',
        lastMessage: msg.messageText,
        lastTime: msg.createdAt,
        status: msg.status
      };
    }
  });

  // Ensure active contact exists in contacts map
  if (!contactsMap[activeContact]) {
    contactsMap[activeContact] = {
      phone: activeContact,
      name: 'Rohan Deshmukh',
      lastMessage: 'Interested in software pricing',
      lastTime: new Date().toISOString(),
      status: 'AUTO_REPLIED'
    };
  }

  const contactsList = Object.values(contactsMap);
  const activeConversation = messages.filter(m => m.senderPhone === activeContact);

  // Send manual reply
  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      await fetch(`${backendHost}/api/v1/whatsapp/send-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: activeContact,
          messageText: replyText,
          agentName: 'Sathiyaseelan (Live Representative)',
          tenantId: currentTenant?.id || 'TEN-IT-001'
        })
      });
      setReplyText('');
      fetchMessages();
    } catch (err) {
      alert('Could not send WhatsApp message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simulate an incoming WhatsApp prospect message
  const handleSimulateInbound = async () => {
    if (!simText.trim()) return;
    setIsSimulating(true);
    try {
      await fetch(`${backendHost}/api/v1/whatsapp/simulate-incoming`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: simPhone,
          senderName: simName,
          messageText: simText,
          tenantId: currentTenant?.id || 'TEN-IT-001'
        })
      });
      setActiveContact(simPhone);
      setSimText('');
      fetchMessages();
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#ffffff' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={28} style={{ color: '#22c55e' }} />
            WhatsApp Business API & Omnichannel Chatbot
          </h1>
          <p style={{ color: '#94a3b8', margin: '6px 0 0 0', fontSize: '15px' }}>
            Official Meta Cloud API webhook integration with 24/7 autonomous qualification and instant PDF brochure delivery.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={16} /> Sync Messages
        </button>
      </div>

      {/* Simulator Bar (For Live Testing with 0 Cost) */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', color: '#22c55e' }}>
          <Sparkles size={18} />
          <span>Meta Cloud Webhook Simulator:</span>
        </div>
        <input
          type="text"
          placeholder="Customer Phone (e.g. +91 98765 43210)"
          value={simPhone}
          onChange={e => setSimPhone(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px', width: '180px' }}
        />
        <input
          type="text"
          placeholder="Customer Name"
          value={simName}
          onChange={e => setSimName(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px', width: '150px' }}
        />
        <input
          type="text"
          placeholder="Incoming message (e.g. 'Can you send me the price catalog?')"
          value={simText}
          onChange={e => setSimText(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
        />
        <button
          onClick={handleSimulateInbound}
          disabled={isSimulating}
          style={{
            background: '#22c55e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '9px 18px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Send size={14} /> {isSimulating ? 'Sending...' : 'Trigger WhatsApp Webhook'}
        </button>
      </div>

      {/* Main Two-Column Chat Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', height: '640px' }}>
        
        {/* Left: Contact List */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', background: '#1e293b' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>Active WhatsApp Chats</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Meta Cloud API Connected</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {contactsList.map(c => (
              <div
                key={c.phone}
                onClick={() => setActiveContact(c.phone)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #1e293b',
                  background: activeContact === c.phone ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                  borderLeft: activeContact === c.phone ? '4px solid #22c55e' : '4px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff' }}>{c.name}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Just now</span>
                </div>
                <div style={{ fontSize: '12px', color: '#22c55e', marginBottom: '4px' }}>{c.phone}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.lastMessage}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active WhatsApp Thread */}
        <div style={{
          background: '#0b141a', // WhatsApp Web dark theme background
          border: '1px solid #1e293b',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Conversation Header */}
          <div style={{
            padding: '14px 20px',
            background: '#202c33',
            borderBottom: '1px solid #2a3942',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#00a884', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>
                {contactsMap[activeContact]?.name?.charAt(0) || 'W'}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '15px' }}>{contactsMap[activeContact]?.name}</div>
                <div style={{ fontSize: '12px', color: '#00a884', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bot size={14} /> 24/7 Autonomous SDR Active
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setReplyText("Here is our official product brochure: https://ai-crm-zenelait.onrender.com/Zenelait_Proposal.pdf")}
                style={{ background: '#2a3942', border: 'none', color: '#00a884', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={14} /> Attach PDF Brochure
              </button>
              <button
                onClick={() => setReplyText("You can schedule your preferred demo time right here: https://ai-crm-zenelait.onrender.com/#demo")}
                style={{ background: '#2a3942', border: 'none', color: '#38bdf8', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Calendar size={14} /> Send Demo Booking Link
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {activeConversation.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#8696a0', fontSize: '14px' }}>
                <Smartphone size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <div>No messages yet for this contact.</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Use the simulator above to trigger an incoming WhatsApp message!</div>
              </div>
            ) : (
              activeConversation.map(m => {
                const isOutbound = m.direction === 'OUTBOUND';
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isOutbound ? 'flex-end' : 'flex-start',
                      maxWidth: '65%',
                      background: isOutbound ? '#005c4b' : '#202c33', // WhatsApp message bubble colors
                      color: '#e9edef',
                      borderRadius: isOutbound ? '8px 8px 0px 8px' : '8px 8px 8px 0px',
                      padding: '10px 14px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: isOutbound ? '#25d366' : '#53bdeb', fontWeight: '700', marginBottom: '2px' }}>
                      {isOutbound ? '🤖 Zenelait AI SDR' : m.senderName}
                    </div>

                    <div>{m.messageText}</div>

                    {/* PDF Attachment Card if brochure delivered */}
                    {m.mediaUrl && (
                      <a
                        href={m.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'rgba(0,0,0,0.25)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          marginTop: '8px',
                          textDecoration: 'none',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <FileText size={20} style={{ color: '#ef4444' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700' }}>Zenelait_Proposal.pdf</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>10.5 KB • Click to open brochure</div>
                        </div>
                      </a>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#8696a0', marginTop: '4px' }}>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOutbound && <CheckCheck size={14} style={{ color: '#53bdeb' }} />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input Bar */}
          <div style={{
            padding: '14px 20px',
            background: '#202c33',
            borderTop: '1px solid #2a3942',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="text"
              placeholder="Type a WhatsApp reply as sales representative..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendReply()}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#2a3942',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSendReply}
              disabled={loading}
              style={{
                background: '#00a884',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={18} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
