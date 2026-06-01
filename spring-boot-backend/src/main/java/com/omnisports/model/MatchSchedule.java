package com.omnisports.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "matches")
public class MatchSchedule {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "event_id", nullable = false, length = 36)
    private String eventId;

    @Column(name = "team_a_id", nullable = false, length = 36)
    private String teamAId;

    @Column(name = "team_b_id", nullable = false, length = 36)
    private String teamBId;

    @Column(name = "score_a")
    private int scoreA;

    @Column(name = "score_b")
    private int scoreB;

    @Column(nullable = false, length = 20)
    private String status; // scheduled | live | completed

    @Column(nullable = false)
    private int round = 1;

    @Column(name = "match_time")
    private LocalDateTime matchTime;
}
