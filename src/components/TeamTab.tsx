import React, { useState } from 'react';
import { User, Team, Player, SponsorshipOffer, SportEvent } from '../types';
import { Plus, Users, UserCheck, ShieldCheck, FileText, Sparkles, LogOut, Search } from 'lucide-react';
import { formatCurrency } from '../utils';

interface TeamTabProps {
  currentUser: User;
  teams: Team[];
  players: Player[];
  sponsorships: SponsorshipOffer[];
  events: SportEvent[];
  onAddTeam: (newTeam: Omit<Team, 'id' | 'managerId'>) => void;
  onJoinTeam: (teamId: string) => void;
  onLeaveTeam: () => void;
  onUpdatePlayerProfile: (sportType: Player['sportType'], skillLevel: Player['skillLevel'], position: string, description: string) => void;
}

export default function TeamTab({
  currentUser,
  teams,
  players,
  sponsorships,
  events,
  onAddTeam,
  onJoinTeam,
  onLeaveTeam,
  onUpdatePlayerProfile
}: TeamTabProps) {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('🔥');
  const [teamSport, setTeamSport] = useState('cricket');
  const [teamDesc, setTeamDesc] = useState('');

  // Player profile editing (Step 5)
  const isPlayer = currentUser.role === 'player';
  const myPlayerProfile = players.find((p) => p.userId === currentUser.id);

  // States for player profiles forms
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [pSport, setPSport] = useState<'cricket' | 'badminton' | 'soccer' | 'basketball' | 'tennis'>('cricket');
  const [pSkill, setPSkill] = useState<Player['skillLevel']>('Intermediate');
  const [pPos, setPPos] = useState('');
  const [pDesc, setPDesc] = useState('');

  // Filters
  const [sportFilter, setSportFilter] = useState('all');

  const logos = ['⚡', '🏸', '⚽', '🏀', '🎾', '🔥', '🛡️', '🦁', '🚀', '🎯', '🦅', '🦈'];

  function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName || !teamDesc) {
      alert('Please fill out team details.');
      return;
    }
    onAddTeam({
      name: teamName,
      logo: teamLogo,
      sportType: teamSport,
      description: teamDesc
    });
    setTeamName('');
    setTeamDesc('');
    setShowCreateTeam(false);
  }

  function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    onUpdatePlayerProfile(pSport, pSkill, pPos, pDesc);
    setIsEditingProfile(false);
  }

  const startEditing = () => {
    if (myPlayerProfile) {
      setPSport(myPlayerProfile.sportType);
      setPSkill(myPlayerProfile.skillLevel);
      setPPos(myPlayerProfile.position);
      setPDesc(myPlayerProfile.description);
    }
    setIsEditingProfile(true);
  };

  const filteredTeams = sportFilter === 'all' ? teams : teams.filter(t => t.sportType === sportFilter);

  return (
    <div className="space-y-8">
      {/* Player Profile Spot (Step 5: Players create profile & join teams) */}
      {isPlayer && (
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-orange-500/10">
                My Athlete Identity
              </span>
              <h3 className="text-xl font-display font-extrabold text-white tracking-tight">
                {myPlayerProfile ? myPlayerProfile.name : currentUser.name}
              </h3>
              
              {myPlayerProfile ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 mt-2">
                  <span className="font-semibold bg-white/10 px-2 py-0.5 rounded">Sport: {myPlayerProfile.sportType.toUpperCase()}</span>
                  <span className="font-semibold bg-white/10 px-2 py-0.5 rounded">Level: {myPlayerProfile.skillLevel}</span>
                  <span className="font-semibold bg-white/10 px-2 py-0.5 rounded">Role/Pos: {myPlayerProfile.position}</span>
                  {myPlayerProfile.teamId ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Enrolled in Team
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold animate-pulse">Looking for a team</span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  You haven't initialized your athlete stats yet. Setup your profile below to join competitive teams.
                </p>
              )}
              {myPlayerProfile?.description && (
                <p className="text-xs text-slate-300 italic max-w-2xl mt-2">
                  "{myPlayerProfile.description}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                id="btn-edit-athlete-profile"
                onClick={() => {
                  if (isEditingProfile) {
                    setIsEditingProfile(false);
                  } else {
                    startEditing();
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/15"
              >
                {myPlayerProfile ? 'Update Athlete Stats' : 'Initialize Profile'}
              </button>
              
              {myPlayerProfile?.teamId && (
                <button
                  id="btn-leave-team"
                  onClick={onLeaveTeam}
                  className="bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1 border border-red-500/20 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Leave Team
                </button>
              )}
            </div>
          </div>

          {/* Inline Player Editing Sheet */}
          {isEditingProfile && (
            <form onSubmit={handleUpdateProfile} className="bg-slate-900 rounded-2xl p-6 mt-6 border border-slate-800 space-y-4 text-slate-200">
              <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider text-xs">Adjust Athlete Profile Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Sport Preference</label>
                  <select
                    value={pSport}
                    onChange={(e) => setPSport(e.target.value as Player['sportType'])}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="cricket">Cricket 🏏</option>
                    <option value="badminton">Badminton 🏸</option>
                    <option value="soccer">Soccer ⚽</option>
                    <option value="basketball">Basketball 🏀</option>
                    <option value="tennis">Tennis 🎾</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Rank/Skill Level</label>
                  <select
                    value={pSkill}
                    onChange={(e) => setPSkill(e.target.value as Player['skillLevel'])}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Position / Speciality</label>
                  <input
                    type="text"
                    value={pPos}
                    placeholder="e.g. Captain / Spin Bowler"
                    onChange={(e) => setPPos(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">About Me & Goals</label>
                  <textarea
                    rows={2}
                    value={pDesc}
                    placeholder="Describe your athletic accomplishments or goals..."
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-orange-500/15"
                >
                  Save Identity
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Grid and Controls */}
      <div className="space-y-6">
        {/* Search / Filters / Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Sport System:</span>
            <div className="flex gap-1">
              {['all', 'cricket', 'badminton', 'soccer', 'basketball', 'tennis'].map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sport)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                    sportFilter === sport
                      ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-550/10 font-bold'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {currentUser.role === 'team_manager' && (
            <button
              id="btn-toggle-create-team"
              onClick={() => setShowCreateTeam(!showCreateTeam)}
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10"
            >
              <Plus className="w-4 h-4" />
              {showCreateTeam ? 'Close Setup' : 'Create Squad Team'}
            </button>
          )}
        </div>

        {/* Create Team Form Expanded */}
        {showCreateTeam && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-top-3">
            <h3 className="text-base font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" /> Setup Registered Sports Franchise
            </h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Team Emblem / Logo Icon</label>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl bg-slate-50 border border-slate-200 w-12 h-12 rounded-lg flex items-center justify-center shadow-2xs">
                      {teamLogo}
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {logos.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setTeamLogo(emoji)}
                          className={`text-lg p-1 rounded-sm hover:bg-slate-100 ${
                            teamLogo === emoji ? 'bg-orange-50 border border-orange-200' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desert Vipers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Category Sport</label>
                  <select
                    value={teamSport}
                    onChange={(e) => setTeamSport(e.target.value)}
                    className="w-full text-xs bg-white rounded-lg border border-slate-200 p-2.5 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="cricket">🏏 Cricket</option>
                    <option value="badminton">🏸 Badminton</option>
                    <option value="soccer">⚽ Soccer</option>
                    <option value="basketball">🏀 Basketball</option>
                    <option value="tennis">🎾 Tennis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Description & Lore</label>
                <textarea
                  rows={2}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Share a short bio, colors, and training focus of your sports club."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-orange-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-orange-500/10"
                >
                  Deploy Team
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Squad list displays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTeams.map((team) => {
            const teamSquad = players.filter((p) => p.teamId === team.id);
            const teamSponsors = sponsorships.filter(
              (s) => s.targetType === 'team' && s.targetId === team.id && s.status === 'accepted'
            );

            // Can current player join this team?
            const canJoin =
              isPlayer &&
              myPlayerProfile &&
              !myPlayerProfile.teamId &&
              myPlayerProfile.sportType === team.sportType;

            return (
              <div key={team.id} className="bg-white border border-slate-201 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-slate-300 transition-all">
                <div className="p-6">
                  {/* Title & Emblem */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl bg-slate-50 shadow-2xs w-14 h-14 rounded-xl flex items-center justify-center border border-slate-100">
                        {team.logo}
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 tracking-tight text-base leading-tight">
                          {team.name}
                        </h4>
                        <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 capitalize bg-slate-100 rounded-sm px-1.5 py-0.5 border border-slate-200">
                          {team.sportType} Franchise
                        </span>
                      </div>
                    </div>

            {/* Join button for matching independent player */}
            {canJoin && (
              <button
                onClick={() => onJoinTeam(team.id)}
                className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" /> Join Team
              </button>
            )}
                  </div>

                  <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                    {team.description}
                  </p>

                  {/* ACTIVE TEAM SPONSORS BANNER */}
                  {teamSponsors.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                        Corporate Sponsors
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {teamSponsors.map((spon) => (
                          <span
                            key={spon.id}
                            title={spon.terms}
                            className="bg-yellow-50 text-amber-700 border border-yellow-200 font-medium text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {spon.sponsorName} ({formatCurrency(spon.amount)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PLAYER MEMBERS LIST (STEP 5) */}
                  <div className="mt-5 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Users className="w-3 h-3" /> Team Roster ({teamSquad.length})
                    </span>

                    {teamSquad.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No players joined yet. Be the first!</p>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg divide-y divide-slate-150">
                        {teamSquad.map((player) => (
                          <div key={player.id} className="p-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {player.avatar ? (
                                <img
                                  src={player.avatar}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover shadow-2xs border border-slate-200"
                                />
                              ) : (
                                <span className="bg-slate-200 w-6 h-6 rounded-full inline-block" />
                              )}
                              <div>
                                <div className="text-xs font-semibold text-slate-800">{player.name}</div>
                                <div className="text-[10px] text-slate-400">{player.position}</div>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold font-mono text-slate-500 border bg-white rounded px-1.5 py-0.5">
                              {player.skillLevel}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 mt-auto text-xs text-slate-400 flex items-center justify-between">
                  <span>Manager ID: <span className="font-mono">{team.managerId.replace('u-', '')}</span></span>
                </div>
              </div>
            );
          })}

          {filteredTeams.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No active teams match the current sport filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
