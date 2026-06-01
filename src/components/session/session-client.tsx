'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParticipantSelector } from '@/components/session/participant-selector';
import { ResultsTable } from '@/components/session/results-table';
import { Settlement } from '@/components/session/settlement';
import { MatchForm } from '@/components/match/match-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Share2 } from 'lucide-react';
import { formatDateShort } from '@/lib/format';
import type { SessionWithMatches } from '@/types/session';
import type { Player } from '@prisma/client';

interface SessionClientProps {
  session: SessionWithMatches;
  allPlayers: Player[];
}

export function SessionClient({ session, allPlayers }: SessionClientProps) {
  const router = useRouter();
  const [showMatchForm, setShowMatchForm] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/view/${session.id}`;
    try {
      await navigator.share({
        title: `Buổi ${formatDateShort(session.date)}`,
        text: 'Xem kết quả pickleball',
        url,
      });
    } catch {
      await navigator.clipboard.writeText(url);
      alert('Đã copy link! Gửi cho anh em để xem kết quả nhé.');
    }
  };

  const canAddMatch = session.participants.length >= 4;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold">{formatDateShort(session.date)}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{session.matches.length} trận</Badge>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <ParticipantSelector
          sessionId={session.id}
          participants={session.participants}
          allPlayers={allPlayers}
        />

        {showMatchForm ? (
          <MatchForm
            sessionId={session.id}
            participants={session.participants}
            onClose={() => setShowMatchForm(false)}
          />
        ) : (
          canAddMatch && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowMatchForm(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm trận
            </Button>
          )
        )}

        {!canAddMatch && session.participants.length > 0 && (
          <p className="text-center text-muted-foreground text-sm">
            Cần ít nhất 4 người mới đánh được nha!
          </p>
        )}

        <ResultsTable
          session={session}
          matches={session.matches}
          participants={session.participants}
        />

        <Settlement session={session} matches={session.matches} />
      </main>
    </div>
  );
}
