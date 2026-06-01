package com.omnisports.model;

import lombok.Data;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(length = 36)
    private String id;

    @NotBlank(message = "Username is mandatory")
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "Password is mandatory")
    @Column(nullable = false, length = 255)
    private String password;

    @NotBlank(message = "Name is mandatory")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Role is mandatory")
    @Column(nullable = false, length = 30)
    private String role; // ROLE_PLAYER, ROLE_EVENT_MANAGER, ROLE_TEAM_MANAGER, ROLE_SPONSOR

    @Column(length = 255)
    private String avatar;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
