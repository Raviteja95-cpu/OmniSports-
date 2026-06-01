package com.omnisports.model;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username cannot be empty")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    private String password;

    @NotBlank(message = "Full Name cannot be empty")
    private String name;

    @NotBlank(message = "User Corporate Role cannot be empty")
    private String role; // PLAYER, EVENT_MANAGER, TEAM_MANAGER, SPONSOR

    private String avatar;
}
