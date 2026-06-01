export type MatchType = 'normal' | 'star';

export interface Player {
  id: string;
  name: string;
  isFixed: boolean;
}

export interface ATP {
  id: string;
  hitterId: string;
  wasReturned: boolean;
}

export interface Match {
  id: string;
  sessionId: string;
  teamA: [string, string];
  teamB: [string, string];
  matchType: MatchType;
  winnerId: 'teamA' | 'teamB';
  atps: ATP[];
  createdAt: string;
}

export interface Session {
  id: string;
  date: string;
  name?: string;
  participantIds: string[];
  courtFee: number;
  isSettled: boolean;
  createdAt: string;
}

export interface PlayerResult {
  playerId: string;
  matchWinnings: number;
  atpBonus: number;
  courtShare: number;
  finalBalance: number;
}

export interface AppState {
  players: Player[];
  sessions: Session[];
  matches: Match[];
}

export const STAKE_AMOUNTS: Record<MatchType, number> = {
  normal: 50000,
  star: 100000,
};

export const ATP_BONUS_DIVISOR = 2;

export function getStake(matchType: MatchType): number {
  return STAKE_AMOUNTS[matchType];
}

export function getAtpBonus(matchType: MatchType): number {
  return STAKE_AMOUNTS[matchType] / ATP_BONUS_DIVISOR;
}
