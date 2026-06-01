'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateSession } from '@/actions/sessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Check, Loader2 } from 'lucide-react';
import { calculateSessionResults } from '@/lib/calculations';
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

interface SessionWithParticipants extends DbSession {
  participants: Array<{ playerId: string; player: Player }>;
}

interface SettlementProps {
  session: SessionWithParticipants;
  matches: DbMatch[];
  isViewOnly?: boolean;
}

export function Settlement({
  session,
  matches,
  isViewOnly = false,
}: SettlementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [courtFeeInput, setCourtFeeInput] = useState(
    session.courtFee ? String(session.courtFee / 1000) : ''
  );

  const handleSettle = () => {
    const courtFee = parseFloat(courtFeeInput) * 1000;
    if (isNaN(courtFee) || courtFee < 0) {
      alert('Tiền âm thì ai trả cho ai đây 😅 Nhập lại số dương đi anh');
      return;
    }

    startTransition(async () => {
      await updateSession(session.id, { courtFee, isSettled: true });
      router.refresh();
    });
  };

  const handleUpdateFee = () => {
    const courtFee = parseFloat(courtFeeInput) * 1000;
    if (isNaN(courtFee) || courtFee < 0) {
      alert('Tiền âm thì ai trả cho ai đây 😅 Nhập lại số dương đi anh');
      return;
    }

    startTransition(async () => {
      await updateSession(session.id, { courtFee });
      router.refresh();
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.abs(amount)) + 'đ';
  };

  const getPlayerName = (playerId: string) => {
    return session.participants.find((p) => p.playerId === playerId)?.player.name || 'Unknown';
  };

  if (!session.isSettled) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Quyết toán
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courtFee">Tiền sân + nước (nghìn đồng)</Label>
            <div className="flex gap-2">
              <Input
                id="courtFee"
                type="number"
                placeholder="VD: 200"
                value={courtFeeInput}
                onChange={(e) => setCourtFeeInput(e.target.value)}
                disabled={isViewOnly || isPending}
              />
              <span className="flex items-center text-muted-foreground">
                ,000đ
              </span>
            </div>
          </div>

          {!isViewOnly && (
            <Button className="w-full" onClick={handleSettle} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Chốt sổ
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const sessionData = {
    id: session.id,
    courtFee: session.courtFee,
    participants: session.participants,
  };
  const results = calculateSessionResults(sessionData, matches);

  return (
    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Quyết toán
          </span>
          <Badge variant="secondary" className="bg-green-100">
            Đã chốt!
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Tiền sân + nước: {formatAmount(session.courtFee)} ÷{' '}
          {session.participants.length} người ={' '}
          {formatAmount(session.courtFee / session.participants.length)}/người
        </div>

        {!isViewOnly && (
          <div className="flex gap-2">
            <Input
              type="number"
              value={courtFeeInput}
              onChange={(e) => setCourtFeeInput(e.target.value)}
              className="w-24"
              disabled={isPending}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateFee}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sửa'}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {results
            .sort((a, b) => b.finalBalance - a.finalBalance)
            .map((result) => {
              const isPositive = result.finalBalance > 0;
              const isNegative = result.finalBalance < 0;

              return (
                <div
                  key={result.playerId}
                  className={`p-3 rounded-lg ${
                    isPositive
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : isNegative
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{getPlayerName(result.playerId)}</span>
                    <span
                      className={`font-bold ${
                        isPositive
                          ? 'text-green-600'
                          : isNegative
                          ? 'text-red-600'
                          : ''
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatAmount(result.finalBalance)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Trận: {result.matchWinnings >= 0 ? '+' : ''}
                    {formatAmount(result.matchWinnings)}
                    {result.atpBonus !== 0 && (
                      <>
                        {' '}
                        • ATP: {result.atpBonus >= 0 ? '+' : ''}
                        {formatAmount(result.atpBonus)}
                      </>
                    )}
                    {' '}• Sân: -{formatAmount(result.courtShare)}
                  </div>
                  <div className="text-xs font-medium mt-1">
                    {isPositive
                      ? '→ Admin chuyển cho bạn'
                      : isNegative
                      ? '→ Bạn chuyển cho Admin'
                      : '→ Hòa vốn'}
                  </div>
                </div>
              );
            })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Sổ đã chốt! Ai âm thì lo chuyển khoản đi nha 😄
        </p>
      </CardContent>
    </Card>
  );
}
