'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { MatchType as MatchTypeEnum } from '@prisma/client';

type MatchType = 'normal' | 'star';
type WinnerId = 'teamA' | 'teamB';

interface ATP {
  hitterId: string;
  wasReturned: boolean;
}

interface CreateMatchData {
  sessionId: string;
  teamA: [string, string];
  teamB: [string, string];
  matchType: MatchType;
  winnerId: WinnerId;
  atps: ATP[];
}

function toDbMatchType(type: MatchType): MatchTypeEnum {
  return type === 'star' ? 'STAR' : 'NORMAL';
}

function toDbWinner(winnerId: WinnerId) {
  return winnerId === 'teamA' ? 'TEAM_A' : 'TEAM_B';
}

export async function addMatch(data: CreateMatchData) {
  const match = await db.match.create({
    data: {
      sessionId: data.sessionId,
      teamAPlayer1: data.teamA[0],
      teamAPlayer2: data.teamA[1],
      teamBPlayer1: data.teamB[0],
      teamBPlayer2: data.teamB[1],
      matchType: toDbMatchType(data.matchType),
      winnerId: toDbWinner(data.winnerId),
      atps: {
        create: data.atps.map((atp) => ({
          hitterId: atp.hitterId,
          wasReturned: atp.wasReturned,
        })),
      },
    },
    include: { atps: true },
  });

  revalidatePath(`/session/${data.sessionId}`);
  revalidatePath(`/view/${data.sessionId}`);
  return match;
}

export async function deleteMatch(matchId: string, sessionId: string) {
  await db.match.delete({
    where: { id: matchId },
  });
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/view/${sessionId}`);
}
