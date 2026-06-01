import { Suspense } from 'react';
import { getPlayers } from '@/actions/players';
import { getSessions } from '@/actions/sessions';
import { HomeClient } from '@/components/home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [players, sessions] = await Promise.all([getPlayers(), getSessions()]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      }
    >
      <HomeClient initialPlayers={players} initialSessions={sessions} />
    </Suspense>
  );
}
