import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, CheckCircle2,
  Phone, Mail, ArrowRight, UserCheck, Shield, ChevronDown
} from 'lucide-react';
import { educationAiService } from '../../services/educationAiService';

export default function EducationStudentChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Form states
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    consent: true
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initConversation = async () => {
    setIsTyping(true);
    try {
      const res = await educationAiService.startAdmissionSession({
        channel: 'WEBSITE_CHAT',
        language: 'en',
        visitor: { name: 'Prospective Student' },
        initialMessage: 'Hi, I would like to explore your available courses.'
      });
      if (res) {
        setSessionId(res.sessionId);
        setMessages([
          {
            sender: 'AI_ADMISSION_AGENT',
            content: res.initialResponse?.message || 'Welcome to our Academy! How can I assist you with course information or admissions today?',
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Error starting student chat:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId || isTyping) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    setMessages(prev => [
      ...prev,
      {
        sender: 'STUDENT',
        content: userText,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);
    try {
      const res = await educationAiService.sendAdmissionMessage(sessionId, { message: userText });
      if (res) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'AI_ADMISSION_AGENT',
            content: res.reply,
            course: res.course,
            knowledgeSources: res.knowledgeSources,
            requiresHumanHandoff: res.requiresHumanHandoff,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        // Prompt lead capture after 2 student questions
        if (!leadCaptured && messages.length >= 2) {
          setShowLeadForm(true);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'AI_ADMISSION_AGENT',
          content: 'Sorry, I encountered a temporary connection issue. You can retry or request human staff takeover.',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email || !sessionId) return;

    try {
      await educationAiService.createAdmissionLead(sessionId, {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        source: 'WEBSITE_CHAT',
        consent: { contactForAdmission: true, marketingFollowUps: leadForm.consent }
      });
      setLeadCaptured(true);
      setShowLeadForm(false);
      setMessages(prev => [
        ...prev,
        {
          sender: 'AI_ADMISSION_AGENT',
          content: `Thank you ${leadForm.name}! Your enquiry has been registered with our admissions office. We will keep your verified information on file.`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Error submitting lead:', err);
    }
  };

  const handleRequestHandoff = async () => {
    if (!sessionId) return;
    setIsTyping(true);
    try {
      await educationAiService.handoffAdmissionSession(sessionId, {
        reason: 'STUDENT_REQUESTED_HUMAN',
        preferredTeam: 'ADMISSIONS'
      });
      setMessages(prev => [
        ...prev,
        {
          sender: 'AI_ADMISSION_AGENT',
          content: 'I have transferred this conversation to our senior admission team. An executive will connect with you shortly on this chat.',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Widget Launcher Button */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Chat with AI Admission Assistant"
          >
            <Bot size={28} />
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid #ffffff'
            }} />
          </button>
        )}

        {/* Live Chat Window */}
        {isOpen && (
          <div
            style={{
              width: '380px',
              height: '560px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Admission Assistant</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ade80' }} />
                    Verified Course Info • 24/7
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleRequestHandoff}
                  title="Talk to Human Executive"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UserCheck size={12} />
                  <span>Human</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--bg-main)'
            }}>
              {messages.map((m, idx) => {
                const isAi = m.sender === 'AI_ADMISSION_AGENT';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAi ? 'flex-start' : 'flex-end',
                      maxWidth: '90%',
                      alignSelf: isAi ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isAi ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      backgroundColor: isAi ? 'var(--bg-card)' : 'var(--primary)',
                      color: isAi ? 'var(--text-main)' : '#ffffff',
                      border: isAi ? '1px solid var(--border)' : 'none',
                      fontSize: '0.85rem',
                      lineHeight: 1.45,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      {m.content}

                      {/* Course Card Preview if attached */}
                      {m.course && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          fontSize: '0.78rem'
                        }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.course.name}</div>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            Duration: {m.course.durationWeeks} weeks • Fee: ₹{m.course.publishedFee?.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px', padding: '0 4px' }}>
                      {m.createdAt}
                    </span>
                  </div>
                );
              })}

              {/* Typing State */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  <Bot size={14} className="spin" />
                  <span>Checking verified course records...</span>
                </div>
              )}

              {/* Inline Lead Capture Form */}
              {showLeadForm && !leadCaptured && (
                <form
                  onSubmit={handleLeadSubmit}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} />
                    <span>Get Syllabus & Fee Schedule over WhatsApp</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    className="input"
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    className="input"
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Phone Number"
                    className="input"
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  />
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={leadForm.consent}
                      onChange={(e) => setLeadForm({ ...leadForm, consent: e.target.checked })}
                    />
                    I agree to receive course updates & admission guidance.
                  </label>
                  <button type="submit" className="btn btn-primary btn-xs" style={{ width: '100%', marginTop: '4px' }}>
                    Receive Course Packet
                  </button>
                </form>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} style={{
              padding: '12px',
              backgroundColor: 'var(--bg-card)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Ask about fees, duration, batches..."
                className="input"
                style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 12px' }}
                disabled={isTyping || !inputMessage.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
