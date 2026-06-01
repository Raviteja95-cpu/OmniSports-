import React, { useState } from 'react';
import { Player, PlayerEnrollment, SportEvent, Team, TeamRegistration, User } from '../types';
import { Plus, Check, X, MapPin, Calendar, Clock, Trophy, Shield, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '../utils';

interface EventTabProps {
  currentUser: User;
  events: SportEvent[];
  teams: Team[];
  registrations: TeamRegistration[];
  playerEnrollments: PlayerEnrollment[];
  players: Player[];
  onAddEvent: (newEvent: Omit<SportEvent, 'id' | 'createdBy'>) => void;
  onRegisterTeam: (teamId: string, eventId: string) => void;
  onReviewRegistration: (registrationId: string, status: 'approved' | 'rejected') => void;
  onEnrollPlayer: (playerId: string, eventId: string) => void;
  onReviewPlayerEnrollment: (enrollmentId: string, status: 'approved' | 'rejected') => void;
}

export default function EventTab({
  currentUser,
  events,
  teams,
  registrations,
  playerEnrollments,
  players,
  onAddEvent,
  onRegisterTeam,
  onReviewRegistration,
  onEnrollPlayer,
  onReviewPlayerEnrollment
}: EventTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState<SportEvent['sportType']>('cricket');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  
  // For team registration selection
  const [selectedTeamToRegister, setSelectedTeamToRegister] = useState<Record<string, string>>({});

  const isEventManager = currentUser.role === 'event_manager';
  const isTeamManager = currentUser.role === 'team_manager';

  // Teams managed by current user
  const myTeams = teams.filter((t) => t.managerId === currentUser.id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !venue || !date || !time) {
      alert('Please fill out all fields.');
      return;
    }
    onAddEvent({
      name,
      sportType,
      venue,
      date,
      time,
      status
    });
    // Reset form
    setName('');
    setVenue('');
    setDate('');
    setTime('');
    setShowCreateForm(false);
  }

  // Get registrations for a specific event
  const getEventRegistrations = (eventId: string) => {
    return registrations.filter((r) => r.eventId === eventId);
  };

  const hasTeamRegistered = (teamId: string, eventId: string) => {
    return registrations.some((r) => r.teamId === teamId && r.eventId === eventId);
  };

  // Sport color codes helper
  const getSportBadgeColor = (sport: string) => {
    switch (sport) {
      case 'cricket':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'badminton':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'soccer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'basketball':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Active Tournaments & Events</h2>
          <p className="text-sm text-slate-500 mt-1">
            Browse published championships, register elite squads, and approve pending credentials.
          </p>
        </div>
        
        {isEventManager && (
          <button
            id="btn-toggle-create-event"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10"
          >
            <Plus className="w-4 h-4" />
            {showCreateForm ? 'Cancel Event Setup' : 'Create Sport Event'}
          </button>
        )}
      </div>

      {/* Inline Creation Form */}
      {showCreateForm && (
        <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-250">
          <h3 className="text-lg font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            Set Up New Sports Tournament
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Event Name
              </label>
              <input
                id="input-event-name"
                type="text"
                placeholder="e.g. Dubai Cricket Championship"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-orange-500 focus:outline-none placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Sport Type
              </label>
              <select
                id="select-sport-type"
                value={sportType}
                onChange={(e) => setSportType(e.target.value as SportEvent['sportType'])}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:border-orange-500 focus:outline-none"
              >
                <option value="cricket">🏏 Cricket</option>
                <option value="badminton">🏸 Badminton</option>
                <option value="soccer">⚽ Soccer</option>
                <option value="basketball">🏀 Basketball</option>
                <option value="tennis">🎾 Tennis</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Venue Location
              </label>
              <input
                id="input-event-venue"
                type="text"
                placeholder="e.g. Dubai International Cricket Stadium, Court 3"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-orange-500 focus:outline-none placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Scheduled Date
              </label>
              <input
                id="input-event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Scheduled Time
              </label>
              <input
                id="input-event-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Publication Status
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="accent-orange-500"
                  />
                  Publish Immediately (Visible to all)
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="accent-orange-500"
                  />
                  Save as Draft (Private Manager Only)
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-orange-500/10"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events
          .filter((e) => isEventManager || e.status === 'published')
          .map((event) => {
            const eventRegs = getEventRegistrations(event.id);
            const approvedRegs = eventRegs.filter((r) => r.status === 'approved');
            const pendingRegs = eventRegs.filter((r) => r.status === 'pending');

            return (
              <div key={event.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-300 transition-all shadow-sm flex flex-col">
                <div className="p-6 flex-1">
                  {/* Category and Publication status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-full uppercase tracking-wider ${getSportBadgeColor(event.sportType)}`}>
                      {event.sportType === 'cricket' && '🏏 Cricket'}
                      {event.sportType === 'badminton' && '🏸 Badminton'}
                      {event.sportType === 'soccer' && '⚽ Soccer'}
                      {event.sportType === 'basketball' && '🏀 Basketball'}
                      {event.sportType === 'tennis' && '🎾 Tennis'}
                    </span>

                    {isEventManager && (
                      <span className={`text-xs inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded ${
                        event.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {event.status === 'published' ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Draft Mode
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight">
                    {event.name}
                  </h3>

                  {/* Metadata points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{approvedRegs.length} Approved Teams</span>
                    </div>
                  </div>

                  {/* Dynamic Event Registration Actions (For Team Managers) */}
                  {isTeamManager && event.status === 'published' && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-5">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        Team Registration Portal
                      </h4>

                      {myTeams.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">
                          You do not have any teams registered under your profile. Create a team in the "Team Hub" tab.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {myTeams.map((team) => {
                            const reg = registrations.find((r) => r.teamId === team.id && r.eventId === event.id);
                            
                            if (reg) {
                              return (
                                <div key={team.id} className="flex items-center justify-between text-xs py-1">
                                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                    <span>{team.logo}</span> {team.name}
                                  </span>
                                  <span className={`font-semibold px-2 py-0.5 rounded uppercase tracking-wider text-[10px] ${
                                    reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-amber-100 text-amber-800 animate-pulse'
                                  }`}>
                                    {reg.status}
                                  </span>
                                </div>
                              );
                            }

                            // Only allow registration if team matches event sportType
                            const isCompatible = team.sportType === event.sportType;

                            return (
                              <div key={team.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs py-1 border-t border-slate-100 pt-2">
                                <div className="font-medium text-slate-700">
                                  <span className="mr-1">{team.logo}</span>
                                  {team.name} <span className="text-[10px] text-slate-400">({team.sportType})</span>
                                </div>
                                {isCompatible ? (
                                  <button
                                    onClick={() => onRegisterTeam(team.id, event.id)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[11px] px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer shadow-md shadow-orange-500/10"
                                  >
                                    Submit Registration
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-red-500 italic">
                                    Sport mismatch ({event.sportType} only)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Individual Player Enrollment Portal */}
                  {currentUser.role === 'player' && event.status === 'published' && (() => {
                    const myPlayerProfile = players.find((p) => p.userId === currentUser.id);
                    if (!myPlayerProfile) {
                      return (
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 mt-4">
                          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <HelpCircle className="w-4 h-4 text-orange-500" /> Player Enrollment
                          </h4>
                          <p className="text-[11px] text-slate-500 italic">
                            Please set up your athlete profile in the <strong>"Team & Player Hub"</strong> tab first to enroll in this tournament.
                          </p>
                        </div>
                      );
                    }

                    const myEnroll = playerEnrollments.find((pe) => pe.playerId === myPlayerProfile.id && pe.eventId === event.id);

                    return (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 mt-4">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-orange-500" /> Individual Athlete Enrollment
                        </h4>
                        {myEnroll ? (
                          <div className="flex items-center justify-between text-xs py-1">
                            <span className="font-semibold text-slate-700">
                              👤 {myPlayerProfile.name} ({myPlayerProfile.position})
                            </span>
                            <span className={`font-semibold px-2 py-0.5 rounded uppercase tracking-wider text-[10px] ${
                              myEnroll.status === 'approved' ? 'bg-green-100 text-green-800' :
                              myEnroll.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-amber-140 text-amber-800 animate-pulse'
                            }`}>
                              {myEnroll.status}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                            <div className="text-slate-600">
                              Enroll as an individual participant for <strong>{event.name}</strong>.
                            </div>
                            {myPlayerProfile.sportType === event.sportType ? (
                              <button
                                onClick={() => onEnrollPlayer(myPlayerProfile.id, event.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer shadow-md shadow-orange-500/10"
                              >
                                Enroll as Athlete
                              </button>
                            ) : (
                              <span className="text-[10px] text-red-500 italic shrink-0">
                                Sport mismatch ({event.sportType} profile required)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Event Registrations Management Panel (For Event Managers) */}
                {isEventManager && (
                  <div className="bg-slate-50 border-t border-slate-100 p-5 mt-auto space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-orange-500" />
                        Reviewed Team Registrations ({eventRegs.length})
                      </h4>

                      {eventRegs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No registrations submitted for this tournament yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                          {eventRegs.map((reg) => {
                            const registeringTeam = teams.find((t) => t.id === reg.teamId);
                            if (!registeringTeam) return null;

                            return (
                              <div key={reg.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{registeringTeam.logo}</span>
                                  <div>
                                    <div className="font-bold text-slate-800">{registeringTeam.name}</div>
                                    <div className="text-[10px] text-slate-400">Submitted {formatDate(reg.submittedAt)}</div>
                                  </div>
                                </div>

                                <div>
                                  {reg.status === 'pending' ? (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        title="Approve Team"
                                        onClick={() => onReviewRegistration(reg.id, 'approved')}
                                        className="p-1 rounded bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 transition-colors cursor-pointer"
                                      >
                                        <Check className="w-4.5 h-4.5" />
                                      </button>
                                      <button
                                        title="Reject Team"
                                        onClick={() => onReviewRegistration(reg.id, 'rejected')}
                                        className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                      >
                                        <X className="w-4.5 h-4.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className={`font-semibold px-2 py-0.5 rounded uppercase tracking-wider text-[10px] ${
                                      reg.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {reg.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-205 pt-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-sans">
                        <Trophy className="w-3.5 h-3.5 text-orange-500" />
                        Reviewed Athlete Enrollments ({playerEnrollments.filter((pe) => pe.eventId === event.id).length})
                      </h4>

                      {playerEnrollments.filter((pe) => pe.eventId === event.id).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No athlete enrollments submitted for this tournament yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                          {playerEnrollments
                            .filter((pe) => pe.eventId === event.id)
                            .map((pe) => {
                              const enrollingPlayer = players.find((p) => p.id === pe.playerId);
                              if (!enrollingPlayer) return null;

                              return (
                                <div key={pe.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-md">👤</span>
                                    <div>
                                      <div className="font-bold text-slate-800">{enrollingPlayer.name}</div>
                                      <div className="text-[10px] text-slate-400">{enrollingPlayer.position} - {enrollingPlayer.skillLevel}</div>
                                    </div>
                                  </div>

                                  <div>
                                    {pe.status === 'pending' ? (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          title="Approve Athlete"
                                          onClick={() => onReviewPlayerEnrollment(pe.id, 'approved')}
                                          className="p-1 rounded bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 transition-colors cursor-pointer"
                                        >
                                          <Check className="w-4.5 h-4.5" />
                                        </button>
                                        <button
                                          title="Reject Athlete"
                                          onClick={() => onReviewPlayerEnrollment(pe.id, 'rejected')}
                                          className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                        >
                                          <X className="w-4.5 h-4.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className={`font-semibold px-2 py-0.5 rounded uppercase tracking-wider text-[10px] ${
                                        pe.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {pe.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Viewer list (For players & sponsors to see approved status) */}
                {!isEventManager && !isTeamManager && (() => {
                  const approvedPlayersObj = playerEnrollments.filter((pe) => pe.eventId === event.id && pe.status === 'approved');

                  return (
                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 mt-auto space-y-3 pb-5">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">
                          Confirmed Participating Teams
                        </span>
                        {approvedRegs.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No squads accepted yet. Waiting for approvals.</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {approvedRegs.map((reg) => {
                              const registeringTeam = teams.find((t) => t.id === reg.teamId);
                              if (!registeringTeam) return null;
                              return (
                                <span key={reg.id} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-2xs">
                                  <span>{registeringTeam.logo}</span>
                                  <span>{registeringTeam.name}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-200/50 pt-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">
                          Confirmed Individual Athletes
                        </span>
                        {approvedPlayersObj.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No independent players enrolled yet.</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {approvedPlayersObj.map((enroll) => {
                              const enrolledPlr = players.find((p) => p.id === enroll.playerId);
                              if (!enrolledPlr) return null;
                              return (
                                <span key={enroll.id} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs">
                                  <span>👤</span>
                                  <span>{enrolledPlr.name} ({enrolledPlr.position})</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        {events.filter((e) => isEventManager || e.status === 'published').length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No tournaments are currently visible or published.</p>
          </div>
        )}
      </div>
    </div>
  );
}
