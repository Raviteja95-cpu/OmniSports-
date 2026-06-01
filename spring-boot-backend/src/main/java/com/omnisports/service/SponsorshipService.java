package com.omnisports.service;

import com.omnisports.model.SponsorshipOffer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SponsorshipService {

    private final List<SponsorshipOffer> offers = new ArrayList<>();

    public List<SponsorshipOffer> findAllSponsorships() {
        return offers;
    }

    public SponsorshipOffer createOffer(SponsorshipOffer offer) {
        if (offer.getAmount() < 500) {
            throw new IllegalArgumentException("Minimum investment amount limit is $500.");
        }
        
        offer.setId("spon-" + UUID.randomUUID().toString().substring(0, 8));
        offer.setStatus("pending");
        offer.setTimestamp(LocalDateTime.now());
        offers.add(offer);
        return offer;
    }

    public SponsorshipOffer reviewOffer(String offerId, String status) {
        for (SponsorshipOffer offer : offers) {
            if (offer.getId().equals(offerId)) {
                offer.setStatus(status);
                return offer;
            }
        }
        throw new IllegalArgumentException("Sponsorship offer not found: " + offerId);
    }

    public List<SponsorshipOffer> findOffersByTarget(String targetType, String targetId) {
        return offers.stream()
                .filter(o -> o.getTargetType().equalsIgnoreCase(targetType) && o.getTargetId().equals(targetId))
                .collect(Collectors.toList());
    }
}
