/**
 * Sports configuration and ranking parameters
 * Used for multi-sport support in club creation
 */

export interface SkillParam {
  name: string;
  enabled: boolean;
  description?: string;
}

export interface RankingParams {
  skill1: SkillParam;
  skill2: SkillParam;
}

export interface SportConfig {
  id: string;
  name: string;
  icon: string;
  defaultRankingParams: RankingParams;
}

export const SPORTS: SportConfig[] = [
  {
    id: 'ultimate_frisbee',
    name: 'Ultimate Frisbee',
    icon: '🥏',
    defaultRankingParams: {
      skill1: { name: 'Vitesse', enabled: true, description: 'Rapidité de déplacement sur le terrain' },
      skill2: { name: 'Lancer', enabled: true, description: 'Précision et distance des lancers' },
    },
  },
  {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    defaultRankingParams: {
      skill1: { name: 'Technique', enabled: true, description: 'Contrôle du ballon et dribbles' },
      skill2: { name: 'Endurance', enabled: true, description: 'Capacité physique et récupération' },
    },
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    defaultRankingParams: {
      skill1: { name: 'Tir', enabled: true, description: 'Précision au panier' },
      skill2: { name: 'Défense', enabled: true, description: 'Capacité à bloquer et intercepter' },
    },
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    icon: '🏐',
    defaultRankingParams: {
      skill1: { name: 'Attaque', enabled: true, description: 'Puissance et précision des smashs' },
      skill2: { name: 'Réception', enabled: true, description: 'Qualité des passes et manchettes' },
    },
  },
  {
    id: 'hockey',
    name: 'Hockey',
    icon: '🏒',
    defaultRankingParams: {
      skill1: { name: 'Patin', enabled: true, description: 'Agilité et vitesse sur glace' },
      skill2: { name: 'Tir', enabled: true, description: 'Puissance et précision des lancers' },
    },
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    defaultRankingParams: {
      skill1: { name: 'Service', enabled: true, description: 'Puissance et placement du service' },
      skill2: { name: 'Retour', enabled: true, description: 'Qualité des échanges et déplacements' },
    },
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    defaultRankingParams: {
      skill1: { name: 'Smash', enabled: true, description: 'Puissance des frappes offensives' },
      skill2: { name: 'Agilité', enabled: true, description: 'Déplacements et réactivité' },
    },
  },
  {
    id: 'other',
    name: 'Autre sport',
    icon: '🏆',
    defaultRankingParams: {
      skill1: { name: 'Compétence 1', enabled: true, description: 'Première compétence à évaluer' },
      skill2: { name: 'Compétence 2', enabled: true, description: 'Seconde compétence à évaluer' },
    },
  },
];

export function getSportById(id: string): SportConfig | undefined {
  return SPORTS.find((s) => s.id === id);
}

export function getDefaultRankingParams(sportId: string): RankingParams {
  const sport = getSportById(sportId);
  return sport?.defaultRankingParams ?? SPORTS[0].defaultRankingParams;
}
