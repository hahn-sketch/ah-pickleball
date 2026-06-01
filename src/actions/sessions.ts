'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getSessions() {
  return db.session.findMany({
    orderBy: { date: 'desc' },
    include: {
      participants: {
        include: { player: true },
      },
      matches: {
        include: { atps: true },
      },
    },
  });
}

export async function getSession(sessionId: string) {
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
}

export async function createSession(date: string, name?: string) {
  const session = await db.session.create({
    data: {
      date: new Date(date),
      name,
    },
  });
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
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/view/${sessionId}`);
  return session;
}

export async function deleteSession(sessionId: string) {
  await db.session.delete({
    where: { id: sessionId },
  });
  revalidatePath('/');
}

export async function addParticipant(sessionId: string, playerId: string) {
  await db.sessionParticipant.create({
    data: { sessionId, playerId },
  });
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/view/${sessionId}`);
}

export async function removeParticipant(sessionId: string, playerId: string) {
  await db.sessionParticipant.delete({
    where: {
      sessionId_playerId: { sessionId, playerId },
    },
  });
  revalidatePath(`/session/${sessionId}`);
  revalidatePath(`/view/${sessionId}`);
}
