package com.omnisports.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "registrations")
public class TeamRegistration {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "team_id", nullable = false, length = 36)
    private String teamId;

    @Column(name = "event_id", nullable = false, length = 36)
    private String eventId;

    @Column(nullable = false, length = 20)
    private String status; // pending | approved | rejected

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
