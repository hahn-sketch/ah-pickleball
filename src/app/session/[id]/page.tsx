import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getSession } from '@/actions/sessions';
import { getPlayers } from '@/actions/players';
import { SessionClient } from '@/components/session/session-client';

export const dynamic = 'force-dynamic';

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id: sessionId } = await params;
  const [session, players] = await Promise.all([
    getSession(sessionId),
    getPlayers(),
  ]);

  if (!session) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      }
    >
      <SessionClient session={session} allPlayers={players} />
    </Suspense>
  );
}
