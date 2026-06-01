export type UserRole = 'player' | 'event_manager' | 'team_manager' | 'sponsor';

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
}
