package com.omnisports.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);

    @Autowired
    private SseService sseService;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "tournament-events", groupId = "omnisports-analytics-group")
    public void consumeTournamentEvent(String rawMessage) {
        logger.info("Kafka Consumer received record successfully from topic 'tournament-events': {}", rawMessage);
        
        try {
            // Verify that the payload is valid JSON
            objectMapper.readTree(rawMessage);

            // Forward the raw JSON straight to all active Server-Sent Events (SSE) connections
            // Utilizing a unified Event Name "TOURNAMENT_EVENT" for structural ease in frontend code
            sseService.broadcast("TOURNAMENT_EVENT", rawMessage);
            
            logger.info("Successfully pushed current Kafka event downstream to Server-Sent Event (SSE) sessions");
        } catch (Exception e) {
            logger.error("Failed parsing or broadcasting Kafka consumer packet. Raw Message: {}", rawMessage, e);
        }
    }
}
