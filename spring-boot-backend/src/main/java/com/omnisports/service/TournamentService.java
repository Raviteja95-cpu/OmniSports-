package com.omnisports.service;

import com.omnisports.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class TournamentService {

    // Simulating transactional DB operations with Hibernate-style state updates
    private final List<SportEvent> events = new ArrayList<>();
    private final List<TeamRegistration> registrations = new ArrayList<>();
    private final List<MatchSchedule> matches = new ArrayList<>();
    private final List<Team> teams = new ArrayList<>();

    public List<SportEvent> findAllEvents() {
        return events;
    }

    public SportEvent createEvent(SportEvent event) {
        event.setId("evt-" + UUID.randomUUID().toString().substring(0, 8));
        event.setStatus("published");
        event.setCreatedAt(LocalDateTime.now());
        events.add(event);
        return event;
    }

    public TeamRegistration registerTeamForEvent(String teamId, String eventId) {
        TeamRegistration registration = new TeamRegistration();
        registration.setId("reg-" + UUID.randomUUID().toString().substring(0, 8));
        registration.setTeamId(teamId);
        registration.setEventId(eventId);
        registration.setStatus("pending");
        registration.setSubmittedAt(LocalDateTime.now());
        registrations.add(registration);
        return registration;
    }

    public TeamRegistration updateRegistrationStatus(String registrationId, String status) {
        for (TeamRegistration reg : registrations) {
            if (reg.getId().equals(registrationId)) {
                reg.setStatus(status);
                return reg;
            }
        }
        throw new NoSuchElementException("Registration ID " + registrationId + " not found.");
    }

    public List<MatchSchedule> generateTournamentSchedule(String eventId) {
        List<TeamWithReg> participants = new ArrayList<>();
        for (TeamRegistration reg : registrations) {
            if (reg.getEventId().equals(eventId) && "approved".equals(reg.getStatus())) {
                participants.add(new TeamWithReg(reg.getTeamId()));
            }
        }

        if (participants.size() < 2) {
            throw new IllegalArgumentException("At least 2 approved teams are required to construct tournament schedules.");
        }

        List<MatchSchedule> generated = new ArrayList<>();
        // Construct pairings algorithm
        for (int i = 0; i < participants.size(); i++) {
            for (int j = i + 1; j < participants.size(); j++) {
                MatchSchedule match = new MatchSchedule();
                match.setId("match-" + UUID.randomUUID().toString().substring(0, 8));
                match.setEventId(eventId);
                match.setTeamAId(participants.get(i).teamId);
                match.setTeamBId(participants.get(j).teamId);
                match.setScoreA(0);
                match.setScoreB(0);
                match.setStatus("scheduled");
                match.setRound(1);
                match.setMatchTime(LocalDateTime.now().plusDays(generated.size() + 1));
                matches.add(match);
                generated.add(match);
            }
        }
        return generated;
    }

    public MatchSchedule recordMatchResult(String matchId, int scoreA, int scoreB, String status) {
        for (MatchSchedule m : matches) {
            if (m.getId().equals(matchId)) {
                m.setScoreA(scoreA);
                m.setScoreB(scoreB);
                m.setStatus(status);
                return m;
            }
        }
        throw new NoSuchElementException("Match ID " + matchId + " not found.");
    }

    private static class TeamWithReg {
        String teamId;
        TeamWithReg(String id) { this.teamId = id; }
    }
}
