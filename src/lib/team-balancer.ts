/**
 * Team balancing utilities for Ultimate Frisbee Manager
 * Implements random team generation with configurable balance tolerance
 * Supports both manual skill-based and Elo-based balancing
 */

export type BalanceMode = 'strict' | 'flexible' | 'random';
export type RankingMode = 'manual' | 'elo';

export interface Player {
  id: string;
  full_name: string;
  gender: string;
  speed: number;
  throwing: number;
  elo_rating?: number;
  [key: string]: any;
}

// Constants
const DEFAULT_SKILL_LEVEL = 5;
const DEFAULT_ELO = 1000;
const TOLERANCE_STRICT = 0.05;
const TOLERANCE_FLEXIBLE = 0.15;
const TOLERANCE_RANDOM = 1.0;

/**
 * Calculate power score for a player (speed + throwing) - Manual mode
 */
export function getPowerScore(player: Player): number {
  return (player.speed || DEFAULT_SKILL_LEVEL) + (player.throwing || DEFAULT_SKILL_LEVEL);
}

/**
 * Calculate power score based on ranking mode
 */
export function getPlayerScore(player: Player, rankingMode: RankingMode): number {
  if (rankingMode === 'elo') {
    return player.elo_rating ?? DEFAULT_ELO;
  }
  return getPowerScore(player);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate total power score for a team
 */
function getTeamPower(team: Player[], rankingMode: RankingMode = 'manual'): number {
  return team.reduce((sum, player) => sum + getPlayerScore(player, rankingMode), 0);
}

/**
 * Check if teams are balanced within the given tolerance
 */
function areTeamsBalanced(teams: Player[][], tolerance: number, rankingMode: RankingMode = 'manual'): boolean {
  const teamPowers = teams.map(t => getTeamPower(t, rankingMode));
  const avgPower = teamPowers.reduce((a, b) => a + b, 0) / teams.length;
  
  // Check if all teams are within tolerance of average
  return teamPowers.every(power => {
    const diff = Math.abs(power - avgPower);
    return diff <= avgPower * tolerance;
  });
}

/**
 * Get tolerance value for a balance mode
 */
function getTolerance(balanceMode: BalanceMode): number {
  switch (balanceMode) {
    case 'strict':
      return TOLERANCE_STRICT;
    case 'flexible':
      return TOLERANCE_FLEXIBLE;
    case 'random':
      return TOLERANCE_RANDOM;
  }
}

/**
 * Filter players by gender (men vs women/other)
 */
function filterPlayersByGender(players: Player[]): { men: Player[], women: Player[] } {
  return {
    men: players.filter(p => p.gender === 'M'),
    women: players.filter(p => p.gender !== 'M'), // F and X together
  };
}

/**
 * Distribute players into teams randomly with balance checking
 */
export function generateBalancedTeams(
  players: Player[],
  numTeams: number,
  balanceMode: BalanceMode,
  maxAttempts: number = 100,
  rankingMode: RankingMode = 'manual'
): Player[][] {
  if (players.length < numTeams) {
    return [];
  }

  // Random mode: just shuffle and split, no balance checking
  if (balanceMode === 'random') {
    const shuffled = shuffleArray(players);
    const teams: Player[][] = Array.from({ length: numTeams }, () => []);
    
    shuffled.forEach((player, index) => {
      teams[index % numTeams].push(player);
    });
    
    return teams;
  }

  // Get tolerance for this mode
  const tolerance = getTolerance(balanceMode);

  // Try to find a balanced configuration
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffleArray(players);
    const teams: Player[][] = Array.from({ length: numTeams }, () => []);
    
    // Distribute players round-robin
    shuffled.forEach((player, index) => {
      teams[index % numTeams].push(player);
    });

    // Check if this configuration is balanced
    if (areTeamsBalanced(teams, tolerance, rankingMode)) {
      return teams;
    }
  }

  // Fallback: return last attempt even if not perfectly balanced
  // This prevents infinite loops
  const shuffled = shuffleArray(players);
  const teams: Player[][] = Array.from({ length: numTeams }, () => []);
  
  shuffled.forEach((player, index) => {
    teams[index % numTeams].push(player);
  });
  
  return teams;
}

/**
 * Generate balanced teams with gender distribution
 * Ensures both men and women are distributed evenly across teams
 */
export function generateBalancedTeamsMixed(
  players: Player[],
  numTeams: number,
  balanceMode: BalanceMode,
  maxAttempts: number = 100,
  rankingMode: RankingMode = 'manual'
): Player[][] {
  const { men, women } = filterPlayersByGender(players);

  // Generate balanced teams for each group
  const menTeams = generateBalancedTeams(men, numTeams, balanceMode, maxAttempts, rankingMode);
  const womenTeams = generateBalancedTeams(women, numTeams, balanceMode, maxAttempts, rankingMode);

  // Merge teams
  const teams: Player[][] = Array.from({ length: numTeams }, () => []);
  for (let i = 0; i < numTeams; i++) {
    teams[i] = [...(menTeams[i] || []), ...(womenTeams[i] || [])];
  }

  return teams;
}

/**
 * Generate balanced teams split by gender
 * Creates separate team structures for men and women
 */
