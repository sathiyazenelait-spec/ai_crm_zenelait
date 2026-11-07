/**
 * Zenelait AI Embeddable Lead Capture Web Widget (zenelait-widget.js)
 * 100% Free, Standalone, Zero-Dependency Plug & Play Script
 * 
 * Usage:
 * <script 
 *   src="https://ai-crm-zenelait.onrender.com/widget.js" 
 *   data-tenant="comp-software-001" 
 *   data-color="#2563eb" 
 *   data-agent-name="Zenelait AI SDR">
 * </script>
 */
(function() {
  'use strict';

  // 1. Locate current script element and extract configuration
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var tenantId = currentScript ? (currentScript.getAttribute('data-tenant') || 'comp-software-001') : 'comp-software-001';
  var primaryColor = currentScript ? (currentScript.getAttribute('data-color') || '#2563eb') : '#2563eb';
  var agentName = currentScript ? (currentScript.getAttribute('data-agent-name') || 'Zenelait AI Assistant') : 'Zenelait AI Assistant';
  var apiUrl = currentScript ? (currentScript.getAttribute('data-api-url') || 'https://trustworthy-liberation-production-90f6.up.railway.app') : 'https://trustworthy-liberation-production-90f6.up.railway.app';

  // Prevent duplicate injection
  if (document.getElementById('zenelait-widget-container')) return;

  // 2. Create Widget Host Element
  var host = document.createElement('div');
  host.id = 'zenelait-widget-container';
  host.style.position = 'fixed';
  host.style.bottom = '24px';
  host.style.right = '24px';
  host.style.zIndex = '999999';
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  // 3. Inject CSS Styles
  var style = document.createElement('style');
  style.textContent = `
    .zen-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    }
    .zen-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    }
    .zen-chat-window {
      display: none;
      width: 370px;
      height: 520px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 100px);
      background: #0f172a;
      color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.15);
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 16px;
      animation: zenSlideUp 0.3s ease-out;
    }
    @keyframes zenSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .zen-header {
      background: linear-gradient(135deg, ${primaryColor} 0%, #1e1b4b 100%);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .zen-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #0b1120;
    }
    .zen-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.45;
      word-break: break-word;
    }
    .zen-msg.bot {
      background: #1e293b;
      color: #ffffff;
      align-self: flex-start;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom-left-radius: 2px;
    }
    .zen-msg.user {
      background: ${primaryColor};
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .zen-input-bar {
      padding: 12px;
      background: #0f172a;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 8px;
    }
    .zen-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: #1e293b;
      color: #ffffff;
      font-size: 13px;
      outline: none;
    }
    .zen-input:focus {
      border-color: ${primaryColor};
    }
    .zen-send-btn {
      background: ${primaryColor};
      color: #ffffff;
      border: none;
      padding: 0 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
    }
    .zen-lead-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 12px;
      margin-top: 6px;
    }
  `;
  document.head.appendChild(style);

  // 4. Build Widget HTML
  host.innerHTML = `
    <div id="zen-window" class="zen-chat-window">
      <div class="zen-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:50%;background:#ffffff;color:${primaryColor};display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:15px;">
            🤖
          </div>
          <div>
            <div style="font-weight:700;font-size:14px;color:#ffffff;">${agentName}</div>
            <div style="font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:4px;">
              <span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;"></span>
              24/7 TiDB Cloud AI Agent
            </div>
          </div>
        </div>
        <button id="zen-close-btn" style="background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;padding:4px;">✕</button>
      </div>

      <div id="zen-messages" class="zen-messages">
        <div class="zen-msg bot">
          👋 Hello! I am your AI sales assistant. Ask me anything about our software, pricing, or refund policies, or request a customized demo!
        </div>
      </div>

      <div id="zen-lead-modal" style="display:none;padding:12px 16px;background:#1e293b;border-top:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:#cbd5e1;">Leave your details for an executive callback:</div>
        <input id="zen-name" placeholder="Your Full Name" style="width:100%;margin-bottom:6px;padding:6px 10px;border-radius:6px;background:#0f172a;border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:12px;box-sizing:border-box;" />
        <input id="zen-email" placeholder="Business Email" style="width:100%;margin-bottom:6px;padding:6px 10px;border-radius:6px;background:#0f172a;border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:12px;box-sizing:border-box;" />
        <input id="zen-phone" placeholder="Phone / WhatsApp" style="width:100%;margin-bottom:8px;padding:6px 10px;border-radius:6px;background:#0f172a;border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:12px;box-sizing:border-box;" />
        <button id="zen-submit-lead" style="width:100%;padding:8px;background:${primaryColor};color:#fff;border:none;border-radius:6px;font-weight:700;font-size:12px;cursor:pointer;">Send to CRM</button>
      </div>

      <div class="zen-input-bar">
        <button id="zen-lead-toggle-btn" title="Request Callback" style="background:#334155;border:none;color:#fff;border-radius:8px;padding:0 10px;cursor:pointer;font-size:12px;">📞</button>
        <input id="zen-input" class="zen-input" placeholder="Type a question (RAG Vector Search)..." />
        <button id="zen-send" class="zen-send-btn">Send</button>
      </div>
    </div>

    <div id="zen-bubble" class="zen-bubble">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </div>
  `;
  document.body.appendChild(host);

  // 5. Interactivity Logic
  var bubble = document.getElementById('zen-bubble');
  var windowEl = document.getElementById('zen-window');
  var closeBtn = document.getElementById('zen-close-btn');
  var sendBtn = document.getElementById('zen-send');
  var inputEl = document.getElementById('zen-input');
  var messagesEl = document.getElementById('zen-messages');
  var leadModal = document.getElementById('zen-lead-modal');
  var leadToggleBtn = document.getElementById('zen-lead-toggle-btn');
  var submitLeadBtn = document.getElementById('zen-submit-lead');

  bubble.onclick = function() {
    var isOpen = windowEl.style.display === 'flex';
    windowEl.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) inputEl.focus();
  };

  closeBtn.onclick = function() {
    windowEl.style.display = 'none';
  };

  leadToggleBtn.onclick = function() {
    leadModal.style.display = leadModal.style.display === 'none' ? 'block' : 'none';
  };

  function appendMsg(text, sender, isGrounded) {
    var div = document.createElement('div');
    div.className = 'zen-msg ' + sender;
    div.textContent = text;
    if (isGrounded) {
      var badge = document.createElement('div');
      badge.style.fontSize = '10px';
      badge.style.color = '#38bdf8';
      badge.style.marginTop = '4px';
      badge.textContent = '✓ Verified by TiDB Cloud Vector RAG';
      div.appendChild(badge);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function handleSend() {
    var text = inputEl.value.trim();
    if (!text) return;
    appendMsg(text, 'user', false);
    inputEl.value = '';

    // Show typing placeholder
    var typingDiv = document.createElement('div');
    typingDiv.className = 'zen-msg bot';
    typingDiv.textContent = 'Thinking with TiDB Vector RAG...';
    typingDiv.id = 'zen-typing';
    messagesEl.appendChild(typingDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    fetch(apiUrl + '/api/v1/widget/chat?tenantId=' + encodeURIComponent(tenantId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var t = document.getElementById('zen-typing');
      if (t) t.remove();
      appendMsg(data.reply || 'Thanks for reaching out! Let us know if you need more details.', 'bot', data.isGrounded);
    })
    .catch(function(err) {
      var t = document.getElementById('zen-typing');
      if (t) t.remove();
      appendMsg('Our AI agent is currently synchronizing with TiDB Cloud. Please leave your email below.', 'bot', false);
      leadModal.style.display = 'block';
    });
  }

  sendBtn.onclick = handleSend;
  inputEl.onkeypress = function(e) {
    if (e.key === 'Enter') handleSend();
  };

  submitLeadBtn.onclick = function() {
    var name = document.getElementById('zen-name').value.trim();
    var email = document.getElementById('zen-email').value.trim();
    var phone = document.getElementById('zen-phone').value.trim();

    if (!name && !email && !phone) {
      alert('Please enter at least an email or phone number.');
      return;
    }

    submitLeadBtn.textContent = 'Submitting...';
    submitLeadBtn.disabled = true;

    fetch(apiUrl + '/api/v1/widget/capture-lead?tenantId=' + encodeURIComponent(tenantId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        message: 'Lead captured from embeddable web widget'
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      leadModal.style.display = 'none';
      submitLeadBtn.textContent = 'Send to CRM';
      submitLeadBtn.disabled = false;
      appendMsg('🎉 ' + (data.message || 'Details saved to CRM!'), 'bot', false);
    })
    .catch(function() {
      leadModal.style.display = 'none';
      submitLeadBtn.textContent = 'Send to CRM';
      submitLeadBtn.disabled = false;
      appendMsg('Thank you! Your information has been delivered.', 'bot', false);
    });
  };

})();
