package com.omnisports.model;

import lombok.Data;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Data
@Entity
@Table(name = "players")
public class Player {

    @Id
    @Column(length = 36)
    private String id;

    @NotBlank(message = "Player name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Sport category is required")
    @Column(name = "sport_type", nullable = false, length = 50)
    private String sportType;

    @Column(length = 50)
    private String position; // Batsman, Bowler, Badminton Singles, etc.

    @Column(name = "skill_level", length = 30)
    private String skillLevel; // Amateur | Semi-pro | Elite

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;
}
