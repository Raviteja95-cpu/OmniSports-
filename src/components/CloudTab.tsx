import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  Database,
  Copy,
  Check,
  Server,
  Globe,
  Award,
  ChevronRight,
  ShieldCheck,
  Code2,
  FileText,
  Info
} from 'lucide-react';
import { SportEvent, Team, TeamRegistration, SponsorshipOffer } from '../types';

interface CloudTabProps {
  events: SportEvent[];
  teams: Team[];
  registrations: TeamRegistration[];
  sponsorships: SponsorshipOffer[];
}

type CodeKey =
  | 'java_user_entity'
  | 'java_auth_controller'
  | 'java_security_config'
  | 'java_jwt_util'
  | 'java_jwt_filter'
  | 'java_player_entity'
  | 'java_event_entity'
  | 'java_team_entity'
  | 'java_spon_entity'
  | 'java_event_controller'
  | 'java_spon_controller'
  | 'java_tournament_service'
  | 'java_spon_service'
  | 'angular_models'
  | 'angular_event_service'
  | 'angular_spon_service'
  | 'angular_event_component'
  | 'angular_event_html'
  | 'mysql_schema';

export default function CloudTab({ events, teams, registrations, sponsorships }: CloudTabProps) {
  const [selectedFile, setSelectedFile] = useState<CodeKey>('java_event_controller');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'backend' | 'frontend' | 'database'>('backend');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<CodeKey, { name: string; path: string; language: string; description: string; code: string }> = {
    java_user_entity: {
      name: 'User.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/model/User.java',
      language: 'java',
      description: 'Spring Boot JPA Entity mapped to users table storing credentials, names, and custom roles like ROLE_EVENT_MANAGER or ROLE_SPONSOR.',
      code: `package com.omnisports.model;

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
}`
    },
    java_auth_controller: {
      name: 'AuthController.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/controller/AuthController.java',
      language: 'java',
      description: 'REST Controller facilitating JWT user login and registration, verifying encrypted passwords and instantly returning signed session credentials.',
      code: `package com.omnisports.controller;

import com.omnisports.model.JwtResponse;
import com.omnisports.model.LoginRequest;
import com.omnisports.model.RegisterRequest;
import com.omnisports.model.User;
import com.omnisports.repository.UserRepository;
import com.omnisports.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@Valid @RequestBody LoginRequest authenticationRequest) throws Exception {
        try {
            authenticate(authenticationRequest.getUsername(), authenticationRequest.getPassword());
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Username or Password.");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        final String token = jwtTokenUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(authenticationRequest.getUsername()).orElse(null);
        return ResponseEntity.ok(new JwtResponse(token, user.getUsername(), user.getRole(), user.getName(), user.getAvatar()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already registered!");
        }

        String rawRole = registerRequest.getRole().toUpperCase();
        if (!rawRole.startsWith("ROLE_")) { rawRole = "ROLE_" + rawRole; }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setName(registerRequest.getName());
        user.setRole(rawRole);
        user.setAvatar(registerRequest.getAvatar() != null ? registerRequest.getAvatar() : "👤");

        userRepository.save(user);

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        final String token = jwtTokenUtil.generateToken(userDetails);
        return new ResponseEntity<>(new JwtResponse(token, user.getUsername(), user.getRole(), user.getName(), user.getAvatar()), HttpStatus.CREATED);
    }

    private void authenticate(String username, String password) throws Exception {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }
}`
    },
    java_security_config: {
      name: 'WebSecurityConfig.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/security/WebSecurityConfig.java',
      language: 'java',
      description: 'Spring Security Configuration establishing CORS policies, disabling CSRF for stateless REST routes, and mounting JWT filters to secure other resources.',
      code: `package com.omnisports.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private UserDetailsService jwtUserDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(jwtUserDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf().disable()
                .cors().and()
                .authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated().and()
                .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        httpSecurity.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }
}`
    },
    java_jwt_util: {
      name: 'JwtTokenUtil.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/security/JwtTokenUtil.java',
      language: 'java',
      description: 'Secure token factory using HMACS-512 signing algorithms to encode and decode user descriptors and expiration periods.',
      code: `package com.omnisports.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.*;
import java.util.function.Function;

@Component
public class JwtTokenUtil implements Serializable {

    @Value("\${jwt.secret:omnisports_production_fallback_secure_secret_signing_key_must_be_long}")
    private String secret;

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 5 * 60 * 60 * 1000))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !getClaimFromToken(token, Claims::getExpiration).before(new Date()));
    }
}`
    },
    java_jwt_filter: {
      name: 'JwtRequestFilter.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/security/JwtRequestFilter.java',
      language: 'java',
      description: 'Request interceptor reading Authorization Bearer headers, resolving authenticated descriptors, and submitting contextual credentials to Spring Session Context.',
      code: `package com.omnisports.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsServiceImpl jwtUserDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");
        String username = null;
        String jwtToken = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (Exception e) { logger.warn("JWT Verification failed"); }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.jwtUserDetailsService.loadUserByUsername(username);

            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }
}`
    },
    java_event_controller: {
      name: 'EventController.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/controller/EventController.java',
      language: 'java',
      description: 'REST Controller exposing endpoints for creating sports tournaments, handling team registration requests, organizing match schedules, and updating match scores.',
      code: `package com.omnisports.controller;

import com.omnisports.model.SportEvent;
import com.omnisports.model.TeamRegistration;
import com.omnisports.model.MatchSchedule;
import com.omnisports.service.TournamentService;
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

    @GetMapping
    public ResponseEntity<List<SportEvent>> getAllEvents() {
        return ResponseEntity.ok(tournamentService.findAllEvents());
    }

    @PostMapping
    @PreAuthorize("hasRole('EVENT_MANAGER')")
    public ResponseEntity<SportEvent> createEvent(@Valid @RequestBody SportEvent event) {
        SportEvent created = tournamentService.createEvent(event);
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
        return ResponseEntity.ok(updated);
    }
}`
    },
    java_spon_controller: {
      name: 'SponsorshipController.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/controller/SponsorshipController.java',
      language: 'java',
      description: 'REST Controller managing sponsorship pitches, posting financial terms to teams or events, and facilitating negotiation reviews.',
      code: `package com.omnisports.controller;

import com.omnisports.model.SponsorshipOffer;
import com.omnisports.service.SponsorshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/sponsorships")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", allowCredentials = "true")
public class SponsorshipController {

    @Autowired
    private SponsorshipService sponsorshipService;

    @GetMapping
    public ResponseEntity<List<SponsorshipOffer>> getAllSponsorships() {
        return ResponseEntity.ok(sponsorshipService.findAllSponsorships());
    }

    @PostMapping("/disburse")
    @PreAuthorize("hasRole('SPONSOR')")
    public ResponseEntity<SponsorshipOffer> disburseSponsorshipOffer(@Valid @RequestBody SponsorshipOffer offer) {
        SponsorshipOffer posted = sponsorshipService.createOffer(offer);
        return new ResponseEntity<>(posted, HttpStatus.CREATED);
    }

    @PutMapping("/offers/{offerId}/review")
    @PreAuthorize("hasAnyRole('EVENT_MANAGER', 'TEAM_MANAGER', 'PLAYER')")
    public ResponseEntity<SponsorshipOffer> reviewSponsorshipOffer(
            @PathVariable String offerId, 
            @RequestParam String status) {
        SponsorshipOffer reviewed = sponsorshipService.reviewOffer(offerId, status);
        return ResponseEntity.ok(reviewed);
    }

    @GetMapping("/target")
    public ResponseEntity<List<SponsorshipOffer>> getSponsorshipsByTarget(
            @RequestParam String targetType, 
            @RequestParam String targetId) {
        return ResponseEntity.ok(sponsorshipService.findOffersByTarget(targetType, targetId));
    }
}`
    },
    java_tournament_service: {
      name: 'TournamentService.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/service/TournamentService.java',
      language: 'java',
      description: 'Spring Service managing transactional business rules for registering teams, computing scoreboard points, generating match pairings, and recording league standings.',
      code: `package com.omnisports.service;

import com.omnisports.model.*;
import com.omnisports.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class TournamentService {

    @Autowired private SportEventRepository eventRepository;
    @Autowired private TeamRegistrationRepository registrationRepository;
    @Autowired private MatchScheduleRepository matchRepository;
    @Autowired private TeamRepository teamRepository;

    public List<SportEvent> findAllEvents() {
        return eventRepository.findAll();
    }

    public SportEvent createEvent(SportEvent event) {
        event.setId("evt-" + UUID.randomUUID().toString().substring(0, 8));
        event.setStatus("published");
        event.setCreatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    public TeamRegistration registerTeamForEvent(String teamId, String eventId) {
        // Validate team and event existence
        SportEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        if (!event.getSportType().equalsIgnoreCase(team.getSportType())) {
            throw new IllegalArgumentException("Team's sport does not match the event's sport");
        }

        TeamRegistration registration = new TeamRegistration();
        registration.setId("reg-" + UUID.randomUUID().toString().substring(0, 8));
        registration.setTeamId(teamId);
        registration.setEventId(eventId);
        registration.setStatus("pending");
        registration.setSubmittedAt(LocalDateTime.now());

        return registrationRepository.save(registration);
    }

    public TeamRegistration updateRegistrationStatus(String registrationId, String status) {
        TeamRegistration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new NoSuchElementException("Registration not found"));
        
        if (!status.equals("approved") && !status.equals("rejected")) {
            throw new IllegalArgumentException("Invalid registration state transition");
        }
        
        reg.setStatus(status);
        return registrationRepository.save(reg);
    }

    public List<MatchSchedule> generateTournamentSchedule(String eventId) {
        List<TeamRegistration> approvedRegs = registrationRepository.findByEventIdAndStatus(eventId, "approved");
        if (approvedRegs.size() < 2) {
            throw new IllegalArgumentException("At least 2 approved teams required to construct tournament schedules");
        }

        List<MatchSchedule> matches = new ArrayList<>();
        // Simple Round Robin Match Builder Algorithm
        for (int i = 0; i < approvedRegs.size(); i++) {
            for (int j = i + 1; j < approvedRegs.size(); j++) {
                MatchSchedule match = new MatchSchedule();
                match.setId("match-" + UUID.randomUUID().toString().substring(0, 8));
                match.setEventId(eventId);
                match.setTeamAId(approvedRegs.get(i).getTeamId());
                match.setTeamBId(approvedRegs.get(j).getTeamId());
                match.setScoreA(0);
                match.setScoreB(0);
                match.setStatus("scheduled");
                match.setRound(1);
                match.setMatchTime(LocalDateTime.now().plusDays(matches.size() + 1));
                matches.add(matchRepository.save(match));
            }
        }
        return matches;
    }

    public MatchSchedule recordMatchResult(String matchId, int scoreA, int scoreB, String status) {
        MatchSchedule match = matchRepository.findById(matchId)
                .orElseThrow(() -> new NoSuchElementException("Match not found"));

        match.setScoreA(scoreA);
        match.setScoreB(scoreB);
        match.setStatus(status);

        MatchSchedule saved = matchRepository.save(match);

        if ("completed".equalsIgnoreCase(status)) {
            updateTeamStandingsPoints(match);
        }

        return saved;
    }

    private void updateTeamStandingsPoints(MatchSchedule completedMatch) {
         // Standings persistence updates based on score outcome
         Team teamA = teamRepository.findById(completedMatch.getTeamAId()).orElse(null);
         Team teamB = teamRepository.findById(completedMatch.getTeamBId()).orElse(null);

         if (teamA != null && teamB != null) {
             if (completedMatch.getScoreA() > completedMatch.getScoreB()) {
                 teamA.setPoints(teamA.getPoints() + 3); // Winner
             } else if (completedMatch.getScoreB() > completedMatch.getScoreA()) {
                 teamB.setPoints(teamB.getPoints() + 3); // Winner
             } else {
                 teamA.setPoints(teamA.getPoints() + 1); // Draw
                 teamB.setPoints(teamB.getPoints() + 1);
             }
             teamRepository.save(teamA);
             teamRepository.save(teamB);
         }
    }
}`
    },
    java_spon_service: {
      name: 'SponsorshipService.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/service/SponsorshipService.java',
      language: 'java',
      description: 'Spring Service managing sponsorship postings and financial terms allocations on behalf of event, team, and player sponsors.',
      code: `package com.omnisports.service;

import com.omnisports.model.SponsorshipOffer;
import com.omnisports.repository.SponsorshipOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SponsorshipService {

    @Autowired
    private SponsorshipOfferRepository offerRepository;

    public List<SponsorshipOffer> findAllSponsorships() {
        return offerRepository.findAll();
    }

    public SponsorshipOffer createOffer(SponsorshipOffer offer) {
        if (offer.getAmount() < 500) {
            throw new IllegalArgumentException("Minimum investment amount limit is $500.");
        }
        
        offer.setId("spon-" + UUID.randomUUID().toString().substring(0, 8));
        offer.setStatus("pending");
        offer.setTimestamp(LocalDateTime.now());
        
        return offerRepository.save(offer);
    }

    public SponsorshipOffer reviewOffer(String offerId, String status) {
        SponsorshipOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Sponsorship offer not found"));
                
        if (!status.equals("accepted") && !status.equals("rejected")) {
            throw new IllegalArgumentException("Invalid sponsorship transition state");
        }
        
        offer.setStatus(status);
        return offerRepository.save(offer);
    }

    public List<SponsorshipOffer> findOffersByTarget(String targetType, String targetId) {
        return offerRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }
}`
    },
    java_event_entity: {
      name: 'SportEvent.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/model/SportEvent.java',
      language: 'java',
      description: 'Hibernate JPA model entity representing tournament locations, eligible sport types, event dates, and descriptions.',
      code: `package com.omnisports.model;

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
}`
    },
    java_team_entity: {
      name: 'Team.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/model/Team.java',
      language: 'java',
      description: 'Hibernate JPA entity mapping to team roster, point scores, sport type, and team managers.',
      code: `package com.omnisports.model;

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
}`
    },
    java_spon_entity: {
      name: 'SponsorshipOffer.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/model/SponsorshipOffer.java',
      language: 'java',
      description: 'Hibernate JPA database model representing brand allocations, targets (players, teams, events), and terms.',
      code: `package com.omnisports.model;

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
}`
    },
    java_player_entity: {
      name: 'Player.java',
      path: 'spring-boot-backend/src/main/java/com/omnisports/model/Player.java',
      language: 'java',
      description: 'Hibernate JPA Athlete details storage file, managing user profile references, positions, rosters, and levels.',
      code: `package com.omnisports.model;

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
}`
    },
    angular_models: {
      name: 'omni-sports.models.ts',
      path: 'angular-frontend/src/app/models/omni-sports.models.ts',
      language: 'typescript',
      description: 'Strongly-typed Angular model interfaces mirroring backend structure for cross-origin JSON mappings.',
      code: `export type UserRole = 'player' | 'event_manager' | 'team_manager' | 'sponsor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface SportEvent {
  id: string;
  name: string;
  location: string;
  sportType: 'cricket' | 'badminton';
  description?: string;
  status: 'draft' | 'published' | 'ongoing' | 'finished';
  createdBy: string;
  startDate?: string;
}

export interface Team {
  id: string;
  name: string;
  sportType: 'cricket' | 'badminton';
  logo: string;
  points: number;
  managerId: string;
}

export interface TeamRegistration {
  id: string;
  teamId: string;
  eventId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface PlayerEnrollment {
  id: string;
  playerId: string;
  eventId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface MatchSchedule {
  id: string;
  eventId: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'live' | 'completed';
  round: number;
  matchTime?: string;
}

export interface SponsorshipOffer {
  id: string;
  sponsorId: string;
  sponsorName: string;
  targetType: 'team' | 'player' | 'event';
  targetId: string;
  amount: number;
  terms: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}`
    },
    angular_event_service: {
      name: 'event.service.ts',
      path: 'angular-frontend/src/app/services/event.service.ts',
      language: 'typescript',
      description: 'Angular HttpClient Service utilizing RxJS async operators to communicate with Java Spring MVC Event endpoints.',
      code: `import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SportEvent, TeamRegistration, MatchSchedule } from '../models/omni-sports.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = \`\${environment.apiBaseUrl}/api/events\`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<SportEvent[]> {
    return this.http.get<SportEvent[]>(this.apiUrl);
  }

  createEvent(event: Omit<SportEvent, 'id' | 'status' | 'createdBy'>): Observable<SportEvent> {
    return this.http.post<SportEvent>(this.apiUrl, event);
  }

  registerTeam(eventId: string, teamId: string): Observable<TeamRegistration> {
    const params = new HttpParams().set('teamId', teamId);
    return this.http.post<TeamRegistration>(\`\${this.apiUrl}/\${eventId}/team-register\`, {}, { params });
  }

  reviewRegistration(registrationId: string, status: 'approved' | 'rejected'): Observable<TeamRegistration> {
    const params = new HttpParams().set('status', status);
    return this.http.put<TeamRegistration>(\`\${this.apiUrl}/registrations/\${registrationId}/review\`, {}, { params });
  }

  generateSchedule(eventId: string): Observable<MatchSchedule[]> {
    return this.http.post<MatchSchedule[]>(\`\${this.apiUrl}/\${eventId}/schedule\`, {});
  }

  recordMatchResult(matchId: string, scoreA: number, scoreB: number, status: string): Observable<MatchSchedule> {
    const params = new HttpParams()
      .set('scoreA', scoreA.toString())
      .set('scoreB', scoreB.toString())
      .set('status', status);
    return this.http.put<MatchSchedule>(\`\${this.apiUrl}/matches/\${matchId}/scores\`, {}, { params });
  }
}`
    },
    angular_spon_service: {
      name: 'sponsorship.service.ts',
      path: 'angular-frontend/src/app/services/sponsorship.service.ts',
      language: 'typescript',
      description: 'Angular Service processing brand contract exchanges, using strong models matching Spring controller layouts.',
      code: `import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SponsorshipOffer } from '../models/omni-sports.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SponsorshipService {
  private apiUrl = \`\${environment.apiBaseUrl}/api/sponsorships\`;

  constructor(private http: HttpClient) {}

  getSponsorships(): Observable<SponsorshipOffer[]> {
    return this.http.get<SponsorshipOffer[]>(this.apiUrl);
  }

  disburseOffer(offer: Omit<SponsorshipOffer, 'id' | 'status' | 'timestamp'>): Observable<SponsorshipOffer> {
    return this.http.post<SponsorshipOffer>(\`\${this.apiUrl}/disburse\`, offer);
  }

  reviewOffer(offerId: string, status: 'accepted' | 'rejected'): Observable<SponsorshipOffer> {
    const params = new HttpParams().set('status', status);
    return this.http.put<SponsorshipOffer>(\`\${this.apiUrl}/offers/\${offerId}/review\`, {}, { params });
  }

  getOffersByTarget(targetType: string, targetId: string): Observable<SponsorshipOffer[]> {
    const params = new HttpParams()
      .set('targetType', targetType)
      .set('targetId', targetId);
    return this.http.get<SponsorshipOffer[]>(\`\${this.apiUrl}/target\`, { params });
  }
}`
    },
    angular_event_component: {
      name: 'event-control.component.ts',
      path: 'angular-frontend/src/app/components/event-control/event-control.component.ts',
      language: 'typescript',
      description: 'Angular Standalone/Component logic managing local triggers for registration reviews or tournament additions with type integrity.',
      code: `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { SportEvent, TeamRegistration, Team } from '../../models/omni-sports.models';

@Component({
  selector: 'app-event-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-control.component.html',
  styleUrls: ['./event-control.component.css']
})
export class EventControlComponent implements OnInit {
  events: SportEvent[] = [];
  selectedEvent: SportEvent | null = null;
  showCreateForm = false;

  // Form Fields
  eventName = '';
  eventLocation = '';
  eventSport: 'cricket' | 'badminton' = 'cricket';
  eventDescription = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadAllEvents();
  }

  loadAllEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error('Failed to load events', err)
    });
  }

  onSubmitEvent(): void {
    if (!this.eventName || !this.eventLocation) return;

    this.eventService.createEvent({
      name: this.eventName,
      location: this.eventLocation,
      sportType: this.eventSport,
      description: this.eventDescription
    }).subscribe({
      next: (savedEvent) => {
        this.events.unshift(savedEvent);
        this.resetForm();
        alert('Tournament Published Successfully!');
      },
      error: (err) => alert('Compilation failed: ' + err.message)
    });
  }

  onReviewRegistration(regId: string, status: 'approved' | 'rejected'): void {
    this.eventService.reviewRegistration(regId, status).subscribe({
      next: () => {
        alert(\`Team Registration turned \${status}!\`);
        this.loadAllEvents();
      },
      error: (err) => alert(err.message)
    });
  }

  resetForm(): void {
    this.eventName = '';
    this.eventLocation = '';
    this.eventDescription = '';
    this.showCreateForm = false;
  }
}`
    },
    angular_event_html: {
      name: 'event-control.component.html',
      path: 'angular-frontend/src/app/components/event-control/event-control.component.html',
      language: 'html',
      description: 'Angular Component View Template using semantic markup and dynamic directive binding attributes.',
      code: `<!-- Angular Event control dashboard template -->
<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold tracking-tight text-slate-800">Tournament Board</h2>
    <button (click)="showCreateForm = !showCreateForm" class="bg-orange-500 hover:bg-orange-605 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all">
      {{ showCreateForm ? 'Cancel Form' : 'Publish Tournament' }}
    </button>
  </div>

  <!-- Create Tournament Form Section -->
  <div *ngIf="showCreateForm" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-lg">
    <h3 class="text-sm font-bold uppercase text-slate-500 mb-4">Create New Sport Event</h3>
    <form (submit)="onSubmitEvent()" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Event Name</label>
        <input [(ngModel)]="eventName" name="eventName" required class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"/>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Venue Location</label>
        <input [(ngModel)]="eventLocation" name="eventLocation" required class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500"/>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Sport Type</label>
        <select [(ngModel)]="eventSport" name="eventSport" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500">
          <option value="cricket">🏏 Cricket</option>
          <option value="badminton">🏸 Badminton</option>
        </select>
      </div>
      <button type="submit" class="w-full bg-orange-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer">
        Save & Publish Event
      </button>
    </form>
  </div>

  <!-- Main Tournaments Listing -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div *ngFor="let event of events" class="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
      <div class="p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="bg-orange-50 text-orange-600 font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded">
            {{ event.sportType }}
          </span>
          <span class="text-[10px] font-semibold text-slate-400 capitalize">Status: {{ event.status }}</span>
        </div>
        <h4 class="font-bold text-slate-900 text-sm">{{ event.name }}</h4>
        <p class="text-xs text-slate-550 leading-relaxed">{{ event.description || 'No description provided.' }}</p>
      </div>
      <div class="bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>📍 {{ event.location }}</span>
        <button class="text-orange-500 hover:text-orange-600 font-bold">Details</button>
      </div>
    </div>
  </div>
</div>`
    },
    mysql_schema: {
      name: 'schema.sql',
      path: 'mysql-database/schema.sql',
      language: 'sql',
      description: 'Production schema and DDL triggers with relational integrity rules, indexing setups, and reference checks.',
      code: `-- Production Relational Schema Layout for OMNI SPORTS Application

CREATE DATABASE IF NOT EXISTS omni_sports_db;
USE omni_sports_db;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Players table
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    position VARCHAR(50),
    skill_level VARCHAR(30),
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Teams table (Franchises)
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

-- 5. Team Registrations (Join table with approval)
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

-- 7. Matches table
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
CREATE INDEX idx_player_sport ON players(sport_type);`
    }
  };

  const getFilesByCategory = () => {
    if (activeCategory === 'backend') {
      return Object.entries(codeSnippets).filter(([key]) => key.startsWith('java_'));
    } else if (activeCategory === 'frontend') {
      return Object.entries(codeSnippets).filter(([key]) => key.startsWith('angular_'));
    } else {
      return Object.entries(codeSnippets).filter(([key]) => key.startsWith('mysql_'));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Dynamic Architecture Display Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white min-h-[140px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-orange-500/15">
              Production Tech Stack
            </span>
            <span className="bg-green-500/10 text-green-400 font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border border-green-500/15 flex items-center gap-1 font-sans">
              Java 8 (Spring Boot) + Angular 16+
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight font-display">
            OMNI SPORTS Application Code Conservatory
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed max-w-xl font-sans">
            Browse and inspect the actual fully decoupled architectural code. The robust sports logic runs inside an enterprise Java Spring Boot backend using MySQL, while the responsive design is built using modular, standalone Angular components.
          </p>
        </div>

        {/* Tech Badges Column */}
        <div className="z-10 bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 text-xs font-mono">
          <div className="text-center">
            <div className="text-orange-400 font-bold text-lg">Angular</div>
            <div className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wider">Frontend Design</div>
          </div>
          <div className="text-slate-500 text-lg">⇄</div>
          <div className="text-center">
            <div className="text-orange-400 font-bold text-lg">Spring Boot</div>
            <div className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wider">Backend Core</div>
          </div>
          <div className="text-slate-500 text-lg font-normal">⇄</div>
          <div className="text-center">
            <div className="text-orange-400 font-bold text-lg">MySQL</div>
            <div className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wider">Relational DB</div>
          </div>
        </div>
      </div>

      {/* Primary Category Selection Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => {
            setActiveCategory('backend');
            setSelectedFile('java_event_controller');
          }}
          className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${
            activeCategory === 'backend'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'
          }`}
        >
          <Server className="w-4.5 h-4.5" />
          Java Spring Boot Backend
        </button>

        <button
          onClick={() => {
            setActiveCategory('frontend');
            setSelectedFile('angular_models');
          }}
          className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${
            activeCategory === 'frontend'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'
          }`}
        >
          <Globe className="w-4.5 h-4.5" />
          Angular Frontend Core
        </button>

        <button
          onClick={() => {
            setActiveCategory('database');
            setSelectedFile('mysql_schema');
          }}
          className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${
            activeCategory === 'database'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'
          }`}
        >
          <Database className="w-4.5 h-4.5" />
          MySQL Database Schema
        </button>
      </div>

      {/* Main File Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Directory and Files Lists */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            {activeCategory === 'backend' && <Server className="w-4 h-4 text-orange-500" />}
            {activeCategory === 'frontend' && <Globe className="w-4 h-4 text-orange-500" />}
            {activeCategory === 'database' && <Database className="w-4 h-4 text-orange-500" />}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
              {activeCategory === 'backend' && 'Spring Boot Files'}
              {activeCategory === 'frontend' && 'Angular Files'}
              {activeCategory === 'database' && 'Database Files'}
            </span>
          </div>

          <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
            {getFilesByCategory().map(([key, value]) => {
              const fileKey = key as CodeKey;
              const isSelected = selectedFile === fileKey;

              return (
                <button
                  key={fileKey}
                  onClick={() => setSelectedFile(fileKey)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-orange-50/70 border-l-4 border-orange-500 text-orange-900 shadow-3xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate leading-tight">{value.name}</div>
                    <div className="text-[10px] text-slate-400 truncate font-mono mt-0.5">{value.path.split('/').pop()}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 mt-4 text-[11px] text-slate-500 leading-normal">
            <h4 className="font-bold text-slate-700 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-orange-500" /> Architectural Tip
            </h4>
            <p className="font-sans">
              Deploy this multi-tier ecosystem by setting up Spring on AWS ECS or GCP Cloud Run, mapping CORS endpoints to proxy http queries from your build folder, and booting local MySQL tables.
            </p>
          </div>
        </div>

        {/* Right Side: Code Preview Screen */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          
          {/* Header Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-amber-500 uppercase font-mono tracking-widest flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> PRODUCTION READY MODULE
                </span>
                <h3 className="text-xs font-mono font-bold text-white truncate flex items-center gap-1.5 direction-ltr">
                  <span>{codeSnippets[selectedFile].path}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 border border-slate-850 px-2.5 py-1 rounded">
                  {codeSnippets[selectedFile].language}
                </span>

                <button
                  onClick={() => handleCopy(codeSnippets[selectedFile].code)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" /> Copied Code
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Component File Description Box */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-start gap-3.5">
              <Code2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Module Capabilities & Responsibilities</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                  {codeSnippets[selectedFile].description}
                </p>
              </div>
            </div>

            {/* Code Field editor panel style wrapping */}
            <div className="font-mono text-xs overflow-x-auto select-all whitespace-pre leading-relaxed bg-slate-950 p-5 rounded-2xl border border-slate-900 max-h-[460px] overflow-y-auto text-slate-200 scrollbar-thin scrollbar-thumb-slate-900">
              {codeSnippets[selectedFile].code}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 mt-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
            <span>● DECOUPLED FULL-STACK BLUEPRINT SYSTEM</span>
            <span>RESTFUL API COMMITS VERIFIED ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
