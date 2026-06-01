import React, { useState, useEffect } from 'react';
import {
  User,
  SportEvent,
  Team,
  TeamRegistration,
  Player,
  MatchSchedule,
  SponsorshipOffer,
  UserRole,
  PlayerEnrollment
} from './types';
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_TEAMS,
  INITIAL_REGISTRATIONS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  INITIAL_SPONSORSHIPS
} from './data';
import EventTab from './components/EventTab';
import TeamTab from './components/TeamTab';
import SponsorTab from './components/SponsorTab';
import ScheduleTab from './components/ScheduleTab';
import StandingsTab from './components/StandingsTab';
import CloudTab from './components/CloudTab';
import {
  Trophy,
  Shield,
  Coins,
  Calendar,
  BarChart,
  Users,
  User as UserIcon,
  Sparkles,
  ArrowRightLeft,
  UserPlus,
  Compass,
  Briefcase,
  Cloud,
  FileCode,
  Activity,
  Bell,
  TrendingUp,
  X
} from 'lucide-react';

export default function App() {
  // ----------------------------------------------------
  // Persistent Storage Lifecycles
  // ----------------------------------------------------
  const [users, setUsers] = useState<User[]>(() => {
    const raw = localStorage.getItem('s_users');
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const rawUser = localStorage.getItem('s_current_user');
    if (rawUser) return JSON.parse(rawUser);
    // Default fallback to first Event Manager
    const defaultMgr = INITIAL_USERS.find((u) => u.role === 'event_manager');
    return defaultMgr || INITIAL_USERS[0];
  });

  const [events, setEvents] = useState<SportEvent[]>(() => {
    const raw = localStorage.getItem('s_events');
    return raw ? JSON.parse(raw) : INITIAL_EVENTS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const raw = localStorage.getItem('s_teams');
    return raw ? JSON.parse(raw) : INITIAL_TEAMS;
  });

  const [registrations, setRegistrations] = useState<TeamRegistration[]>(() => {
    const raw = localStorage.getItem('s_registrations');
    return raw ? JSON.parse(raw) : INITIAL_REGISTRATIONS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const raw = localStorage.getItem('s_players');
    return raw ? JSON.parse(raw) : INITIAL_PLAYERS;
  });

  const [matches, setMatches] = useState<MatchSchedule[]>(() => {
    const raw = localStorage.getItem('s_matches');
    return raw ? JSON.parse(raw) : INITIAL_MATCHES;
  });

  const [sponsorships, setSponsorships] = useState<SponsorshipOffer[]>(() => {
    const raw = localStorage.getItem('s_sponsorships');
    return raw ? JSON.parse(raw) : INITIAL_SPONSORSHIPS;
  });

  const [playerEnrollments, setPlayerEnrollments] = useState<PlayerEnrollment[]>(() => {
    const raw = localStorage.getItem('s_player_enrollments');
    return raw ? JSON.parse(raw) : [];
  });

  // Active view tab state selector
  const [activeTab, setActiveTab] = useState<'events' | 'teams' | 'sponsorships' | 'schedule' | 'standings'>('events');

  // Role Switcher Open/Close state
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // New User Registration form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('player');
  const [regCompany, setRegCompany] = useState('');
  const [showRegForm, setShowRegForm] = useState(false);

  // Sync to local storage on value changes
  useEffect(() => {
    localStorage.setItem('s_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('s_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('s_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('s_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('s_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('s_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('s_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('s_sponsorships', JSON.stringify(sponsorships));
  }, [sponsorships]);

  useEffect(() => {
    localStorage.setItem('s_player_enrollments', JSON.stringify(playerEnrollments));
  }, [playerEnrollments]);

  // Real-time Event Notifications (Kafka + SSE Feed integration)
  const [liveNotifications, setLiveNotifications] = useState<{
    id: string;
    message: string;
    timestamp: string;
    type: 'EVENT_CREATED' | 'MATCH_RESULT_RECORDED';
    createdEpoch: number;
    matchData?: {
      matchId: string;
      eventId: string;
      teamAId: string;
      teamBId: string;
      scoreA: number;
      scoreB: number;
      status: string;
    };
  }[]>([]);

  // Automatic slide-dismiss scheduler for real-time live match score notifications
  useEffect(() => {
    const cleanerInterval = setInterval(() => {
      setLiveNotifications((prev) =>
        prev.filter((notif) => Date.now() - notif.createdEpoch < 12000)
      );
    }, 1000);
    return () => clearInterval(cleanerInterval);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8080/api/events/live");

    eventSource.onopen = () => {
      console.log("OmniSports SSE Feed connection successfully established on the browser.");
    };

    eventSource.onerror = (err) => {
      console.warn("SSE stream network disruption or offline status. Retrying automatically...", err);
    };

    // Listen to unified TOURNAMENT_EVENT stream channel
    eventSource.addEventListener("TOURNAMENT_EVENT", (evt: MessageEvent) => {
      try {
        const kafkaEvent = JSON.parse(evt.data);
        console.log("Broker-Piped Event Captured in Client session:", kafkaEvent);

        // Structured match details extraction
        const matchPayload = kafkaEvent.eventType === 'MATCH_RESULT_RECORDED' && kafkaEvent.payload ? {
          matchId: kafkaEvent.payload.matchId,
          eventId: kafkaEvent.payload.eventId,
          teamAId: kafkaEvent.payload.teamA,
          teamBId: kafkaEvent.payload.teamB,
          scoreA: Number(kafkaEvent.payload.scoreA || 0),
          scoreB: Number(kafkaEvent.payload.scoreB || 0),
          status: kafkaEvent.payload.status || "ongoing",
        } : undefined;

        // Prepend fresh notification alert
        setLiveNotifications((prev) => [
          {
            id: String(Date.now() + Math.random()),
            message: kafkaEvent.description || "Live activity published on servers.",
            timestamp: new Date().toLocaleTimeString(),
            type: kafkaEvent.eventType,
            createdEpoch: Date.now(),
            matchData: matchPayload,
          },
          ...prev.slice(0, 9), // limit queue to 10 toasts maximum to prevent page cluttering
        ]);

        // Dynamically insert EVENT_CREATED item to match local reactive tree
        if (kafkaEvent.eventType === "EVENT_CREATED" && kafkaEvent.payload) {
          const payload = kafkaEvent.payload;
          setEvents((prev) => {
            if (prev.some((e) => e.id === payload.id)) return prev;
            const newEvent: SportEvent = {
              id: payload.id,
              name: payload.name,
              sportType: (['cricket', 'badminton', 'soccer', 'basketball', 'tennis'].includes(payload.sportType?.toLowerCase()) 
                ? payload.sportType.toLowerCase() 
                : 'cricket') as any,
              venue: payload.location || "Indoor Complex",
              date: new Date().toISOString().split('T')[0],
              time: "10:00 AM",
              status: "published",
              createdBy: "u-1"
            };
            return [...prev, newEvent];
          });
        }

        // Dynamically update MATCH_RESULT_RECORDED score real-time
        if (kafkaEvent.eventType === "MATCH_RESULT_RECORDED" && kafkaEvent.payload) {
          const payload = kafkaEvent.payload;
          setMatches((prev) => {
            return prev.map((match) => {
              if (match.id === payload.matchId) {
                return {
                  ...match,
                  scoreA: payload.scoreA,
                  scoreB: payload.scoreB,
                  status: (payload.status.toLowerCase() === "completed" ? "completed" : "ongoing") as any,
                };
              }
              return match;
            });
          });
        }
      } catch (err) {
        console.error("Failed deserializing real-time Kafka-SSE broadcast packet", err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  // Switch Active Session
  const handleSwitchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setShowRoleSwitcher(false);
    }
  };

  // Create customized Profile
  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      alert('Required signup details must be supplied.');
      return;
    }

    const newId = `u-${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: regName,
      email: regEmail,
      role: regRole,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?w=150&auto=format&fit=crop&q=80`,
      companyName: regRole === 'sponsor' ? (regCompany || 'Independent Sponsor') : undefined,
      bio: `Freshly enrolled ${regRole} on the Tournament Management system.`
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    // If a player registers, we also make sure an unassociated Player profile item lands in our player roster
    if (regRole === 'player') {
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        userId: newId,
        name: regName,
        sportType: 'cricket',
        skillLevel: 'Intermediate',
        teamId: null,
        position: 'TBC',
        description: 'Enthusiastic new athlete looking for scouts & teams!',
        avatar: newUser.avatar
      };
      setPlayers((prev) => [...prev, newPlayer]);
    }

    // Reset Form
    setRegName('');
    setRegEmail('');
    setRegCompany('');
    setShowRegForm(false);
    setShowRoleSwitcher(false);
  };

  // Event creation
  const handleAddEvent = (newEvent: Omit<SportEvent, 'id' | 'createdBy'>) => {
    const eventObj: SportEvent = {
      ...newEvent,
      id: `e-${Date.now()}`,
      createdBy: currentUser.id
    };
    setEvents((prev) => [eventObj, ...prev]);
  };

  // Team Registration trigger for dynamic sport
  const handleRegisterTeam = (teamId: string, eventId: string) => {
    const registrationObj: TeamRegistration = {
      id: `reg-${Date.now()}`,
      teamId,
      eventId,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setRegistrations((prev) => [...prev, registrationObj]);
  };

  // Event Manager reviews team entries
  const handleReviewRegistration = (registrationId: string, status: 'approved' | 'rejected') => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === registrationId ? { ...r, status } : r))
    );
  };

  // Player enrolls in sports event directly (e.g. cricket, badminton singles)
  const handleEnrollPlayer = (playerId: string, eventId: string) => {
    const exists = playerEnrollments.some((pe) => pe.playerId === playerId && pe.eventId === eventId);
    if (exists) {
      alert('You have already applied or enrolled in this tournament!');
      return;
    }
    const enrollObj: PlayerEnrollment = {
      id: `penr-${Date.now()}`,
      playerId,
      eventId,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setPlayerEnrollments((prev) => [...prev, enrollObj]);
    alert('Tournament enrollment request submitted successfully!');
  };

  // Event Manager reviews player enrollment
  const handleReviewPlayerEnrollment = (enrollmentId: string, status: 'approved' | 'rejected') => {
    setPlayerEnrollments((prev) =>
      prev.map((pe) => (pe.id === enrollmentId ? { ...pe, status } : pe))
    );
  };

  // Team Creation
  const handleAddTeam = (newTeam: Omit<Team, 'id' | 'managerId'>) => {
    const teamObj: Team = {
      ...newTeam,
      id: `t-${Date.now()}`,
      managerId: currentUser.id
    };
    setTeams((prev) => [...prev, teamObj]);
  };

  // Player Joins Team
  const handleJoinTeam = (teamId: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.userId === currentUser.id ? { ...p, teamId } : p))
    );
  };

  // Player Leaves Team
  const handleLeaveTeam = () => {
    setPlayers((prev) =>
      prev.map((p) => (p.userId === currentUser.id ? { ...p, teamId: null } : p))
    );
  };

  // Athlete Adjust Profile Details on the database
  const handleUpdatePlayerProfile = (
    sportType: Player['sportType'],
    skillLevel: Player['skillLevel'],
    position: string,
    description: string
  ) => {
    // Check if player profile exists
    const exists = players.some((p) => p.userId === currentUser.id);

    if (exists) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.userId === currentUser.id
            ? { ...p, sportType, skillLevel, position, description }
            : p
        )
      );
    } else {
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        userId: currentUser.id,
        name: currentUser.name,
        sportType,
        skillLevel,
        teamId: null,
        position,
        description,
        avatar: currentUser.avatar
      };
      setPlayers((prev) => [...prev, newPlayer]);
    }
  };

  // Sponsor launches custom campaign offer
  const handleSubmitSponsorship = (
    offer: Omit<SponsorshipOffer, 'id' | 'sponsorId' | 'sponsorName' | 'status' | 'createdAt'>
  ) => {
    const offerObj: SponsorshipOffer = {
      ...offer,
      id: `spon-${Date.now()}`,
      sponsorId: currentUser.id,
      sponsorName: currentUser.companyName || currentUser.name,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setSponsorships((prev) => [offerObj, ...prev]);
  };

  // Recipient signs off or declines sponsorship
  const handleReviewSponsorship = (offerId: string, status: 'accepted' | 'rejected') => {
    setSponsorships((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status } : o))
    );
  };

  // General add competition match schedule
  const handleAddMatch = (newMatch: Omit<MatchSchedule, 'id'>) => {
    const matchObj: MatchSchedule = {
      ...newMatch,
      id: `m-${Date.now()}`
    };
    setMatches((prev) => [matchObj, ...prev]);
  };

  // Event Manager commits match result scorecard
  const handleRecordScore = (
    matchId: string,
    scoreA: number,
    scoreB: number,
    winnerId: string,
    notes?: string
  ) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              scoreA,
              scoreB,
              winnerId,
              notes,
              status: 'completed'
            }
          : m
      )
    );
  };

  // Action to purge scheduled match entries
  const handleDeleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  // Role Instruction Helper values
  const getRoleInstructions = (role: UserRole) => {
    switch (role) {
      case 'event_manager':
        return 'You have direct capability to publish upcoming sports tournaments (Dubai Cricket etc.), approve or deny pending team applications, plan match fixtures, and enter dynamic scorecards. Score entries automatically adjust points standings.';
      case 'team_manager':
        return 'You manage regional sports franchises! Register your athletic squads into published events (ensuring match sport types match), manage your player rosters, and review and accept high-value sponsorship offers proposed by brands.';
      case 'player':
        return 'Configure your personal sports profile, position focus, and experience tier. Browse active teams and enroll as an official team member. You can receive, reject, and activate personal endorsement sponsorships.';
      case 'sponsor':
        return 'Browse through active sports events, teams, or players in our directories. Pitch direct marketing offers by stating customized placement terms and financial support amounts.';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* ----------------------------------------------------
          Sidebar Navigation
         ---------------------------------------------------- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white italic text-base select-none shrink-0">
            A
          </div>
          <span className="text-xl font-bold tracking-tight uppercase text-white">
            Arena<span className="text-orange-500">Pro</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2 font-mono">
              Main Menu
            </p>
            <ul className="space-y-1">
              <li
                id="tab-btn-events"
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                  activeTab === 'events'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Trophy className="w-5 h-5 shrink-0" />
                <span>Tournaments & Approvals</span>
              </li>

              <li
                id="tab-btn-teams"
                onClick={() => setActiveTab('teams')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                  activeTab === 'teams'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span>Team & Player Hub</span>
              </li>

              <li
                id="tab-btn-sponsorships"
                onClick={() => setActiveTab('sponsorships')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                  activeTab === 'sponsorships'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Briefcase className="w-5 h-5 shrink-0" />
                <span>Sponsorship Arena</span>
              </li>

              <li
                id="tab-btn-schedule"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                  activeTab === 'schedule'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="w-5 h-5 shrink-0" />
                <span>Calendar & Scoring</span>
              </li>

              <li
                id="tab-btn-standings"
                onClick={() => setActiveTab('standings')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                  activeTab === 'standings'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BarChart className="w-5 h-5 shrink-0" />
                <span>Dynamic Standings</span>
              </li>


            </ul>
          </div>
        </nav>

        {/* User profile section at the bottom of sidebar */}
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border border-slate-600 shadow-sm shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white uppercase shrink-0">
                  {currentUser.name.substring(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              id="btn-role-switcher-toggle"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer shrink-0 ml-1"
              title="Switch role or register"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ----------------------------------------------------
          Main Content Area
         ---------------------------------------------------- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold font-display text-slate-800 tracking-tight">
              {activeTab === 'events' && 'Event Console'}
              {activeTab === 'teams' && 'Squad & Roster Hub'}
              {activeTab === 'sponsorships' && 'Commercial Sponsorship Arena'}
              {activeTab === 'schedule' && 'Calendar & Scoring Desk'}
              {activeTab === 'standings' && 'Ecosystem Standings'}

            </h1>
            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider block">
              System Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest bg-slate-100 px-2 py-1 rounded hidden sm:inline">
              ROLE: {currentUser.role.replace('_', ' ')}
            </span>
            <button
              onClick={() => setShowRoleSwitcher(true)}
              className="px-4 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-slate-950/10 border border-slate-800"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Switch Identity</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-slate-50">
          {/* Active Tournament Banner / Info Box */}
          <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm border border-slate-800">
            <div className="relative z-10 max-w-2xl">
              <p className="text-orange-400 font-bold uppercase tracking-widest text-[10px] mb-1.5 font-mono">
                Active Capabilities System
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">
                {currentUser.name}
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                {getRoleInstructions(currentUser.role)}
              </p>
            </div>
            <div className="relative h-24 w-24 border-8 border-orange-500/10 rounded-full flex items-center justify-center shrink-0 hidden md:flex select-none">
              <span className="text-3xl font-black text-white/5 italic">AP</span>
            </div>
          </div>

          {/* Active Tab Component Display */}
          <div className="min-h-0">
            {activeTab === 'events' && (
              <EventTab
                currentUser={currentUser}
                events={events}
                teams={teams}
                registrations={registrations}
                playerEnrollments={playerEnrollments}
                players={players}
                onAddEvent={handleAddEvent}
                onRegisterTeam={handleRegisterTeam}
                onReviewRegistration={handleReviewRegistration}
                onEnrollPlayer={handleEnrollPlayer}
                onReviewPlayerEnrollment={handleReviewPlayerEnrollment}
              />
            )}

            {activeTab === 'teams' && (
              <TeamTab
                currentUser={currentUser}
                teams={teams}
                players={players}
                sponsorships={sponsorships}
                events={events}
                onAddTeam={handleAddTeam}
                onJoinTeam={handleJoinTeam}
                onLeaveTeam={handleLeaveTeam}
                onUpdatePlayerProfile={handleUpdatePlayerProfile}
              />
            )}

            {activeTab === 'sponsorships' && (
              <SponsorTab
                currentUser={currentUser}
                sponsorships={sponsorships}
                teams={teams}
                players={players}
                events={events}
                onSubmitSponsorship={handleSubmitSponsorship}
                onReviewSponsorship={handleReviewSponsorship}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab
                currentUser={currentUser}
                events={events}
                teams={teams}
                matches={matches}
                registrations={registrations}
                onAddMatch={handleAddMatch}
                onRecordScore={handleRecordScore}
                onDeleteMatch={handleDeleteMatch}
              />
            )}

            {activeTab === 'standings' && (
              <StandingsTab
                events={events}
                teams={teams}
                matches={matches}
              />
            )}


          </div>
        </div>

        {/* System Footer of Sleek Interface */}
        <footer className="h-10 shrink-0 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-8 text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Cloud SQL & Kafka Active</span>
            </div>
            <div className="hidden md:inline text-slate-400">| Java-Spring REST Engine Live</div>
          </div>
          <div className="truncate pl-3">ArenaPro Cloud Pipeline v1.5.0</div>
        </footer>
      </main>

      {/* ----------------------------------------------------
          Interactive Profile Switcher Modal
         ---------------------------------------------------- */}
      {showRoleSwitcher && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full text-slate-300 shadow-2xl p-6 md:p-8 relative flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRoleSwitcher(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer text-sm font-bold"
              title="Close panel"
            >
              ✕
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Compass className="w-5 h-5 text-orange-500" />
                Select Preset Corporate/Athletic Identity
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose one of the specialized roles to experience the state synchronization and dynamic action logs.
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Presets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u.id)}
                      className={`text-left p-4 rounded-xl border transition-all text-xs flex items-center gap-4 w-full cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-650 flex items-center justify-center text-white font-bold shrink-0">
                          {u.name.substring(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">{u.name}</div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">
                          {u.role.replace('_', ' ')}
                        </div>
                        {u.companyName && (
                          <div className="text-[10px] text-orange-400 font-semibold mt-0.5 truncate bg-orange-950/20 px-1.5 py-0.5 rounded border border-orange-500/10 w-max">
                            {u.companyName}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Identity Form setup */}
              <div className="border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-orange-500" /> Sign Up New Custom Profile
                  </h4>
                  <button
                    onClick={() => setShowRegForm(!showRegForm)}
                    type="button"
                    className="text-xs text-orange-400 font-semibold hover:underline cursor-pointer"
                  >
                    {showRegForm ? 'Hide form' : 'Fill out application →'}
                  </button>
                </div>

                {showRegForm ? (
                  <form onSubmit={handleRegisterUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Athletic / Corporate Name
                        </label>
                        <input
                          id="input-reg-name"
                          type="text"
                          required
                          placeholder="Your official designation"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Contact Email
                        </label>
                        <input
                          id="input-reg-email"
                          type="email"
                          required
                          placeholder="name@agency.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-slate-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Platform Role
                        </label>
                        <select
                          id="select-reg-role"
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value as UserRole)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-orange-500 bg-slate-900"
                        >
                          <option value="player">Player / Athlete Profile</option>
                          <option value="team_manager">Team Manager</option>
                          <option value="event_manager">Event Manager</option>
                          <option value="sponsor">Corporate Sponsor</option>
                        </select>
                      </div>

                      {regRole === 'sponsor' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Brand/Association Title
                          </label>
                          <input
                            id="input-reg-company"
                            type="text"
                            placeholder="e.g. RedBull Ltd, Fly Emirates"
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-slate-600"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-lg transition-colors cursor-pointer shadow-md tracking-wider uppercase font-mono"
                    >
                      Authenticate and Boot Account
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-xl">
                    By submitting new profiles with customizable options, you can populate user registries and test player application flows, roster inclusions, or custom corporate sponsorship offers.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Real-time SSE / Kafka Event Toaster Notifications Panel with Scoreboards */}
      {liveNotifications.length > 0 && (
        <div id="real-time-toaster" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-[380px] sm:w-[420px]">
          {/* Custom micro-animations styles inside the page to prevent bundle mismatches */}
          <style>{`
            @keyframes shrink-width {
              0% { width: 100%; }
              100% { width: 0%; }
            }
            .animate-shrink-width {
              animation: shrink-width 12000ms linear forwards;
            }
          `}</style>
          
          {liveNotifications.map((notif) => {
            const isScoreUpdate = notif.type === 'MATCH_RESULT_RECORDED';
            const matchData = notif.matchData;
            
            // Resolve Teams details dynamically from our state to present rich visuals
            const teamA = teams.find(t => t.id === matchData?.teamAId);
            const teamB = teams.find(t => t.id === matchData?.teamBId);
            
            const teamAName = teamA ? teamA.name : (matchData?.teamAId || 'Team A');
            const teamBName = teamB ? teamB.name : (matchData?.teamBId || 'Team B');
            const teamALogo = teamA ? teamA.logo : '🛡️';
            const teamBLogo = teamB ? teamB.logo : '🛡️';

            return (
              <div
                key={notif.id}
                className="group relative bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-orange-500/50 overflow-hidden flex flex-col"
              >
                {/* Visual Accent Heading Line */}
                <div className={`h-1.5 w-full ${isScoreUpdate ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`} />
                
                <div className="p-4 flex gap-3 items-start">
                  {/* Glowing Icon indicator */}
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isScoreUpdate ? 'bg-orange-500/10 text-orange-400' : 'bg-teal-500/10 text-teal-400'}`}>
                    {isScoreUpdate ? <Activity className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  
                  {/* Detailed Body area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-[10px] font-bold tracking-widest font-mono uppercase px-2 py-0.5 rounded-full ${
                        isScoreUpdate 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}>
                        {isScoreUpdate ? 'Live Score Updated' : 'New Tournament'}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>

                    {/* Scoreboard block vs Regular text layout */}
                    {isScoreUpdate && matchData ? (
                      <div className="mt-2.5">
                        {/* High fidelity scoreboard layout */}
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-sm shrink-0 select-none">{teamALogo}</span>
                              <span className="text-xs font-bold text-slate-200 truncate pr-1 font-sans">
                                {teamAName}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-black text-amber-400 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 shrink-0 min-w-[28px] text-center">
                              {matchData.scoreA}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-sm shrink-0 select-none">{teamBLogo}</span>
                              <span className="text-xs font-bold text-slate-200 truncate pr-1 font-sans">
                                {teamBName}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-black text-amber-400 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 shrink-0 min-w-[28px] text-center">
                              {matchData.scoreB}
                            </span>
                          </div>
                        </div>

                        {/* Event message notes */}
                        <p className="mt-2 text-[11px] text-slate-400 font-medium font-sans leading-relaxed">
                          {notif.message}
                        </p>
                        
                        {/* Stream and active navigation control actions */}
                        <div className="mt-3.5 pt-2 border-t border-slate-800/50 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 uppercase tracking-wider font-mono">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            {matchData.status?.toLowerCase() === 'completed' ? 'Final Result' : 'Live Tracking'}
                          </span>
                          
                          <button
                            onClick={() => {
                              setActiveTab('schedule');
                              // Close thisSpecific notification instance
                              setLiveNotifications(prev => prev.filter(n => n.id !== notif.id));
                            }}
                            className="text-[10px] font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1 bg-slate-800/60 hover:bg-slate-700 hover:border-slate-600 border border-transparent px-2.5 py-1 rounded"
                          >
                            Go to Schedule Tab &rarr;
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium mt-1">
                        {notif.message}
                      </p>
                    )}
                  </div>

                  {/* Manual Close cross button */}
                  <button
                    onClick={() => setLiveNotifications(prev => prev.filter(n => n.id !== notif.id))}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1 shrink-0 rounded-lg hover:bg-white/5 active:scale-95 transition-transform"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Simulated visual timeline progress countdown bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-800/40 w-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500/30 to-rose-500/30 animate-shrink-width" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
