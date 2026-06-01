'use client';

import { useState } from 'react';
import Image from 'next/image';
import { RosterManager } from '@/components/roster/roster-manager';
import { SessionList } from '@/components/session/session-list';
import { CreateSessionDialog } from '@/components/session/create-session-dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import type { SessionListItem } from '@/types/session';
import type { Player } from '@prisma/client';

interface HomeClientProps {
  initialPlayers: Player[];
  initialSessions: SessionListItem[];
}

export function HomeClient({ initialPlayers, initialSessions }: HomeClientProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <Image
            src="/logo.jpg"
            alt="AH Pickleball Team"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
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
