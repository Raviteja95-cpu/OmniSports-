package com.omnisports.controller;

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
}
