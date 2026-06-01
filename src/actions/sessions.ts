'use server';

import { db } from '@/lib/db';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

export const getSessions = unstable_cache(
  async () => {
    return db.session.findMany({
      orderBy: { date: 'desc' },
      include: {
        participants: {
          include: { player: true },
        },
        matches: {
          select: { id: true },
        },
      },
    });
  },
  ['sessions-list'],
  { tags: ['sessions'], revalidate: 60 }
);

export const getSession = unstable_cache(
  async (sessionId: string) => {
    return db.session.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: { player: true },
        },
        matches: {
          orderBy: { createdAt: 'asc' },
          include: { atps: true },
        },
      },
    });
  },
  ['session-detail'],
  { tags: ['sessions'], revalidate: 60 }
);

export async function createSession(date: string, name?: string) {
  const session = await db.session.create({
    data: {
      date: new Date(date),
      name,
    },
  });
  revalidateTag('sessions', 'max');
  revalidatePath('/');
  return session;
}

export async function updateSession(
  sessionId: string,
  data: { courtFee?: number; isSettled?: boolean; name?: string }
) {
  const session = await db.session.update({
    where: { id: sessionId },
    data,
  });
  revalidateTag('sessions', 'max');
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/view/${sessionId}`);
  return session;
}

export async function deleteSession(sessionId: string) {
  await db.session.delete({
    where: { id: sessionId },
  });
  revalidateTag('sessions', 'max');
  revalidatePath('/');
}

export async function addParticipant(sessionId: string, playerId: string) {
  await db.sessionParticipant.create({
    data: { sessionId, playerId },
  });
  revalidateTag('sessions', 'max');
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/view/${sessionId}`);
}

export async function removeParticipant(sessionId: string, playerId: string) {
  await db.sessionParticipant.delete({
    where: {
      sessionId_playerId: { sessionId, playerId },
    },
  });
  revalidateTag('sessions', 'max');
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/view/${sessionId}`);
}