export function generateBalancedTeamsSplit(
  players: Player[],
  numTeams: number,
  balanceMode: BalanceMode,
  maxAttempts: number = 100,
  rankingMode: RankingMode = 'manual'
): { men: Player[][], women: Player[][] } {
  const { men, women } = filterPlayersByGender(players);

  return {
    men: generateBalancedTeams(men, numTeams, balanceMode, maxAttempts, rankingMode),
    women: generateBalancedTeams(women, numTeams, balanceMode, maxAttempts, rankingMode),
  };
}

/**
 * Get balance mode configuration
 */
export function getBalanceModeConfig(mode: BalanceMode): {
  label: string;
  description: string;
  tolerance: number;
} {
  switch (mode) {
    case 'strict':
      return {
        label: 'Strict (5%)',
        description: 'Équipes très égales, moins de combinaisons possibles',
        tolerance: TOLERANCE_STRICT,
      };
    case 'flexible':
      return {
        label: 'Flexible (15%)',
        description: 'Plus de variété dans les duels, léger déséquilibre possible',
        tolerance: TOLERANCE_FLEXIBLE,
      };
    case 'random':
      return {
        label: 'Aléatoire',
        description: 'Rotation aléatoire sans calcul de force',
        tolerance: TOLERANCE_RANDOM,
      };
  }
}

/**
 * Interface for a single match with its teams
 */
export interface Match {
  teams: Player[][];
  winnerTeamIndex?: number;
}

/**
 * Interface for multi-match session data
 */
export interface MultiMatchData {
  matches: Match[];
  teamMode: 'mixed' | 'split';
}

/**
 * Generate multiple matches for a session
 * Each match has different team compositions while maintaining balance.
 * Diversity is ensured by the Fisher-Yates shuffle applied in generateBalancedTeams
 * at each call, producing different random permutations.
 */
export function generateMultipleMatches(
  players: Player[],
  numTeams: number,
  numMatches: number,
  balanceMode: BalanceMode,
  teamMode: 'mixed' | 'split',
  maxAttempts: number = 100,
  rankingMode: RankingMode = 'manual'
): MultiMatchData {
  const matches: Match[] = [];

  for (let i = 0; i < numMatches; i++) {
    let teams: Player[][];
    
    if (teamMode === 'mixed') {
      teams = generateBalancedTeamsMixed(players, numTeams, balanceMode, maxAttempts, rankingMode);
    } else {
      // For split mode, we combine men and women teams into a single match structure
      const splitResult = generateBalancedTeamsSplit(players, numTeams, balanceMode, maxAttempts, rankingMode);
      // Merge for storage - the UI will handle displaying separately if needed
      teams = [];
      for (let j = 0; j < numTeams; j++) {
        teams.push([...(splitResult.men[j] || []), ...(splitResult.women[j] || [])]);
      }
    }

    matches.push({ teams });
  }

  return { matches, teamMode };
}

/**
 * Swap two players between teams within a match
 * Returns a new match object with the swapped players
 */
export function swapPlayers(
  match: Match,
  player1: { teamIndex: number; playerIndex: number },
  player2: { teamIndex: number; playerIndex: number }
): Match {
  // Create a deep copy of teams
  const newTeams = match.teams.map(team => [...team]);
  
  // Swap the players
  const temp = newTeams[player1.teamIndex][player1.playerIndex];
  newTeams[player1.teamIndex][player1.playerIndex] = newTeams[player2.teamIndex][player2.playerIndex];
  newTeams[player2.teamIndex][player2.playerIndex] = temp;

  return {
    ...match,
    teams: newTeams,
  };
}

/**
 * Move a player from one team to another
 * Returns a new match object with the moved player
 */
export function movePlayer(
  match: Match,
  fromTeamIndex: number,
  playerIndex: number,
  toTeamIndex: number
): Match {
  // Create a deep copy of teams
  const newTeams = match.teams.map(team => [...team]);
  
  // Remove player from source team
  const [player] = newTeams[fromTeamIndex].splice(playerIndex, 1);
  
  // Add player to target team
  newTeams[toTeamIndex].push(player);

  return {
    ...match,
    teams: newTeams,
  };
}

/**
 * Check if data is in multi-match format
 */
export function isMultiMatchData(data: unknown): data is MultiMatchData {
  return (
    data !== null &&
    typeof data === 'object' &&
    'matches' in data &&
    Array.isArray((data as MultiMatchData).matches)
  );
}

/**
 * Convert legacy single-match data to multi-match format
 */
export function convertToMultiMatchFormat(
  legacyData: Player[][] | { men: Player[][], women: Player[][] },
  teamMode: 'mixed' | 'split' = 'mixed'
): MultiMatchData {
  let teams: Player[][];

  if (Array.isArray(legacyData)) {
    teams = legacyData;
  } else {
    // Convert split format to combined teams
    teams = [];
    const numTeams = Math.max(legacyData.men.length, legacyData.women.length);
    for (let i = 0; i < numTeams; i++) {
      teams.push([...(legacyData.men[i] || []), ...(legacyData.women[i] || [])]);
    }
  }

  return {
    matches: [{ teams }],
    teamMode,
  };
}
