package com.omnisports.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentKafkaEvent {
    private String eventType; // EVENT_CREATED | MATCH_RESULT_RECORDED
    private LocalDateTime timestamp;
    private String eventId;
    private String description;
    private Object payload;
}
