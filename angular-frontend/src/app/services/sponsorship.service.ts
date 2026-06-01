import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SponsorshipOffer } from '../models/omni-sports.models';

@Injectable({
  providedIn: 'root'
})
export class SponsorshipService {
  private apiUrl = 'http://localhost:8080/api/sponsorships';

  constructor(private http: HttpClient) {}

  getSponsorships(): Observable<SponsorshipOffer[]> {
    return this.http.get<SponsorshipOffer[]>(this.apiUrl);
  }

  disburseOffer(offer: Omit<SponsorshipOffer, 'id' | 'status' | 'timestamp'>): Observable<SponsorshipOffer> {
    return this.http.post<SponsorshipOffer>(`${this.apiUrl}/disburse`, offer);
  }

  reviewOffer(offerId: string, status: 'accepted' | 'rejected'): Observable<SponsorshipOffer> {
    const params = new HttpParams().set('status', status);
    return this.http.put<SponsorshipOffer>(`${this.apiUrl}/offers/${offerId}/review`, {}, { params });
  }

  getOffersByTarget(targetType: string, targetId: string): Observable<SponsorshipOffer[]> {
    const params = new HttpParams()
      .set('targetType', targetType)
      .set('targetId', targetId);
    return this.http.get<SponsorshipOffer[]>(`${this.apiUrl}/target`, { params });
  }
}
