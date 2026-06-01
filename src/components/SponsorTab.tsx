import React, { useState } from 'react';
import { User, Team, Player, SportEvent, SponsorshipOffer } from '../types';
import { Sparkles, Send, DollarSign, CheckCircle2, XCircle, Clock, ShieldAlert, Award, UserCheck, Trophy } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

interface SponsorTabProps {
  currentUser: User;
  sponsorships: SponsorshipOffer[];
  teams: Team[];
  players: Player[];
  events: SportEvent[];
  onSubmitSponsorship: (offer: Omit<SponsorshipOffer, 'id' | 'sponsorId' | 'sponsorName' | 'status' | 'createdAt'>) => void;
  onReviewSponsorship: (offerId: string, status: 'accepted' | 'rejected') => void;
}

export default function SponsorTab({
  currentUser,
  sponsorships,
  teams,
  players,
  events,
  onSubmitSponsorship,
  onReviewSponsorship
}: SponsorTabProps) {
  const isSponsor = currentUser.role === 'sponsor';
  const isTeamManager = currentUser.role === 'team_manager';
  const isPlayer = currentUser.role === 'player';
  const isEventManager = currentUser.role === 'event_manager';

  // State for posting new offer
  const [targetType, setTargetType] = useState<'team' | 'player' | 'event'>('team');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [terms, setTerms] = useState('');

  // Auto select default target whenever targetType changes
  React.useEffect(() => {
    if (targetType === 'team' && teams.length > 0) {
      setTargetId(teams[0].id);
    } else if (targetType === 'player' && players.length > 0) {
      setTargetId(players[0].id);
    } else if (targetType === 'event' && events.length > 0) {
      setTargetId(events[0].id);
    } else {
      setTargetId('');
    }
  }, [targetType, teams, players, events]);

  function handlePostSponsorship(e: React.FormEvent) {
    e.preventDefault();
    if (!targetId || !terms || amount <= 0) {
      alert('Must select a target, terms description, and enter an amount larger than 0.');
      return;
    }
    onSubmitSponsorship({
      targetType,
      targetId,
      amount,
      terms
    });
    setTerms('');
    alert('Sponsorship offer distributed successfully!');
  }

  // Get name of what the sponsorship is targeting
  const getTargetName = (type: string, id: string) => {
    if (type === 'team') {
      const t = teams.find((x) => x.id === id);
      return t ? `${t.logo} ${t.name} (Team)` : 'Unknown Team';
    } else if (type === 'player') {
      const p = players.find((x) => x.id === id);
      return p ? `👤 ${p.name} (Player - ${p.sportType})` : 'Unknown Player';
    } else {
      const ev = events.find((x) => x.id === id);
      return ev ? `🏆 ${ev.name} (Event)` : 'Unknown Event';
    }
  };

  // Determine what sponsorships belong to the current user (if they are NOT a sponsor)
  const getMyInboxSponsorships = () => {
    if (isSponsor) return [];

    return sponsorships.filter((offer) => {
      if (isEventManager) {
        // Event sponsorships managed by anyone
        return offer.targetType === 'event';
      }
      if (isTeamManager) {
        // Find if this team is managed by the logged team manager
        if (offer.targetType !== 'team') return false;
        const linkedTeam = teams.find((t) => t.id === offer.targetId);
        return linkedTeam?.managerId === currentUser.id;
      }
      if (isPlayer) {
        // Find if this player is the logged in player
        if (offer.targetType !== 'player') return false;
        const linkedPlayer = players.find((p) => p.id === offer.targetId);
        return linkedPlayer?.userId === currentUser.id;
      }
      return false;
    });
  };

  const inboxOffers = getMyInboxSponsorships();
  
  // Total sponsor budget deployed helper
  const totalApprovedSponsorBudget = sponsorships
    .filter((s) => s.status === 'accepted')
    .reduce((sum, s) => sum + s.amount, 0);

  // Secured sponsor budget per team (accepted status only)
  const teamBudgets = teams.map((team) => {
    const totalSecured = sponsorships
      .filter((s) => s.targetType === 'team' && s.targetId === team.id && s.status === 'accepted')
      .reduce((sum, s) => sum + s.amount, 0);
    return { ...team, totalSecured };
  });

  return (
    <div className="space-y-8">
      {/* Overview Block */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Corporate Sponsorship Arena</h2>
            <p className="text-sm text-slate-500">
              Fueling athletic ambition and championship organization through secure marketing budgets.
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl shrink-0 flex items-center gap-3">
            <div className="bg-orange-150 bg-orange-100 p-2.5 rounded-xl text-orange-600">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-orange-850 text-orange-700 uppercase tracking-widest leading-none">Deployed Ecosystem Support</div>
              <div className="text-2xl font-mono font-bold text-orange-950 mt-1">{formatCurrency(totalApprovedSponsorBudget)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEADING SIDEBAR: SPONSOR PROPOSALS & TEAM BUDGET LISTING */}
        <div className="lg:col-span-1 space-y-6 self-start">
          {/* LEADING: SPONSOR GENERATOR / OFFERS POSTING (Sponsors only) */}
          {isSponsor && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                  Issue Sponsorship Deal
                </h3>
                <p className="text-xs text-slate-500">Formulate high-impact terms to target players, teams, or full tournaments.</p>
              </div>

              <form onSubmit={handlePostSponsorship} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Select Target Category</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setTargetType('team')}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        targetType === 'team' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Teams
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('player')}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        targetType === 'player' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Players
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('event')}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        targetType === 'event' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Events
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Recipient Entities</label>
                  <select
                    required
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2.5 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="" disabled>-- Choose a Recipient --</option>
                    {targetType === 'team' &&
                      teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.logo} {t.name} ({t.sportType})
                        </option>
                      ))}
                    {targetType === 'player' &&
                      players.map((p) => (
                        <option key={p.id} value={p.id}>
                          👤 {p.name} ({p.sportType} - {p.skillLevel})
                        </option>
                      ))}
                    {targetType === 'event' &&
                      events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          🏆 {ev.name} ({ev.sportType})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Financial Investment Amount</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 font-mono text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min={500}
                      step={100}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-7 rounded-lg border border-slate-200 p-2.5 text-xs font-semibold font-mono focus:border-orange-500 focus:outline-none bg-white"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Value must be at least $500.</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Marketing Terms & Placement</label>
                  <textarea
                    rows={4}
                    required
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="e.g. Logo displays, promotional announcements, product supply rights."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Disburse Sponsorship Offer
                </button>
              </form>
            </div>
          )}

          {/* NON-SPONSOR: INCOMING INBOX (Players, Teams, and Event managers review received items) */}
          {!isSponsor && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Sponsorship Inbox
                </h3>
                <p className="text-xs text-slate-500">Offers sent by brand sponsors to your direct athletic entities.</p>
              </div>

              {inboxOffers.filter((o) => o.status === 'pending').length === 0 ? (
                <div className="py-8 text-center bg-slate-50 border border-slate-100 rounded-lg">
                  <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 italic font-medium">No pending proposals in your inbox.</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed px-4">
                    Sponsors can identify your teams and player rosters to pitch customized marketing deals.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inboxOffers
                    .filter((o) => o.status === 'pending')
                    .map((offer) => (
                      <div key={offer.id} className="border border-amber-200 bg-amber-50/40 p-4 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-amber-800 uppercase bg-amber-100/60 px-2 py-0.5 rounded leading-none block w-max">
                              {offer.sponsorName}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 mt-1 block">
                              Targeting: {getTargetName(offer.targetType, offer.targetId).replace(/ \((Team|Player|Event)\)/, '')}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {formatCurrency(offer.amount)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg leading-relaxed">
                          {offer.terms}
                        </p>

                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => onReviewSponsorship(offer.id, 'rejected')}
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-[10px] px-3 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            Decline Offer
                          </button>
                          <button
                            onClick={() => onReviewSponsorship(offer.id, 'accepted')}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded shadow-2xs transition-colors cursor-pointer"
                          >
                            Accept Offer
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* SECURED SQUAD FRANCHISE BUDGETS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-orange-500 animate-pulse" />
                Team Sponsor Budgets
              </h3>
              <p className="text-xs text-slate-500">Live accumulated sponsorship backing secured by franchises.</p>
            </div>

            <div className="space-y-2.5">
              {teamBudgets.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-150 transition-all hover:bg-slate-100/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{t.logo}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{t.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize font-medium">{t.sportType}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded">
                      {formatCurrency(t.totalSecured)}
                    </div>
                  </div>
                </div>
              ))}

              {teams.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No registered teams found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE: SPONSORSHIP HISTORY & ACTIVE LEDGER (All Roles see it) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h3 className="text-base font-display font-bold text-slate-900">
              Ecosystem Deals Ledger
            </h3>
            <p className="text-xs text-slate-500">Complete transparency log of all corporate backing, campaigns, and pending offers.</p>
          </div>

          <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
            {sponsorships.map((offer) => {
              const isPending = offer.status === 'pending';
              const isAccepted = offer.status === 'accepted';
              const isRejected = offer.status === 'rejected';

              return (
                <div key={offer.id} className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row gap-4 justify-between items-start ${
                  isAccepted ? 'bg-emerald-50/20 border-emerald-100' :
                  isRejected ? 'bg-slate-50/40 border-slate-200 opacity-60' :
                  'bg-white border-slate-200 shadow-2xs'
                }`}>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{offer.sponsorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">| {formatDate(offer.createdAt)}</span>
                      
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-auto sm:ml-0 ${
                        isAccepted ? 'bg-emerald-100 text-emerald-800' :
                        isRejected ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {isPending && <Clock className="w-3 h-3" />}
                        {isAccepted && <CheckCircle2 className="w-3 h-3" />}
                        {isRejected && <XCircle className="w-3 h-3" />}
                        {offer.status}
                      </span>
                    </div>

                    <div className="font-medium text-slate-700">
                      Underwriting: <span className="font-bold text-slate-900">{getTargetName(offer.targetType, offer.targetId)}</span>
                    </div>

                    <p className="text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-lg leading-relaxed">
                      {offer.terms}
                    </p>
                  </div>

                  <div className="shrink-0 text-right self-stretch sm:self-start flex flex-row sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Underwritten Value</div>
                    <div className="text-lg font-mono font-extrabold text-slate-900 tracking-tight mt-1">
                      {formatCurrency(offer.amount)}
                    </div>
                  </div>
                </div>
              );
            })}

            {sponsorships.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 italic">No partnerships recorded in storage yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
