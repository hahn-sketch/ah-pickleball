import type { MatchType as PrismaMatchType, Winner } from '@prisma/client';

type MatchType = 'normal' | 'star';

export const STAKE_AMOUNTS: Record<MatchType, number> = {
  normal: 50000,
  star: 100000,
};

export const ATP_BONUS_DIVISOR = 2;

// 10,000đ = 1 trứng
export const EGG_UNIT = 10000;

function roundEggs(eggs: number): string {
  if (Number.isInteger(eggs)) return eggs.toString();
  return (Math.round(eggs * 10) / 10).toFixed(1);
}

export function formatEggs(amount: number): string {
  const eggs = amount / EGG_UNIT;
  if (eggs > 0) return `+${roundEggs(eggs)}🥚`;
  if (eggs < 0) return `${roundEggs(eggs)}🥚`;
  return '0';
}

export function formatEggsNumber(amount: number): string {
  const eggs = amount / EGG_UNIT;
  return roundEggs(eggs);
}

export function getStake(matchType: MatchType): number {
  return STAKE_AMOUNTS[matchType];
}

export function getAtpBonus(matchType: MatchType): number {
  return STAKE_AMOUNTS[matchType] / ATP_BONUS_DIVISOR;
}

function toMatchType(type: PrismaMatchType): MatchType {
  return type === 'STAR' ? 'star' : 'normal';
}

function toWinnerId(winner: Winner): 'teamA' | 'teamB' {
  return winner === 'TEAM_A' ? 'teamA' : 'teamB';
}

interface DbMatch {
  id: string;
  sessionId: string;
  teamAPlayer1: string;
  teamAPlayer2: string;
  teamBPlayer1: string;
  teamBPlayer2: string;
  matchType: PrismaMatchType;
  winnerId: Winner;
  atps: Array<{
    id: string;
    hitterId: string;
    wasReturned: boolean;
  }>;
}

interface Match {
  id: string;
  sessionId: string;
  teamA: [string, string];
  teamB: [string, string];
  matchType: MatchType;
  winnerId: 'teamA' | 'teamB';
  atps: Array<{
    id: string;
    hitterId: string;
    wasReturned: boolean;
  }>;
}

export function dbMatchToMatch(dbMatch: DbMatch): Match {
  return {
    id: dbMatch.id,
    sessionId: dbMatch.sessionId,
    teamA: [dbMatch.teamAPlayer1, dbMatch.teamAPlayer2],
    teamB: [dbMatch.teamBPlayer1, dbMatch.teamBPlayer2],
    matchType: toMatchType(dbMatch.matchType),
    winnerId: toWinnerId(dbMatch.winnerId),
    atps: dbMatch.atps,
  };
}

export function calculateMatchResults(match: Match): Record<string, number> {
  const stake = getStake(match.matchType);
  const results: Record<string, number> = {};

  const winners = match.winnerId === 'teamA' ? match.teamA : match.teamB;
  const losers = match.winnerId === 'teamA' ? match.teamB : match.teamA;

  for (const playerId of winners) {
    results[playerId] = stake;
  }
  for (const playerId of losers) {
    results[playerId] = -stake;
  }

  return results;
}

export function calculateAtpBonus(match: Match): Record<string, number> {
  const bonus = getAtpBonus(match.matchType);
  const results: Record<string, number> = {};

  const allPlayers = [...match.teamA, ...match.teamB];
  for (const playerId of allPlayers) {
    results[playerId] = 0;
  }

  for (const atp of match.atps) {
    const hitterTeam = match.teamA.includes(atp.hitterId) ? 'teamA' : 'teamB';
    const hitterTeamPlayers = hitterTeam === 'teamA' ? match.teamA : match.teamB;
    const otherTeamPlayers = hitterTeam === 'teamA' ? match.teamB : match.teamA;

    const winningTeamPlayers = atp.wasReturned ? otherTeamPlayers : hitterTeamPlayers;
    const losingTeamPlayers = atp.wasReturned ? hitterTeamPlayers : otherTeamPlayers;

    for (const playerId of winningTeamPlayers) {
      results[playerId] += bonus;
    }
    for (const playerId of losingTeamPlayers) {
      results[playerId] -= bonus;
    }
  }

  return results;
}

export interface PlayerResult {
  playerId: string;
  matchWinnings: number;
  atpBonus: number;
  courtShare: number;
  finalBalance: number;
}

interface Session {
  id: string;
  courtFee: number;
  participants: Array<{ playerId: string }>;
}

export function calculateSessionResults(
  session: Session,
  dbMatches: DbMatch[]
): PlayerResult[] {
  const matches = dbMatches.map(dbMatchToMatch);
  const participantIds = session.participants.map((p) => p.playerId);
  const courtShare = session.courtFee / participantIds.length;

  const results: PlayerResult[] = participantIds.map((playerId) => {
    let matchWinnings = 0;
    let atpBonus = 0;

    for (const match of matches) {
      const allPlayers = [...match.teamA, ...match.teamB];
      if (allPlayers.includes(playerId)) {
        const matchResults = calculateMatchResults(match);
        const atpResults = calculateAtpBonus(match);
        matchWinnings += matchResults[playerId] || 0;
        atpBonus += atpResults[playerId] || 0;
      }
    }

    const finalBalance = matchWinnings + atpBonus - courtShare;

    return {
      playerId,
      matchWinnings,
      atpBonus,
      courtShare,
      finalBalance,
    };
  });

  return results;
}
