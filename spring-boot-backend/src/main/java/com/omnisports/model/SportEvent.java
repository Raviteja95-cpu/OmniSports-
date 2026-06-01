package com.omnisports.model;

import lombok.Data;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "events")
public class SportEvent {

    @Id
    @Column(length = 36)
    private String id;

    @NotBlank(message = "Event Name is mandatory")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Location/Venue is mandatory")
    @Column(nullable = false, length = 150)
    private String location;

    @NotBlank(message = "Sport Category is mandatory")
    @Column(name = "sport_type", nullable = false, length = 50)
    private String sportType;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    private String status; // draft | published | ongoing | finished

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
