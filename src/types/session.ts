import type { Player, Session as DbSession } from '@prisma/client';

export interface SessionWithMatches extends DbSession {
  participants: Array<{ playerId: string; player: Player }>;
  matches: Array<{
    id: string;
    sessionId: string;
    teamAPlayer1: string;
    teamAPlayer2: string;
    teamBPlayer1: string;
    teamBPlayer2: string;
    matchType: 'NORMAL' | 'STAR';
    winnerId: 'TEAM_A' | 'TEAM_B';
    createdAt: Date;
    atps: Array<{ id: string; hitterId: string; wasReturned: boolean }>;
  }>;
}

export interface SessionListItem extends DbSession {
  participants: Array<{ playerId: string; player: Player }>;
  matches: Array<{ id: string }>;
}
