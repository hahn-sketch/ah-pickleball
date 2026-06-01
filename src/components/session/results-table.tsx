'use client';

import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMatch } from '@/actions/matches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Zap, Star, Loader2 } from 'lucide-react';
import {
  calculateMatchResults,
  calculateAtpBonus,
  dbMatchToMatch,
  formatEggs,
} from '@/lib/calculations';
import type { Player, Session as DbSession } from '@prisma/client';

interface DbMatch {
  id: string;
  sessionId: string;
  teamAPlayer1: string;
  teamAPlayer2: string;
  teamBPlayer1: string;
  teamBPlayer2: string;
  matchType: 'NORMAL' | 'STAR';
  winnerId: 'TEAM_A' | 'TEAM_B';
  atps: Array<{ id: string; hitterId: string; wasReturned: boolean }>;
}

interface ResultsTableProps {
  session: DbSession;
  matches: DbMatch[];
  participants: Array<{ playerId: string; player: Player }>;
  isViewOnly?: boolean;
}

export function ResultsTable({
  session,
  matches,
  participants,
  isViewOnly = false,
}: ResultsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const calculatedData = useMemo(() => {
    const playerTotals: Record<string, number> = {};
    const matchResults: Record<string, Record<string, { total: number; hasAtp: boolean; atpAmount: number } | null>> = {};

    for (const participant of participants) {
      playerTotals[participant.playerId] = 0;
    }

    for (const dbMatch of matches) {
      const match = dbMatchToMatch(dbMatch);
      const allPlayers = [...match.teamA, ...match.teamB];
      const matchRes = calculateMatchResults(match);
      const atpRes = calculateAtpBonus(match);

      matchResults[dbMatch.id] = {};

      for (const participant of participants) {
        const playerId = participant.playerId;
        if (!allPlayers.includes(playerId)) {
          matchResults[dbMatch.id][playerId] = null;
          continue;
        }

        const total = (matchRes[playerId] || 0) + (atpRes[playerId] || 0);
        playerTotals[playerId] += total;
        matchResults[dbMatch.id][playerId] = {
          total,
          hasAtp: match.atps.length > 0,
          atpAmount: atpRes[playerId] || 0,
        };
      }
    }

    return { playerTotals, matchResults };
  }, [matches, participants]);

  const handleDeleteMatch = (matchId: string, index: number) => {
    if (!confirm(`Xóa trận ${index + 1}?`)) return;

    startTransition(async () => {
      await deleteMatch(matchId, session.id);
      router.refresh();
    });
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Chưa có trận nào hết. Bấm + để ghi trận đầu tiên đi! 🏓
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Bảng kết quả</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="sticky left-0 bg-muted/50 p-2 text-left font-medium w-16">
                  Trận
                </th>
                {participants.map((p) => (
                  <th
                    key={p.playerId}
                    className="p-2 text-center font-medium min-w-[60px]"
                  >
                    {p.player.name}
                  </th>
                ))}
                {!isViewOnly && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-primary/5 font-bold">
                <td className="sticky left-0 bg-primary/5 p-2">Tổng</td>
                {participants.map((p) => {
                  const total = calculatedData.playerTotals[p.playerId];
                  return (
                    <td
                      key={p.playerId}
                      className={`p-2 text-center ${
                        total > 0
                          ? 'text-green-600'
                          : total < 0
                          ? 'text-red-600'
                          : ''
                      }`}
                    >
                      {formatEggs(total)}
                    </td>
                  );
                })}
                {!isViewOnly && <td></td>}
              </tr>

              {matches.map((match, index) => (
                <tr key={match.id} className="border-b hover:bg-muted/30">
                  <td className="sticky left-0 bg-background p-2">
                    <div className="flex items-center gap-1">
                      <span>{index + 1}</span>
                      {match.matchType === 'STAR' && (
                        <Star className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  {participants.map((p) => {
                    const result = calculatedData.matchResults[match.id]?.[p.playerId];
                    if (!result) {
                      return (
                        <td
                          key={p.playerId}
                          className="p-2 text-center text-muted-foreground"
                        >
                          -
                        </td>
                      );
                    }
                    return (
                      <td
                        key={p.playerId}
                        className={`p-2 text-center ${
                          result.total > 0
                            ? 'text-green-600'
                            : result.total < 0
                            ? 'text-red-600'
                            : ''
                        }`}
                      >
                        <span className="inline-flex items-center justify-center gap-0.5 whitespace-nowrap">
                          {formatEggs(result.total)}
                          {result.hasAtp && result.atpAmount !== 0 && (
                            <Zap className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                          )}
                        </span>
                      </td>
                    );
                  })}
                  {!isViewOnly && (
                    <td className="p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteMatch(match.id, index)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
