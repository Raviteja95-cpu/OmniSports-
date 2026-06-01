package com.omnisports.model;

import lombok.Data;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Data
@Entity
@Table(name = "teams")
public class Team {

    @Id
    @Column(length = 36)
    private String id;

    @NotBlank(message = "Team name is required")
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @NotBlank(message = "Sport type is required")
    @Column(name = "sport_type", nullable = false, length = 50)
    private String sportType;

    @Column(length = 10)
    private String logo; // Emoji representation

    @Column(name = "points", nullable = false)
    private int points = 0;

    @Column(name = "manager_id", nullable = false)
    private String managerId;
}
