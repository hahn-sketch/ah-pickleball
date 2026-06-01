'use client';

import { useState } from 'react';
import { RosterManager } from '@/components/roster/roster-manager';
import { SessionList } from '@/components/session/session-list';
import { CreateSessionDialog } from '@/components/session/create-session-dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
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

interface HomeClientProps {
  initialPlayers: Player[];
  initialSessions: SessionWithRelations[];
}

export function HomeClient({ initialPlayers, initialSessions }: HomeClientProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">🏓 AH Pickleball</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {showSettings ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Cài đặt</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                Đóng
              </Button>
            </div>
            <RosterManager initialPlayers={initialPlayers} />
          </>
        ) : (
          <>
            <CreateSessionDialog />
            <div>
              <h2 className="font-semibold mb-3">Các buổi chơi</h2>
              <SessionList sessions={initialSessions} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
