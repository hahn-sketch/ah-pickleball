'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPlayers() {
  return db.player.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function addPlayer(name: string, isFixed: boolean = true) {
  const player = await db.player.create({
    data: { name, isFixed },
  });
  revalidatePath('/');
  return player;
}

export async function removePlayer(playerId: string) {
  await db.player.delete({
    where: { id: playerId },
  });
  revalidatePath('/');
}
