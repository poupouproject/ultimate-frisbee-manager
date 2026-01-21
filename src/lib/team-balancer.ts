/**
 * Team balancing utilities for Ultimate Frisbee Manager
 * Implements random team generation with configurable balance tolerance
 */

export type BalanceMode = 'strict' | 'flexible' | 'random';

export interface Player {
  id: string;
  full_name: string;
  gender: string;
  speed: number;
  throwing: number;
  [key: string]: any;
}

/**
 * Calculate power score for a player (speed + throwing)
 */
export function getPowerScore(player: Player): number {
  return (player.speed || 5) + (player.throwing || 5);
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
function getTeamPower(team: Player[]): number {
  return team.reduce((sum, player) => sum + getPowerScore(player), 0);
}

/**
 * Check if teams are balanced within the given tolerance
 */
function areTeamsBalanced(teams: Player[][], tolerance: number): boolean {
  const teamPowers = teams.map(getTeamPower);
  const avgPower = teamPowers.reduce((a, b) => a + b, 0) / teams.length;
  
  // Check if all teams are within tolerance of average
  return teamPowers.every(power => {
    const diff = Math.abs(power - avgPower);
    return diff <= avgPower * tolerance;
  });
}

/**
 * Distribute players into teams randomly with balance checking
 */
export function generateBalancedTeams(
  players: Player[],
  numTeams: number,
  balanceMode: BalanceMode,
  maxAttempts: number = 100
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

  // Determine tolerance based on mode
  const tolerance = balanceMode === 'strict' ? 0.05 : 0.15; // 5% or 15%

  // Try to find a balanced configuration
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffleArray(players);
    const teams: Player[][] = Array.from({ length: numTeams }, () => []);
    
    // Distribute players round-robin
    shuffled.forEach((player, index) => {
      teams[index % numTeams].push(player);
    });

    // Check if this configuration is balanced
    if (areTeamsBalanced(teams, tolerance)) {
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
  maxAttempts: number = 100
): Player[][] {
  const men = players.filter(p => p.gender === 'M');
  const women = players.filter(p => p.gender !== 'M'); // F and X together

  // Generate balanced teams for each group
  const menTeams = generateBalancedTeams(men, numTeams, balanceMode, maxAttempts);
  const womenTeams = generateBalancedTeams(women, numTeams, balanceMode, maxAttempts);

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
  maxAttempts: number = 100
): { men: Player[][], women: Player[][] } {
  const men = players.filter(p => p.gender === 'M');
  const women = players.filter(p => p.gender !== 'M');

  return {
    men: generateBalancedTeams(men, numTeams, balanceMode, maxAttempts),
    women: generateBalancedTeams(women, numTeams, balanceMode, maxAttempts),
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
        tolerance: 0.05,
      };
    case 'flexible':
      return {
        label: 'Flexible (15%)',
        description: 'Plus de variété dans les duels, léger déséquilibre possible',
        tolerance: 0.15,
      };
    case 'random':
      return {
        label: 'Aléatoire',
        description: 'Rotation aléatoire sans calcul de force',
        tolerance: 1.0,
      };
  }
}
