import React, { useState } from 'react';
import { User, SportEvent, Team, MatchSchedule, TeamRegistration } from '../types';
import { Calendar, Plus, Trophy, Award, CheckCircle2, AlertCircle, Trash2, MapPin, Clock, Edit } from 'lucide-react';
import { formatDate } from '../utils';

interface ScheduleTabProps {
  currentUser: User;
  events: SportEvent[];
  teams: Team[];
  matches: MatchSchedule[];
  registrations: TeamRegistration[];
  onAddMatch: (newMatch: Omit<MatchSchedule, 'id'>) => void;
  onRecordScore: (matchId: string, scoreA: number, scoreB: number, winnerId: string, notes?: string) => void;
  onDeleteMatch: (matchId: string) => void;
}

export default function ScheduleTab({
  currentUser,
  events,
  teams,
  matches,
  registrations,
  onAddMatch,
  onRecordScore,
  onDeleteMatch
}: ScheduleTabProps) {
  const isEventManager = currentUser.role === 'event_manager';

  // Filters
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  
  // Game Creation State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formEventId, setFormEventId] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [matchVenue, setMatchVenue] = useState('');

  // Scoring Entry form state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [matchNotes, setMatchNotes] = useState('');

  // Auto populate defaults when formEventId changes
  // We ONLY allow approved teams for the matching sport inside that specific event.
  const getApprovedTeamsForEvent = (evId: string) => {
    const approvedTeamIds = registrations
      .filter((r) => r.eventId === evId && r.status === 'approved')
      .map((r) => r.teamId);
    return teams.filter((t) => approvedTeamIds.includes(t.id));
  };

  const activeEventTeams = getApprovedTeamsForEvent(formEventId);

  React.useEffect(() => {
    // Pick the first event if none selected
    if (events.length > 0 && !formEventId) {
      setFormEventId(events[0].id);
    }
  }, [events, formEventId]);

  React.useEffect(() => {
    if (activeEventTeams.length >= 2) {
      setTeamAId(activeEventTeams[0].id);
      setTeamBId(activeEventTeams[1].id);
    } else {
      setTeamAId('');
      setTeamBId('');
    }
    // Pre-fill venue from event, safe template
    const selectedEventObj = events.find((e) => e.id === formEventId);
    if (selectedEventObj) {
      setMatchVenue(selectedEventObj.venue);
      setMatchDate(selectedEventObj.date);
      setMatchTime(selectedEventObj.time);
    }
  }, [formEventId]);

  function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!formEventId || !teamAId || !teamBId || !matchDate || !matchTime || !matchVenue) {
      alert('All match variables, date/time, and venue must be fully selected.');
      return;
    }
    if (teamAId === teamBId) {
      alert('A team cannot play against itself.');
      return;
    }
    onAddMatch({
      eventId: formEventId,
      teamAId,
      teamBId,
      date: matchDate,
      time: matchTime,
      venue: matchVenue,
      status: 'scheduled'
    });
    setShowAddForm(false);
  }

  function handleSaveScore(e: React.FormEvent) {
    e.preventDefault();
    if (editingMatchId === null) return;

    const matchedGame = matches.find((m) => m.id === editingMatchId);
    if (!matchedGame) return;

    let winnerId = '';
    if (scoreA > scoreB) {
      winnerId = matchedGame.teamAId;
    } else if (scoreB > scoreA) {
      winnerId = matchedGame.teamBId;
    } else {
      winnerId = 'draw';
    }

    onRecordScore(editingMatchId, scoreA, scoreB, winnerId, matchNotes);
    setEditingMatchId(null);
    setMatchNotes('');
    alert('Match scores certified successfully. Leaderboard points allocated.');
  }

  const startScoring = (match: MatchSchedule) => {
    setEditingMatchId(match.id);
    setScoreA(match.scoreA ?? 0);
    setScoreB(match.scoreB ?? 0);
    setMatchNotes(match.notes ?? '');
  };

  // Filter schedules by tournament event
  const visibleMatches = selectedEventId === 'all'
    ? matches
    : matches.filter((m) => m.eventId === selectedEventId);

  return (
    <div className="space-y-8">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">System Fixtures & Scoring</h2>
          <p className="text-sm text-slate-500 mt-1">
            Build competitive tournament brackets, coordinate venues, and record scores.
          </p>
        </div>

        {isEventManager && (
          <button
            id="btn-toggle-create-match"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel Match Setup' : 'Schedule New Match'}
          </button>
        )}
      </div>

      {/* Select Tournament Filter */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Tournament filter:</label>
        <select
          id="select-schedule-event-filter"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 bg-white"
        >
          <option value="all">⭐ All Tournaments - Complete Calendar</option>
          {events
            .filter((e) => e.status === 'published')
            .map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.sportType === 'cricket' && '🏏'}
                {ev.sportType === 'badminton' && '🏸'}
                {ev.sportType === 'soccer' && '⚽'}
                {ev.sportType === 'basketball' && '🏀'}
                {ev.name}
              </option>
            ))}
        </select>
      </div>

      {/* Create Match Schedule Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-201 rounded-2xl p-6 shadow-md animate-in fade-in">
          <h3 className="text-base font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" /> Specify Match Particulars
          </h3>
          <form onSubmit={handleCreateMatch} className="space-y-4 text-xs font-medium text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Sports Tournament Event</label>
                <select
                  value={formEventId}
                  onChange={(e) => setFormEventId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
                >
                  {events
                    .filter((e) => e.status === 'published')
                    .map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.sportType})
                      </option>
                    ))}
                </select>
              </div>

              {activeEventTeams.length < 2 ? (
                <div className="md:col-span-2 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-[11px] text-amber-800 leading-normal">
                    This tournament must have at least <strong>two approved participating teams</strong> before you can schedule matches. Approve them in the <strong>Tournaments Tab</strong>.
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">First Team (Team A)</label>
                    <select
                      value={teamAId}
                      onChange={(e) => setTeamAId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500 font-medium"
                    >
                      {activeEventTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.logo} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Second Team (Team B)</label>
                    <select
                      value={teamBId}
                      onChange={(e) => setTeamBId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500 font-medium"
                    >
                      {activeEventTeams.map((t) => (
                        <option key={t.id} value={t.id} disabled={t.id === teamAId}>
                          {t.logo} {t.name} {t.id === teamAId ? '(Chosen above)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {activeEventTeams.length >= 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Competition Venue</label>
                    <input
                      type="text"
                      required
                      value={matchVenue}
                      onChange={(e) => setMatchVenue(e.target.value)}
                      placeholder="e.g. Dubai Main Stadium"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Fixture Date</label>
                    <input
                      type="date"
                      required
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Start Time (24h)</label>
                    <input
                      type="time"
                      required
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-orange-500/10 transition-all font-mono"
                  >
                    Authorize Match Game
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* Fixtures Displays Grid */}
      <div className="space-y-4">
        {visibleMatches.map((match) => {
          const tA = teams.find((t) => t.id === match.teamAId) || { name: 'Unknown A', logo: '🛡️' };
          const tB = teams.find((t) => t.id === match.teamBId) || { name: 'Unknown B', logo: '🛡️' };
          const parentEvent = events.find((e) => e.id === match.eventId) || { name: 'General Cup' };
          const isCompleted = match.status === 'completed';

          const scoreAIsWinner = isCompleted && (match.scoreA ?? 0) > (match.scoreB ?? 0);
          const scoreBIsWinner = isCompleted && (match.scoreB ?? 0) > (match.scoreA ?? 0);
          const drawResult = isCompleted && (match.scoreA ?? 0) === (match.scoreB ?? 0);

          return (
            <div key={match.id} className="bg-white border border-slate-201 rounded-3xl overflow-hidden shadow-sm hover:border-slate-300 transition-all">
              {/* Scoring Modal/Form overlay directly inside card logic to avoid visual context shifting */}
              {editingMatchId === match.id ? (
                <form onSubmit={handleSaveScore} className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
                  <h4 className="font-display font-semibold text-sm text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Award className="w-5 h-5 text-amber-500" /> Certification Panel - Score Entry
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-white border border-slate-100 rounded-xl">
                    <div className="text-center space-y-2">
                      <span className="text-2xl">{tA.logo}</span>
                      <div className="text-xs font-bold text-slate-800">{tA.name} Score</div>
                      <input
                        type="number"
                        min={0}
                        required
                        value={scoreA}
                        onChange={(e) => setScoreA(Number(e.target.value))}
                        className="w-24 text-center font-mono font-bold text-lg border border-slate-200 rounded p-2 focus:outline-none focus:border-orange-500 bg-slate-50"
                      />
                    </div>

                    <div className="text-xl font-bold font-mono text-slate-400 select-none">VS</div>

                    <div className="text-center space-y-2">
                      <span className="text-2xl">{tB.logo}</span>
                      <div className="text-xs font-bold text-slate-800">{tB.name} Score</div>
                      <input
                        type="number"
                        min={0}
                        required
                        value={scoreB}
                        onChange={(e) => setScoreB(Number(e.target.value))}
                        className="w-24 text-center font-mono font-bold text-lg border border-slate-200 rounded p-2 focus:outline-none focus:border-orange-500 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Official Notes / Highlights</label>
                    <input
                      type="text"
                      value={matchNotes}
                      placeholder="e.g. outstanding hat-trick, final penalties, batting milestones..."
                      onChange={(e) => setMatchNotes(e.target.value)}
                      className="w-full text-xs bg-white rounded-lg border border-slate-200 p-2.5 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMatchId(null)}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs cursor-pointer"
                    >
                      Authenticate Scorecard
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6">
                  {/* Event indicator */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4 text-xs font-medium">
                    <span className="text-slate-500 font-display font-semibold">
                      {parentEvent.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-850 animate-pulse'
                    }`}>
                      {match.status}
                    </span>
                  </div>

                  {/* Main Teams Match Board */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Team A */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left w-full sm:w-2/5">
                      <span className="text-3xl bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-3xs">{tA.logo}</span>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-slate-900 text-sm leading-tight">{tA.name}</div>
                        {scoreAIsWinner && (
                          <span className="inline-block bg-yellow-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0 border border-yellow-200">
                            👑 Winner
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SCOREBOARD DISPLAY */}
                    <div className="flex flex-col items-center justify-center shrink-0 py-2 px-4 bg-slate-50 border border-slate-100 rounded-xl min-w-[124px]">
                      {isCompleted ? (
                        <div className="text-2xl font-mono font-black text-slate-800 tracking-tight flex items-center gap-2">
                          <span>{match.scoreA}</span>
                          <span className="text-slate-300 font-sans font-normal text-sm">-</span>
                          <span>{match.scoreB}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">VS</span>
                      )}

                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {isCompleted ? 'Final Board' : 'No Results'}
                      </span>
                    </div>

                    {/* Team B */}
                    <div className="flex flex-col sm:flex-row-reverse items-center gap-3 text-center sm:text-right w-full sm:w-2/5">
                      <span className="text-3xl bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-3xs">{tB.logo}</span>
                      <div className="space-y-1">
                        <div className="font-display font-bold text-slate-900 text-sm leading-tight">{tB.name}</div>
                        {scoreBIsWinner && (
                          <span className="inline-block bg-yellow-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0 border border-yellow-200">
                            👑 Winner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Highlights notes footer */}
                  {match.notes && (
                    <p className="bg-amber-50/40 border border-amber-100 p-2.5 rounded-lg text-xs leading-relaxed text-amber-800 italic mt-4 text-center">
                      "{match.notes}"
                    </p>
                  )}

                  {/* Bottom details metadata line */}
                  <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 border-t border-slate-100 pt-4 mt-5 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {match.venue}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatDate(match.date)} @ {match.time}
                      </span>
                    </div>

                    {/* Official Executive Actions */}
                    {isEventManager && (
                      <div className="flex items-center gap-1.5">
                        <button
                          title="Record score"
                          onClick={() => startScoring(match)}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Record Score
                        </button>
                        <button
                          title="Delete match"
                          onClick={() => onDeleteMatch(match.id)}
                          className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {visibleMatches.length === 0 && (
          <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No matches found matching search credentials or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
