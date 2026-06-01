'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ResultsTable } from '@/components/session/results-table';
import { Settlement } from '@/components/session/settlement';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { formatDateFull } from '@/lib/format';
import type { SessionWithMatches } from '@/types/session';

interface ViewerClientProps {
  session: SessionWithMatches;
}

export function ViewerClient({ session }: ViewerClientProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <Image
                src="/logo.jpg"
                alt="AH Pickleball Team"
                width={100}
                height={33}
                className="h-8 w-auto"
                priority
              />
              <p className="text-sm text-muted-foreground">
                {formatDateFull(session.date)}
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
