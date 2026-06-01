package com.omnisports.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseService {

    private static final Logger logger = LoggerFactory.getLogger(SseService.class);

    // Dynamic thread-safe repository of all active client sessions
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter createConnection() {
        // SSE connection timing out after 15 minutes (900000 ms) of inactivity
        SseEmitter emitter = new SseEmitter(900000L);

        // Send dummy initial handshake so frontend receives a successful connection event
        try {
            emitter.send(SseEmitter.event()
                    .name("HANDSHAKE")
                    .data("✦ OmniSports Real-Time Feed Active ✦"));
        } catch (IOException e) {
            logger.warn("Initial SSE Handshake failed for emitter", e);
            return emitter;
        }

        this.emitters.add(emitter);
        logger.info("Successfully established and registered new active SSE Client connection. Concurrent subscriber count: {}", emitters.size());

        emitter.onCompletion(() -> {
            logger.info("Completed SSE emitter stream callback");
            this.emitters.remove(emitter);
        });

        emitter.onTimeout(() -> {
            logger.info("SSE emitter timed out");
            this.emitters.remove(emitter);
        });

        emitter.onError((ex) -> {
            logger.warn("SSE emitter error observed: {}", ex.getMessage());
            this.emitters.remove(emitter);
        });

        return emitter;
    }

    public void broadcast(String eventName, Object payload) {
        if (emitters.isEmpty()) {
            return;
        }

        logger.info("Broadcasting real-time event '{}' to {} active SSE sessions", eventName, emitters.size());
        List<SseEmitter> failedEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(payload));
            } catch (Exception e) {
                logger.warn("Failed transmission of SSE payload. Queueing emitter for system cleanup.", e);
                failedEmitters.add(emitter);
            }
        }

        if (!failedEmitters.isEmpty()) {
            this.emitters.removeAll(failedEmitters);
            logger.info("Removed {} obsolete/dead SSE connections. Active: {}", failedEmitters.size(), emitters.size());
        }
    }
}
