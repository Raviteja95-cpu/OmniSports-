package com.omnisports.model;

import lombok.Data;
import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sponsorships")
public class SponsorshipOffer {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "sponsor_id", nullable = false, length = 36)
    private String sponsorId;

    @Column(name = "sponsor_name", nullable = false, length = 100)
    private String sponsorName;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType; // team | player | event

    @Column(name = "target_id", nullable = false, length = 36)
    private String targetId;

    @Min(value = 500, message = "Sponsorship must be at least $500")
    @Column(nullable = false)
    private int amount;

    @NotBlank(message = "Sponsorship contract terms are required")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String terms;

    @Column(nullable = false, length = 20)
    private String status; // pending | accepted | rejected

    @Column(name = "created_at")
    private LocalDateTime timestamp;
}
