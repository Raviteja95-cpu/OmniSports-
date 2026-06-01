import { User, SportEvent, Team, TeamRegistration, Player, MatchSchedule, SponsorshipOffer } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-manager',
    name: 'Alex Mercer',
    email: 'alex@arena.com',
    role: 'event_manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Regional Tournament Director with 10+ years organizing professional sporting leagues.'
  },
  {
    id: 'u-team',
    name: 'Sarah Jenkins',
    email: 'sarah@vipers.com',
    role: 'team_manager',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Manager of the Desert Vipers Cricket Club. Striving for tactical dominance.'
  },
  {
    id: 'u-player',
    name: 'Marcus Thorne',
    email: 'marcus@vipers.com',
    role: 'player',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Opening batsman and premier fielder. Passionate about professional cricket.'
  },
  {
    id: 'u-sponsor',
    name: 'David Vance',
    email: 'david@quantum.com',
    role: 'sponsor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Chief Marketing Officer at Quantum Sports Energy. Supporting rising stars.',
    companyName: 'Quantum Energy Corp'
  }
];

export const INITIAL_EVENTS: SportEvent[] = [
  {
    id: 'e-cricket-1',
    name: 'Dubai Cricket Championship',
    sportType: 'cricket',
    venue: 'Dubai International Cricket Stadium',
    date: '2026-06-15',
    time: '18:00',
    status: 'published',
    createdBy: 'u-manager'
  },
  {
    id: 'e-badminton-1',
    name: 'Elite Badminton Arena Showdown',
    sportType: 'badminton',
    venue: 'Apex Court Center, Venue B',
    date: '2026-07-02',
    time: '10:00',
    status: 'published',
    createdBy: 'u-manager'
  },
  {
    id: 'e-soccer-1',
    name: 'Championship League Finals',
    sportType: 'soccer',
    venue: 'Metropolitan Arena',
    date: '2026-06-25',
    time: '19:30',
    status: 'draft',
    createdBy: 'u-manager'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 't-vipers',
    name: 'Desert Vipers',
    logo: '⚡',
    sportType: 'cricket',
    managerId: 'u-team',
    description: 'Premier cricket squad specializing in aggressive white-ball tournament play.'
  },
  {
    id: 't-smashers',
    name: 'Falcon Smashers',
    logo: '🏸',
    sportType: 'badminton',
    managerId: 'u-team-2',
    description: 'Dynamic badminton club covering doubles tactic boards and high-speed rallies.'
  },
  {
    id: 't-strikers',
    name: 'City Strikers FC',
    logo: '⚽',
    sportType: 'soccer',
    managerId: 'u-team-3',
    description: 'Fast-paced team focused on possession and precision shooting.'
  },
  {
    id: 't-sharks',
    name: 'Badminton Bay Sharks',
    logo: '🦈',
    sportType: 'badminton',
    managerId: 'u-team-4',
    description: 'Fierce competitors from the coastal district ready to make waves.'
  }
];

export const INITIAL_REGISTRATIONS: TeamRegistration[] = [
  {
    id: 'reg-1',
    teamId: 't-vipers',
    eventId: 'e-cricket-1',
    status: 'approved',
    submittedAt: '2026-05-15T10:00:00Z'
  },
  {
    id: 'reg-2',
    teamId: 't-smashers',
    eventId: 'e-badminton-1',
    status: 'approved',
    submittedAt: '2026-05-18T14:30:00Z'
  },
  {
    id: 'reg-3',
    teamId: 't-sharks',
    eventId: 'e-badminton-1',
    status: 'pending',
    submittedAt: '2026-05-28T09:12:00Z'
  }
];

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p-1',
    userId: 'u-player',
    name: 'Marcus Thorne',
    sportType: 'cricket',
    skillLevel: 'Professional',
    teamId: 't-vipers',
    position: 'Opening Batsman',
    description: 'Specializes in quick fire powerplays. Ex-national team academy under-19.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'p-2',
    userId: 'u-player-2',
    name: 'Elena Rostova',
    sportType: 'badminton',
    skillLevel: 'Professional',
    teamId: 't-smashers',
    position: 'Singles Specialist',
    description: 'Known for powerful jump smashes and pinpoint court positioning.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'p-3',
    userId: 'u-player-3',
    name: 'Amit Patel',
    sportType: 'cricket',
    skillLevel: 'Intermediate',
    teamId: null,
    position: 'All Rounder (Spin Bowler)',
    description: 'Wickets taker in middle-overs. Seeking an active cricket team.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_MATCHES: MatchSchedule[] = [
  {
    id: 'm-1',
    eventId: 'e-cricket-1',
    teamAId: 't-vipers',
    teamBId: 't-strikers',
    date: '2026-06-15',
    time: '18:00',
    venue: 'Dubai International Cricket Stadium',
    status: 'completed',
    scoreA: 172,
    scoreB: 154,
    winnerId: 't-vipers',
    notes: 'Marcus Thorne scored a brilliant 84 off 42 balls. Desert Vipers won by 18 runs.'
  },
  {
    id: 'm-2',
    eventId: 'e-badminton-1',
    teamAId: 't-smashers',
    teamBId: 't-sharks',
    date: '2026-07-02',
    time: '10:00',
    venue: 'Apex Court Center, Court 1',
    status: 'scheduled',
    notes: 'First round of the Prestige Cup singles.'
  }
];

export const INITIAL_SPONSORSHIPS: SponsorshipOffer[] = [
  {
    id: 'spon-1',
    sponsorId: 'u-sponsor',
    sponsorName: 'Quantum Energy Corp',
    targetType: 'team',
    targetId: 't-vipers',
    amount: 15000,
    terms: 'Branding placement on player jerseys, kitbags, and two court-side banners. Exclusive athletic drink supplier for the winter cup.',
    status: 'accepted',
    createdAt: '2026-05-20T11:00:00Z'
  },
  {
    id: 'spon-2',
    sponsorId: 'u-sponsor',
    sponsorName: 'Quantum Energy Corp',
    targetType: 'player',
    targetId: 'p-3',
    amount: 3500,
    terms: 'Individual equipment sponsorship. Social media promotions twice a month during tournament runs.',
    status: 'pending',
    createdAt: '2026-05-26T15:40:00Z'
  },
  {
    id: 'spon-3',
    sponsorId: 'u-sponsor',
    sponsorName: 'Quantum Energy Corp',
    targetType: 'event',
    targetId: 'e-cricket-1',
    amount: 50000,
    terms: 'Title Sponsor entitlement. Logo prominently displayed during televised broadcast overlay and main podium backdrop.',
    status: 'pending',
    createdAt: '2026-05-29T08:00:00Z'
  }
];
