package com.omnisports.service;

import com.omnisports.event.TournamentKafkaEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class KafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);
    private static final String TOPIC = "tournament-events";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishEventCreated(String eventId, String name, String sportType, String location) {
        TournamentKafkaEvent event = TournamentKafkaEvent.builder()
                .eventType("EVENT_CREATED")
                .timestamp(LocalDateTime.now())
                .eventId(eventId)
                .description("New tournament published: " + name + " (" + sportType + ") at " + location)
                .payload(new EventCreatedPayload(eventId, name, sportType, location))
                .build();

        send(event);
    }

    public void publishMatchResult(String matchId, String eventId, String teamA, String teamB, int scoreA, int scoreB, String status) {
        TournamentKafkaEvent event = TournamentKafkaEvent.builder()
                .eventType("MATCH_RESULT_RECORDED")
                .timestamp(LocalDateTime.now())
                .eventId(eventId)
                .description("Match result recorded (" + status + "): " + teamA + " [" + scoreA + "] vs [" + scoreB + "] " + teamB)
                .payload(new MatchResultPayload(matchId, eventId, teamA, teamB, scoreA, scoreB, status))
                .build();

        send(event);
    }

    private void send(TournamentKafkaEvent event) {
        try {
            logger.info("Publishing event to Kafka topic {}: {}", TOPIC, event);
            kafkaTemplate.send(TOPIC, event.getEventId(), event);
        } catch (Exception e) {
            logger.error("Failed to transmit event to Apache Kafka cluster on topic {}: {}", TOPIC, e.getMessage(), e);
        }
    }

    public static class EventCreatedPayload {
        public String id;
        public String name;
        public String sportType;
        public String location;

        public EventCreatedPayload(String id, String name, String sportType, String location) {
            this.id = id;
            this.name = name;
            this.sportType = sportType;
            this.location = location;
        }
    }

    public static class MatchResultPayload {
        public String matchId;
        public String eventId;
        public String teamA;
        public String teamB;
        public int scoreA;
        public int scoreB;
        public String status;

        public MatchResultPayload(String matchId, String eventId, String teamA, String teamB, int scoreA, int scoreB, String status) {
            this.matchId = matchId;
            this.eventId = eventId;
            this.teamA = teamA;
            this.teamB = teamB;
            this.scoreA = scoreA;
            this.scoreB = scoreB;
            this.status = status;
        }
    }
}
