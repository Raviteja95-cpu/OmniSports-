-- Production Relational Schema Layout for OMNI SPORTS Application

CREATE DATABASE IF NOT EXISTS omni_sports_db;
USE omni_sports_db;

-- 1. Users table (Central Credentials & Profile references)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Players table (Athletic details)
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    position VARCHAR(50),
    skill_level VARCHAR(30),
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Teams table (Regional Franchises)
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    sport_type VARCHAR(50) NOT NULL,
    logo VARCHAR(10) DEFAULT '🛡️',
    points INT DEFAULT 0,
    manager_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Events table (Tournaments)
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft | published | ongoing | finished
    created_by VARCHAR(36) NOT NULL,
    start_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Team Registrations (Join table linking teams and events)
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | approved | rejected
    submitted_at DATETIME NOT NULL,
    UNIQUE KEY uq_team_event (team_id, event_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Player enrollments
CREATE TABLE IF NOT EXISTS player_enrollments (
    id VARCHAR(36) PRIMARY KEY,
    player_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | approved | rejected
    submitted_at DATETIME NOT NULL,
    UNIQUE KEY uq_player_event (player_id, event_id),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Matches table (Fixtures schedule)
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    team_a_id VARCHAR(36) NOT NULL,
    team_b_id VARCHAR(36) NOT NULL,
    score_a INT DEFAULT 0,
    score_b INT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled | live | completed
    round INT NOT NULL DEFAULT 1,
    match_time DATETIME,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (team_a_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (team_b_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Sponsorship Offers
CREATE TABLE IF NOT EXISTS sponsorships (
    id VARCHAR(36) PRIMARY KEY,
    sponsor_id VARCHAR(36) NOT NULL,
    sponsor_name VARCHAR(100) NOT NULL,
    target_type VARCHAR(20) NOT NULL, -- team | player | event
    target_id VARCHAR(36) NOT NULL,
    amount INT NOT NULL,
    terms TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Relational indexes optimization setup to achieve higher throughput
CREATE INDEX idx_match_event ON matches(event_id);
CREATE INDEX idx_sponsorship_target ON sponsorships(target_type, target_id);
CREATE INDEX idx_player_sport ON players(sport_type);
