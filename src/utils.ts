import { Team, MatchSchedule, TournamentStanding } from './types';

/**
 * Dynamically computes a points standing table for an event
 */
export function calculateEventStandings(
  eventId: string,
  teams: Team[],
  matches: MatchSchedule[]
): TournamentStanding[] {
  // First get all completed matches for this event
  const completedEventMatches = matches.filter(
    (m) => m.eventId === eventId && m.status === 'completed'
  );

  // Collect team stats map
  const statsMap: Record<
    string,
    {
      played: number;
      won: number;
      lost: number;
      drawn: number;
      points: number;
      form: Array<'W' | 'L' | 'D'>;
    }
  > = {};

  // Initialize stats for any team involved in scheduled or completed games for this event
  // or registered for this event. To make it consistent, we can seed for all teams.
  teams.forEach((team) => {
    statsMap[team.id] = {
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      points: 0,
      form: []
    };
  });

  // Calculate stats based on completed matches
  completedEventMatches.forEach((m) => {
    const tA = m.teamAId;
    const tB = m.teamBId;

    if (!statsMap[tA]) {
      statsMap[tA] = { played: 0, won: 0, lost: 0, drawn: 0, points: 0, form: [] };
    }
    if (!statsMap[tB]) {
      statsMap[tB] = { played: 0, won: 0, lost: 0, drawn: 0, points: 0, form: [] };
    }

    statsMap[tA].played += 1;
    statsMap[tB].played += 1;

    const sA = m.scoreA ?? 0;
    const sB = m.scoreB ?? 0;

    if (sA > sB) {
      // Team A win
      statsMap[tA].won += 1;
      statsMap[tA].points += 3;
      statsMap[tA].form.push('W');

      statsMap[tB].lost += 1;
      statsMap[tB].form.push('L');
    } else if (sB > sA) {
      // Team B win
      statsMap[tB].won += 1;
      statsMap[tB].points += 3;
      statsMap[tB].form.push('W');

      statsMap[tA].lost += 1;
      statsMap[tA].form.push('L');
    } else {
      // Draw (Only if both scores are set and are equal)
      statsMap[tA].drawn += 1;
      statsMap[tA].points += 1;
      statsMap[tA].form.push('D');

      statsMap[tB].drawn += 1;
      statsMap[tB].points += 1;
      statsMap[tB].form.push('D');
    }
  });

  // Convert map to layout-sorted array
  const standings: TournamentStanding[] = teams
    .map((team) => {
      const stats = statsMap[team.id] || { played: 0, won: 0, lost: 0, drawn: 0, points: 0, form: [] };
      return {
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logo,
        played: stats.played,
        won: stats.won,
        lost: stats.lost,
        drawn: stats.drawn,
        points: stats.points,
        // Show last 5 forms
        form: stats.form.slice(-5)
      };
    })
    // Filter out teams that have either played 0 games and aren't listed on any matches (to save uncluttered UI)
    // Or just list them all so it includes all registered squads.
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.won - a.won; // tie-breaker: most wins
    });

  return standings;
}

/**
 * Standard utility to format timestamp into human date
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format currency for sponsor listings
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}
