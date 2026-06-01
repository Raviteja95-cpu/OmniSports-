package com.omnisports.controller;

import com.omnisports.model.SportEvent;
import com.omnisports.model.TeamRegistration;
import com.omnisports.model.MatchSchedule;
import com.omnisports.service.TournamentService;
import com.omnisports.service.KafkaProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", allowCredentials = "true")
public class EventController {

    @Autowired
    private TournamentService tournamentService;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @GetMapping
    public ResponseEntity<List<SportEvent>> getAllEvents() {
        return ResponseEntity.ok(tournamentService.findAllEvents());
    }

    @PostMapping
    @PreAuthorize("hasRole('EVENT_MANAGER')")
    public ResponseEntity<SportEvent> createEvent(@Valid @RequestBody SportEvent event) {
        SportEvent created = tournamentService.createEvent(event);
        kafkaProducerService.publishEventCreated(
                created.getId(),
                created.getName(),
                created.getSportType(),
                created.getLocation()
        );
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{eventId}/team-register")
    @PreAuthorize("hasRole('TEAM_MANAGER')")
    public ResponseEntity<TeamRegistration> registerTeam(
            @PathVariable String eventId, 
            @RequestParam String teamId) {
        TeamRegistration registration = tournamentService.registerTeamForEvent(teamId, eventId);
        return new ResponseEntity<>(registration, HttpStatus.ACCEPTED);
    }

    @PutMapping("/registrations/{registrationId}/review")
    @PreAuthorize("hasRole('EVENT_MANAGER')")
    public ResponseEntity<TeamRegistration> reviewRegistration(
            @PathVariable String registrationId, 
            @RequestParam String status) {
        TeamRegistration reviewed = tournamentService.updateRegistrationStatus(registrationId, status);
        return ResponseEntity.ok(reviewed);
    }

    @PostMapping("/{eventId}/schedule")
    @PreAuthorize("hasRole('EVENT_MANAGER')")
    public ResponseEntity<List<MatchSchedule>> generateSchedule(@PathVariable String eventId) {
        List<MatchSchedule> matches = tournamentService.generateTournamentSchedule(eventId);
        return ResponseEntity.ok(matches);
    }

    @PutMapping("/matches/{matchId}/scores")
    @PreAuthorize("hasRole('EVENT_MANAGER')")
    public ResponseEntity<MatchSchedule> recordMatchScore(
            @PathVariable String matchId,
            @RequestParam int scoreA,
            @RequestParam int scoreB,
            @RequestParam String status) {
        MatchSchedule updated = tournamentService.recordMatchResult(matchId, scoreA, scoreB, status);
        kafkaProducerService.publishMatchResult(
                updated.getId(),
                updated.getEventId(),
                updated.getTeamAId(),
                updated.getTeamBId(),
                updated.getScoreA(),
                updated.getScoreB(),
                updated.getStatus()
        );
        return ResponseEntity.ok(updated);
    }
}

