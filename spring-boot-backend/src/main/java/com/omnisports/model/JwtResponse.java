package com.omnisports.model;

import lombok.Data;
import java.io.Serializable;

@Data
public class JwtResponse implements Serializable {

    private static final long serialVersionUID = -8091879091924046844L;

    private final String token;
    private final String username;
    private final String role;
    private final String name;
    private final String avatar;

    public JwtResponse(String token, String username, String role, String name, String avatar) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.name = name;
        this.avatar = avatar;
    }
}
