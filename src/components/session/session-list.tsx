'use client';

import { useTransition } from 'react';
import { deleteSession } from '@/actions/sessions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Player, Session as DbSession } from '@prisma/client';

interface SessionWithRelations extends DbSession {
  participants: Array<{ playerId: string; player: Player }>;
  matches: Array<{ id: string }>;
}

interface SessionListProps {
  sessions: SessionWithRelations[];
}

export function SessionList({ sessions }: SessionListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (sessionId: string, date: Date) => {
    const dateStr = date.toLocaleDateString('vi-VN');
    if (!confirm(`Xóa buổi ngày ${dateStr}? Không thể khôi phục lại được đâu!`)) {
      return;
    }

    startTransition(async () => {
      await deleteSession(sessionId);
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Chưa có buổi nào. Tạo buổi mới để bắt đầu!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{formatDate(session.date)}</span>
                  {session.isSettled && (
                    <Badge variant="secondary" className="text-xs">
                      Đã quyết toán
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.participants.length} người • {session.matches.length}{' '}
                  trận
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(session.id, session.date)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Link href={`/session/${session.id}`}>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
