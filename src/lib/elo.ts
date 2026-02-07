/**
 * Elo rating calculation utilities for Ultimate Frisbee Manager
 * Inspired by the Elo system used in chess and Age of Empires
 */

// K-factor determines how much ratings change after each match
const K_FACTOR = 32;

// Default starting rating for new players
export const DEFAULT_ELO_RATING = 1000;

/**
 * Calculate the expected score (probability of winning) for a player/team
 * based on their rating vs opponent's rating.
 *
 * @param rating - The player/team's current rating
 * @param opponentRating - The opponent's current rating
 * @returns A probability between 0 and 1
 */
export function getExpectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - rating) / 400));
}

/**
 * Calculate the new Elo rating after a match result.
 *
 * @param currentRating - The player's current Elo rating
 * @param expectedScore - The expected score (from getExpectedScore)
 * @param actualScore - 1 for win, 0 for loss
 * @returns The new Elo rating (rounded to nearest integer)
 */
export function calculateNewRating(
  currentRating: number,
  expectedScore: number,
  actualScore: number
): number {
  return Math.round(currentRating + K_FACTOR * (actualScore - expectedScore));
}

/**
 * Calculate the average Elo rating for a team of players.
 *
 * @param ratings - Array of Elo ratings
 * @returns The average rating
 */
export function getTeamAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return DEFAULT_ELO_RATING;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}

export interface EloUpdate {
  memberId: string;
  oldRating: number;
  newRating: number;
}

/**
 * Compute Elo rating updates for all players after a match.
 *
 * For matches with more than 2 teams, each team's expected score is
 * calculated against the average rating of all other teams combined.
 * This is a simplified approach for multi-team scenarios that preserves
 * the Elo invariant (total rating change sums to approximately zero).
 *
 * @param teams - Array of teams, each team is an array of { id, elo_rating }
 * @param winningTeamIndex - The 0-based index of the winning team
 * @returns Array of EloUpdate objects
 */
export function computeEloUpdates(
  teams: Array<Array<{ id: string; elo_rating: number }>>,
  winningTeamIndex: number
): EloUpdate[] {
  if (teams.length < 2 || winningTeamIndex < 0 || winningTeamIndex >= teams.length) {
    return [];
  }

  const updates: EloUpdate[] = [];

  // Calculate the average rating for each team
  const teamAverages = teams.map((team) =>
    getTeamAverageRating(team.map((p) => p.elo_rating))
  );

  for (let teamIdx = 0; teamIdx < teams.length; teamIdx++) {
    const isWinner = teamIdx === winningTeamIndex;
    const actualScore = isWinner ? 1 : 0;

    // For each team, compute against the average of all other teams
    const otherTeamRatings = teamAverages.filter((_, i) => i !== teamIdx);
    const opponentAverage =
      otherTeamRatings.reduce((sum, r) => sum + r, 0) / otherTeamRatings.length;

    const expectedScore = getExpectedScore(teamAverages[teamIdx], opponentAverage);

    for (const player of teams[teamIdx]) {
      const newRating = calculateNewRating(player.elo_rating, expectedScore, actualScore);
      updates.push({
        memberId: player.id,
        oldRating: player.elo_rating,
        newRating,
      });
    }
  }

  return updates;
}
