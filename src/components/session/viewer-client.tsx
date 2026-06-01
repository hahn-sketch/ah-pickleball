'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsTable } from '@/components/session/results-table';
import { Settlement } from '@/components/session/settlement';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { Player, Session as DbSession } from '@prisma/client';

interface SessionWithRelations extends DbSession {
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
    atps: Array<{ id: string; hitterId: string; wasReturned: boolean }>;
  }>;
}

interface ViewerClientProps {
  session: SessionWithRelations;
}

export function ViewerClient({ session }: ViewerClientProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">🏓 AH Pickleball</h1>
              <p className="text-sm text-muted-foreground">
                {formatDate(session.date)}
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Chế độ xem
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="bg-muted/50 rounded-lg p-3 text-center text-sm text-muted-foreground">
          Chế độ xem thôi nha — nhắn người nhập nếu cần sửa gì
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {session.participants.map((p) => (
            <Badge key={p.playerId} variant="secondary">
              {p.player.name}
            </Badge>
          ))}
        </div>

        <ResultsTable
          session={session}
          matches={session.matches}
          participants={session.participants}
          isViewOnly
        />

        <Settlement session={session} matches={session.matches} isViewOnly />
      </main>
    </div>
  );
}
