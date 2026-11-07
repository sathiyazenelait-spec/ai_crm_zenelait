package com.zenelait.crm.voice;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;

@Component
public class VoiceWebSocketHandler extends TextWebSocketHandler {

    private final VoiceAiService voiceAiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public VoiceWebSocketHandler(VoiceAiService voiceAiService) {
        this.voiceAiService = voiceAiService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Map<String, Object> welcome = Map.of(
                "type", "SESSION_INIT",
                "message", "Voice WebSocket Stream connected. Ready for audio/text stream.",
                "sessionId", session.getId()
        );
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(welcome)));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> incoming = objectMapper.readValue(message.getPayload(), Map.class);
        String callId = (String) incoming.getOrDefault("callId", session.getId());
        String role = (String) incoming.getOrDefault("role", "AI_SDR");
        String text = (String) incoming.getOrDefault("utterance", "");
        String callerName = (String) incoming.getOrDefault("callerName", "Live Caller");
        String tenantId = (String) incoming.getOrDefault("tenantId", "TEN-IT-001");

        Map<String, Object> reply = voiceAiService.processVoiceUtterance(callId, role, text, tenantId, callerName);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(reply)));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // cleanup if needed
    }
}
