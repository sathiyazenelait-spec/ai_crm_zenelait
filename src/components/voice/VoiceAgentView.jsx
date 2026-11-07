import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, Calendar, Sparkles, CheckCircle2, Clock, Activity, MessageSquare, AlertCircle } from 'lucide-react';

export function VoiceAgentView() {
  const { currentTenant, token } = useCRM();
  const [selectedRole, setSelectedRole] = useState('AI_SDR');
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callerName, setCallerName] = useState('Sathiyaseelan');
  const [callerPhone, setCallerPhone] = useState('+91 98400 12345');
  const [currentCallId, setCurrentCallId] = useState(null);
  
  const [transcript, setTranscript] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [meetingBooked, setMeetingBooked] = useState(null);
  const [sentiment, setSentiment] = useState('POSITIVE');
  const [inputUtterance, setInputUtterance] = useState('');
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Available Autonomous Roles
  const roles = [
    {
      id: 'AI_SDR',
      name: 'Alex — Autonomous Enterprise SDR',
      industry: 'Software & IT / B2B',
      avatar: '🎙️',
      color: '#3b82f6',
      desc: 'Qualifies BANT (Budget, Need, Timeline), handles pricing objections, and reserves 15-minute product demos.'
    },
    {
      id: 'AI_RECEPTIONIST',
      name: 'Sarah — Clinical Triage & Receptionist',
      industry: 'Healthcare & Clinics',
      avatar: '🩺',
      color: '#10b981',
      desc: 'Triages patient urgencies, answers clinic hours, and books appointments with on-duty physicians.'
    },
    {
      id: 'AI_CONCIERGE',
      name: 'Marcus — Property & Hotel Concierge',
      industry: 'Real Estate & Hospitality',
      avatar: '🏢',
      color: '#f59e0b',
      desc: 'Verifies floorplans and luxury BHK options, answers amenity queries, and reserves verified site visits.'
    }
  ];

  const backendHost = import.meta.env.VITE_API_URL || 'https://trustworthy-liberation-production-90f6.up.railway.app';

  // Fetch past call logs
  const fetchCallLogs = async () => {
    try {
      const res = await fetch(`${backendHost}/api/v1/voice/logs?tenantId=${currentTenant?.id || 'TEN-IT-001'}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setCallLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Could not load voice logs:', err);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, [currentTenant]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Start Call
  const handleStartCall = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendHost}/api/v1/voice/start-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          callerName,
          callerPhone,
          tenantId: currentTenant?.id || 'TEN-IT-001'
        })
      });

      const data = await res.json();
      setCurrentCallId(data.callId);
      setCallActive(true);
      setCallDuration(0);
      setMeetingBooked(null);
      setTranscript([
        { sender: 'AI', text: data.initialGreeting, time: 'Just now' }
      ]);

      // Speak greeting
      speakText(data.initialGreeting);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Could not start AI Voice call: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Browser speech synthesis helper (100% Free natural voice)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Send speech or text utterance to AI agent
  const handleSendUtterance = async (textToSend) => {
    const text = textToSend || inputUtterance;
    if (!text.trim() || !callActive) return;

    // Add user message to transcript
    const userMsg = { sender: 'USER', text, time: `${callDuration}s` };
    setTranscript(prev => [...prev, userMsg]);
    setInputUtterance('');
    setLoading(true);

    try {
      const res = await fetch(`${backendHost}/api/v1/voice/talk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: currentCallId,
          role: selectedRole,
          utterance: text,
          callerName,
          tenantId: currentTenant?.id || 'TEN-IT-001'
        })
      });

      const data = await res.json();
      const aiReply = data.aiReplyText || 'I understand. Let me check that for you.';
      
      setTranscript(prev => [...prev, { sender: 'AI', text: aiReply, time: `${callDuration}s` }]);
      setSentiment(data.sentiment || 'POSITIVE');
      
      if (data.bookingTriggered && data.scheduledTime) {
        setMeetingBooked(data.scheduledTime);
      }

      speakText(aiReply);
    } catch (err) {
      console.error('Error during voice exchange:', err);
    } finally {
      setLoading(false);
    }
  };

  // End Call & Persist Summary to TiDB Cloud
  const handleEndCall = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    
    setCallActive(false);
    setIsAiSpeaking(false);

    try {
      const fullText = transcript.map(m => `${m.sender}: ${m.text}`).join('\n');
      await fetch(`${backendHost}/api/v1/voice/end-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: currentCallId,
          callerName,
          callerPhone,
          role: selectedRole,
          durationSeconds: callDuration,
          transcript: fullText,
          summary: meetingBooked 
            ? `Lead successfully qualified. Demo booked for ${meetingBooked}.` 
            : `Call completed with ${selectedRole}. Inbound query resolved.`,
          sentiment,
          scheduledMeetingTime: meetingBooked,
          tenantId: currentTenant?.id || 'TEN-IT-001'
        })
      });
      fetchCallLogs();
    } catch (err) {
      console.error('Failed to save call summary:', err);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#ffffff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={28} style={{ color: '#3b82f6' }} />
            Autonomous AI Voice Calling Studio
          </h1>
          <p style={{ color: '#94a3b8', margin: '6px 0 0 0', fontSize: '15px' }}>
            Real-time human-like voice synthesis, BANT qualification, and 60-second automated demo booking.
          </p>
        </div>

        {/* Live Call Telemetry Badge */}
        {callActive && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '9999px',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px' }}>LIVE CALL: {formatTimer(callDuration)}</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: callActive ? '1fr' : '1fr 380px', gap: '24px' }}>
        
        {/* Active Call / Calling Interface */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '620px'
        }}>
          {!callActive ? (
            /* Setup Call Screen */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Select Autonomous Voice Employee</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {roles.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      background: selectedRole === r.id ? 'rgba(59, 130, 246, 0.15)' : '#1e293b',
                      border: `2px solid ${selectedRole === r.id ? '#3b82f6' : '#334155'}`,
                      borderRadius: '12px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{r.avatar}</div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#ffffff' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: r.color, fontWeight: '600', margin: '4px 0' }}>{r.industry}</div>
                    <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '8px 0 0 0', lineHeight: 1.4 }}>{r.desc}</p>
                  </div>
                ))}
              </div>

              {/* Caller Configuration */}
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', marginTop: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', marginBottom: '14px' }}>Inbound Caller Simulation Parameters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Prospect / Caller Name</label>
                    <input
                      type="text"
                      value={callerName}
                      onChange={e => setCallerName(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Caller Phone</label>
                    <input
                      type="text"
                      value={callerPhone}
                      onChange={e => setCallerPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Call Start CTA */}
              <button
                onClick={handleStartCall}
                disabled={loading}
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 28px',
                  fontSize: '17px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                  transition: 'all 0.2s ease',
                  marginTop: '10px'
                }}
              >
                <Phone size={22} />
                {loading ? 'Connecting Voice Stream...' : 'Start Real-Time Autonomous Voice Call'}
              </button>
            </div>
          ) : (
            /* Active Live Call Screen */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Agent Active Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '36px', background: '#1e293b', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {roles.find(r => r.id === selectedRole)?.avatar || '🎙️'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>
                      {roles.find(r => r.id === selectedRole)?.name}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                      Voice Channel Active (WebSocket & WebRTC Stream)
                    </div>
                  </div>
                </div>

                {/* Sentiment & Booking Indicator */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: '#1e293b', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>
                    Sentiment: <span style={{ color: sentiment === 'POSITIVE' ? '#22c55e' : '#f59e0b' }}>{sentiment}</span>
                  </div>
                  {meetingBooked && (
                    <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', color: '#22c55e', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Meeting Auto-Booked!
                    </div>
                  )}
                </div>
              </div>

              {/* Soundwave Visualizer */}
              <div style={{
                background: '#090d16',
                borderRadius: '12px',
                padding: '24px',
                margin: '20px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '90px'
              }}>
                {[20, 45, 75, 95, 60, 30, 85, 100, 70, 40, 60, 90, 50, 25, 80, 60, 35].map((height, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '6px',
                      height: isAiSpeaking ? `${height}px` : '12px',
                      background: isAiSpeaking ? '#3b82f6' : '#334155',
                      borderRadius: '4px',
                      transition: 'height 0.15s ease',
                      animation: isAiSpeaking ? `bounce 0.8s ease-in-out infinite alternate ${idx * 0.05}s` : 'none'
                    }}
                  />
                ))}
              </div>

              {/* Live Transcript Log */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                background: '#090d16',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '300px'
              }}>
                {transcript.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: msg.sender === 'USER' ? '#3b82f6' : '#1e293b',
                      color: '#ffffff',
                      borderRadius: msg.sender === 'USER' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', fontWeight: '600' }}>
                      {msg.sender === 'USER' ? callerName : 'AI Voice Agent'} • {msg.time}
                    </div>
                    {msg.text}
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>

              {/* Quick Talk Options & Manual Utterance Input */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Speak or type caller response... (e.g. 'Can we schedule a demo tomorrow at 11am?')"
                  value={inputUtterance}
                  onChange={e => setInputUtterance(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendUtterance()}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={() => handleSendUtterance()}
                  disabled={loading}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 20px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Send
                </button>
              </div>

              {/* Quick Prompts to Test Live AI Reaction */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleSendUtterance("What is the pricing for a 25-person team?")}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                >
                  💰 "What is the pricing?"
                </button>
                <button
                  onClick={() => handleSendUtterance("Yes, let's book a demo tomorrow at 11 AM.")}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                >
                  📅 "Book demo for tomorrow"
                </button>
                <button
                  onClick={() => handleSendUtterance("I want to speak with an actual human manager.")}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                >
                  🚨 "Human Manager Handoff"
                </button>
              </div>

              {/* Call Controls Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    background: isMuted ? '#ef4444' : '#1e293b',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button
                  onClick={handleEndCall}
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0 32px',
                    height: '48px',
                    fontWeight: '700',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <PhoneOff size={20} /> End Call & Save to TiDB Cloud
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Side Panel: TiDB Cloud Voice Call History */}
        {!callActive && (
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#3b82f6' }} />
              Recent Call Logs (TiDB Cloud)
            </h3>

            {callLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b', fontSize: '14px' }}>
                No completed voice calls yet. Start your first autonomous voice call to log transcripts and meeting bookings.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
                {callLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      background: '#1e293b',
                      borderRadius: '10px',
                      padding: '14px',
                      borderLeft: `4px solid ${log.status === 'BOOKED_DEMO' ? '#22c55e' : '#3b82f6'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{log.callerName}</span>
                      <span style={{ fontSize: '11px', background: '#0f172a', padding: '2px 8px', borderRadius: '4px', color: '#94a3b8' }}>{log.durationSeconds}s</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '6px' }}>{log.callRole} • {log.callerPhone}</div>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>{log.qualificationSummary}</p>
                    {log.scheduledMeetingTime && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <Calendar size={12} /> Auto-Booked: {log.scheduledMeetingTime.replace('T', ' ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
