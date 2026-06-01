import React, { useState } from 'react';
import { SportEvent, Team, MatchSchedule } from '../types';
import { calculateEventStandings } from '../utils';
import { Trophy, Medal, Star, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

interface StandingsTabProps {
  events: SportEvent[];
  teams: Team[];
  matches: MatchSchedule[];
}

export default function StandingsTab({ events, teams, matches }: StandingsTabProps) {
  // Select active tournament
  const publishedEvents = events.filter((e) => e.status === 'published');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Initial selection
  React.useEffect(() => {
    if (publishedEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(publishedEvents[0].id);
    }
  }, [publishedEvents, selectedEventId]);

  const activeEvent = publishedEvents.find((e) => e.id === selectedEventId);
  
  // Calculate standings dynamically
  const standings = activeEvent
    ? calculateEventStandings(activeEvent.id, teams, matches)
    : [];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-100" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400 fill-slate-50" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600 fill-amber-50" />;
      default:
        return <span className="font-mono text-slate-400 font-bold ml-1.5">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Ecosystem Standings & Leaderboards</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track franchise point totals, victory counts, and real-time form indicators across all sports.
          </p>
        </div>

        {publishedEvents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">Select Event:</span>
            <select
              id="select-standings-event-picker"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-orange-500"
            >
              {publishedEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.sportType === 'cricket' && '🏏 cricket - '}
                  {ev.sportType === 'badminton' && '🏸 badminton - '}
                  {ev.sportType === 'soccer' && '⚽ soccer - '}
                  {ev.sportType === 'basketball' && '🏀 basketball - '}
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {publishedEvents.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium font-display">No tournaments published yet.</p>
          <p className="text-xs text-slate-400 mt-1">An Event Manager must mark at least one tournament as "Published" to activate logs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Table display */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-201 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" /> Live Standings Board
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Updated Live (UTC)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="text-[10px] bg-slate-50 font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-center w-16">Pos</th>
                    <th scope="col" className="px-6 py-4">Participant Team</th>
                    <th scope="col" className="px-4 py-4 text-center">P</th>
                    <th scope="col" className="px-4 py-4 text-center">W</th>
                    <th scope="col" className="px-4 py-4 text-center">D</th>
                    <th scope="col" className="px-4 py-4 text-center animate-pulse">L</th>
                    <th scope="col" className="px-4 py-4 text-center font-bold text-slate-800 bg-slate-50">Pts</th>
                    <th scope="col" className="px-6 py-4 text-center w-36">Recent Grid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-105">
                  {standings.map((standing, index) => (
                    <tr key={standing.teamId} className="hover:bg-slate-50/50 transition-colors">
                      {/* POS column */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                      </td>

                      {/* TEAM ID row banner */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl bg-slate-50 border border-slate-200 w-10 h-10 rounded-lg flex items-center justify-center shadow-3xs">
                            {standing.teamLogo}
                          </span>
                          <div>
                            <div className="font-display text-sm font-bold text-slate-900">{standing.teamName}</div>
                            {index === 0 && standing.played > 0 && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-amber-700 bg-yellow-50 border border-yellow-200 font-bold rounded-sm px-1.5 py-0.5 mt-0.5 uppercase tracking-wide leading-none">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-300 shrink-0 animate-spin" /> Table Leader
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Play count */}
                      <td className="px-4 py-4 text-center font-semibold font-mono text-slate-700">
                        {standing.played}
                      </td>

                      {/* Won count */}
                      <td className="px-4 py-4 text-center font-semibold font-mono text-emerald-600">
                        {standing.won}
                      </td>

                      {/* Drawn count */}
                      <td className="px-4 py-4 text-center font-semibold font-mono text-slate-500">
                        {standing.drawn}
                      </td>

                      {/* Lost count */}
                      <td className="px-4 py-4 text-center font-semibold font-mono text-red-500">
                        {standing.lost}
                      </td>

                      {/* Points count */}
                      <td className="px-4 py-4 text-center font-extrabold font-mono text-slate-900 bg-slate-50 text-sm">
                        {standing.points}
                      </td>

                      {/* Recent status forms dots */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 inline-flex w-full">
                          {standing.form.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">No historical matches</span>
                          ) : (
                            standing.form.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className={`w-6 h-6 rounded-full font-bold font-mono text-[9px] flex items-center justify-center border shadow-3xs shrink-0 select-none ${
                                  f === 'W' ? 'bg-green-50 text-green-700 border-green-200' :
                                  f === 'L' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {f}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {standings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400 italic">
                        No teams are registered & approved in this tournament.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Info Box / Stats */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
              <h3 className="text-base font-display font-bold text-white mb-3 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-orange-400" /> Standings Guide
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed space-y-2">
                Scores and points updates are computed automatically based on matches certified by Event Managers.
              </p>
              
              <div className="mt-5 space-y-3.5 border-t border-white/10 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Match Win:</span>
                  <span className="font-mono bg-white/15 px-2 py-0.5 rounded text-yellow-300 font-bold">+3 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Match Draw:</span>
                  <span className="font-mono bg-white/15 px-2 py-0.5 rounded text-slate-300 font-bold">+1 point</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Match Loss:</span>
                  <span className="font-mono bg-white/15 px-2 py-0.5 rounded text-slate-300 font-bold">0 points</span>
                </div>
              </div>
            </div>

            {/* Micro Highlights of top performer */}
            {standings.length > 0 && standings[0].played > 0 && (
              <div className="bg-white rounded-2xl border border-slate-201 p-6 shadow-sm space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Current Champion Projected
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl bg-yellow-50 w-16 h-16 rounded-xl border border-yellow-200 flex items-center justify-center">
                    {standings[0].teamLogo}
                  </span>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 tracking-tight leading-none text-base">
                      {standings[0].teamName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5">
                      Leading with <strong className="text-slate-800">{standings[0].points} pts</strong> from {standings[0].won} tournament victories.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
