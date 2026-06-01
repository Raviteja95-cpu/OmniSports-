import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SportEvent, TeamRegistration, MatchSchedule } from '../models/omni-sports.models';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<SportEvent[]> {
    return this.http.get<SportEvent[]>(this.apiUrl);
  }

  createEvent(event: Omit<SportEvent, 'id' | 'status' | 'createdBy'>): Observable<SportEvent> {
    return this.http.post<SportEvent>(this.apiUrl, event);
  }

  registerTeam(eventId: string, teamId: string): Observable<TeamRegistration> {
    const params = new HttpParams().set('teamId', teamId);
    return this.http.post<TeamRegistration>(`${this.apiUrl}/${eventId}/team-register`, {}, { params });
  }

  reviewRegistration(registrationId: string, status: 'approved' | 'rejected'): Observable<TeamRegistration> {
    const params = new HttpParams().set('status', status);
    return this.http.put<TeamRegistration>(`${this.apiUrl}/registrations/${registrationId}/review`, {}, { params });
  }

  generateSchedule(eventId: string): Observable<MatchSchedule[]> {
    return this.http.post<MatchSchedule[]>(`${this.apiUrl}/${eventId}/schedule`, {});
  }

  recordMatchResult(matchId: string, scoreA: number, scoreB: number, status: string): Observable<MatchSchedule> {
    const params = new HttpParams()
      .set('scoreA', scoreA.toString())
      .set('scoreB', scoreB.toString())
      .set('status', status);
    return this.http.put<MatchSchedule>(`${this.apiUrl}/matches/${matchId}/scores`, {}, { params });
  }
}
// Connected successfully to Spring Endpoints
