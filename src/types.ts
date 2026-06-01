export type UserRole = 'event_manager' | 'team_manager' | 'player' | 'sponsor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  companyName?: string; // For sponsors
}

export interface SportEvent {
  id: string;
  name: string;
  sportType: 'cricket' | 'badminton' | 'soccer' | 'basketball' | 'tennis';
  venue: string;
  date: string;
  time: string;
  status: 'draft' | 'published';
  createdBy: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  sportType: string;
  managerId: string;
  description: string;
}

export interface TeamRegistration {
  id: string;
  teamId: string;
  eventId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Player {
  id: string;
  userId: string;
  name: string;
  sportType: 'cricket' | 'badminton' | 'soccer' | 'basketball' | 'tennis';
  skillLevel: 'Beginner' | 'Intermediate' | 'Professional';
  teamId: string | null;
  position: string;
  description: string;
  avatar?: string;
}

export interface MatchSchedule {
  id: string;
  eventId: string;
  teamAId: string;
  teamBId: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'completed';
  scoreA?: number;
  scoreB?: number;
  winnerId?: string;
  notes?: string;
}

export interface SponsorshipOffer {
  id: string;
  sponsorId: string;
  sponsorName: string;
  targetType: 'team' | 'player' | 'event';
  targetId: string; // references teamId, playerId, or eventId
  amount: number;
  terms: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface TournamentStanding {
  teamId: string;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  form: Array<'W' | 'L' | 'D'>;
}

export interface PlayerEnrollment {
  id: string;
  playerId: string;
  eventId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

