'use server';

import { db } from '@/lib/db';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

export const getPlayers = unstable_cache(
  async () => {
    return db.player.findMany({
      orderBy: { name: 'asc' },
    });
  },
  ['players-list'],
  { tags: ['players'], revalidate: 60 }
);

export async function addPlayer(name: string, isFixed: boolean = true) {
  const player = await db.player.create({
    data: { name, isFixed },
  });
  revalidateTag('players', 'max');
  revalidatePath('/');
  return player;
}

export async function removePlayer(playerId: string) {
  await db.player.delete({
    where: { id: playerId },
  });
  revalidateTag('players', 'max');
  revalidatePath('/');
}
