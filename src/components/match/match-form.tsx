'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addMatch } from '@/actions/matches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Zap, Trophy, Star, Loader2 } from 'lucide-react';
import type { Player } from '@prisma/client';

type MatchType = 'normal' | 'star';
type WinnerId = 'teamA' | 'teamB';

interface ATP {
  hitterId: string;
  wasReturned: boolean;
}

interface MatchFormProps {
  sessionId: string;
  participants: Array<{ playerId: string; player: Player }>;
  onClose: () => void;
}

type Step = 'players' | 'type' | 'winner' | 'atp';

export function MatchForm({ sessionId, participants, onClose }: MatchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>('players');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<[string, string] | null>(null);
  const [teamB, setTeamB] = useState<[string, string] | null>(null);
  const [matchType, setMatchType] = useState<MatchType>('normal');
  const [winnerId, setWinnerId] = useState<WinnerId | null>(null);
  const [atps, setAtps] = useState<ATP[]>([]);
  const [currentAtp, setCurrentAtp] = useState<{
    hitterId: string;
    wasReturned: boolean;
  } | null>(null);

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const handleConfirmPlayers = () => {
    if (selectedPlayers.length !== 4) {
      alert('Còn thiếu người kìa! Cần đủ 4 tay vợt mới đánh được 🏓');
      return;
    }
    setTeamA([selectedPlayers[0], selectedPlayers[1]]);
    setTeamB([selectedPlayers[2], selectedPlayers[3]]);
    setStep('type');
  };

  const handleSwapTeams = (playerIndex: number) => {
    if (!teamA || !teamB) return;

    const allPlayers = [...teamA, ...teamB];
    const targetIndex = playerIndex < 2 ? playerIndex + 2 : playerIndex - 2;

    const newPlayers = [...allPlayers];
    [newPlayers[playerIndex], newPlayers[targetIndex]] = [
      newPlayers[targetIndex],
      newPlayers[playerIndex],
    ];

    setTeamA([newPlayers[0], newPlayers[1]]);
    setTeamB([newPlayers[2], newPlayers[3]]);
  };

  const handleConfirmType = () => {
    setStep('winner');
  };

  const handleSelectWinner = (team: WinnerId) => {
    setWinnerId(team);
    setStep('atp');
  };

  const handleAddAtp = () => {
    if (!currentAtp || !currentAtp.hitterId) return;
    setAtps((prev) => [...prev, currentAtp]);
    setCurrentAtp(null);
  };

  const handleRemoveAtp = (index: number) => {
    setAtps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMatch = () => {
    if (!teamA || !teamB || !winnerId) return;

    startTransition(async () => {
      await addMatch({
        sessionId,
        teamA,
        teamB,
        matchType,
        winnerId,
        atps,
      });
      router.refresh();
      onClose();
    });
  };

  const getPlayerName = (playerId: string) => {
    return participants.find((p) => p.playerId === playerId)?.player.name || 'Unknown';
  };

  const allMatchPlayers = teamA && teamB ? [...teamA, ...teamB] : [];

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>
            {step === 'players' && 'Chọn 4 người'}
            {step === 'type' && 'Loại trận'}
            {step === 'winner' && 'Ai thắng?'}
            {step === 'atp' && 'ATP (nếu có)'}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isPending}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'players' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {participants.map((p) => {
                const isSelected = selectedPlayers.includes(p.playerId);
                const isDisabled = !isSelected && selectedPlayers.length >= 4;

                return (
                  <Button
                    key={p.playerId}
                    variant={isSelected ? 'default' : 'outline'}
                    className="h-12 justify-start"
                    disabled={isDisabled}
                    onClick={() => handlePlayerToggle(p.playerId)}
                  >
                    {p.player.name}
                    {isSelected && (
                      <Badge className="ml-auto" variant="secondary">
                        {selectedPlayers.indexOf(p.playerId) + 1}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Đã chọn {selectedPlayers.length}/4 người
            </p>
            <Button
              className="w-full"
              onClick={handleConfirmPlayers}
              disabled={selectedPlayers.length !== 4}
            >
              Tiếp tục
            </Button>
          </>
        )}

        {step === 'type' && teamA && teamB && (
          <>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Đội A
                </p>
                <div className="flex gap-2">
                  {teamA.map((id, i) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwapTeams(i)}
                    >
                      {getPlayerName(id)}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-center text-muted-foreground text-sm">VS</p>

              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  Đội B
                </p>
                <div className="flex gap-2">
                  {teamB.map((id, i) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwapTeams(i + 2)}
                    >
                      {getPlayerName(id)}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Bấm vào tên để đổi đội
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Loại trận</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={matchType === 'normal' ? 'default' : 'outline'}
                  className="h-16 flex-col"
                  onClick={() => setMatchType('normal')}
                >
                  <span className="font-bold">Thường</span>
                  <span className="text-sm opacity-80">50</span>
                </Button>
                <Button
                  variant={matchType === 'star' ? 'default' : 'outline'}
                  className="h-16 flex-col"
                  onClick={() => setMatchType('star')}
                >
                  <Star className="h-4 w-4 mb-1" />
                  <span className="font-bold">Ngôi sao</span>
                  <span className="text-sm opacity-80">100</span>
                </Button>
              </div>
            </div>

            <Button className="w-full" onClick={handleConfirmType}>
              Tiếp tục
            </Button>
          </>
        )}

        {step === 'winner' && teamA && teamB && (
          <>
            <p className="text-center text-muted-foreground">
              Bấm vào đội thắng
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-20 flex-col border-2 hover:border-green-500 hover:bg-green-50"
                onClick={() => handleSelectWinner('teamA')}
              >
                <Trophy className="h-5 w-5 mb-1 text-green-600" />
                <span className="font-bold">
                  {getPlayerName(teamA[0])} & {getPlayerName(teamA[1])}
                </span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 flex-col border-2 hover:border-green-500 hover:bg-green-50"
                onClick={() => handleSelectWinner('teamB')}
              >
                <Trophy className="h-5 w-5 mb-1 text-green-600" />
                <span className="font-bold">
                  {getPlayerName(teamB[0])} & {getPlayerName(teamB[1])}
                </span>
              </Button>
            </div>
          </>
        )}

        {step === 'atp' && teamA && teamB && (
          <>
            {atps.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">ATP đã ghi:</p>
                {atps.map((atp, index) => {
                  const hitterTeam = teamA.includes(atp.hitterId) ? 'A' : 'B';
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">
                        <Zap className="h-3 w-3 inline mr-1 text-yellow-500" />
                        {getPlayerName(atp.hitterId)} (Đội {hitterTeam})
                        {atp.wasReturned ? ' → Bị phản' : ' → Không phản được'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveAtp(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {currentAtp ? (
              <div className="space-y-3 p-3 border rounded-lg">
                <p className="font-medium">Ai đánh ATP?</p>
                <div className="grid grid-cols-2 gap-2">
                  {allMatchPlayers.map((id) => (
                    <Button
                      key={id}
                      variant={currentAtp.hitterId === id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setCurrentAtp({ ...currentAtp, hitterId: id })
                      }
                    >
                      {getPlayerName(id)}
                    </Button>
                  ))}
                </div>

                <p className="font-medium">Đội kia phản được không?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={!currentAtp.wasReturned ? 'default' : 'outline'}
                    onClick={() =>
                      setCurrentAtp({ ...currentAtp, wasReturned: false })
                    }
                  >
                    Không phản được
                  </Button>
                  <Button
                    variant={currentAtp.wasReturned ? 'default' : 'outline'}
                    onClick={() =>
                      setCurrentAtp({ ...currentAtp, wasReturned: true })
                    }
                  >
                    Phản được
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentAtp(null)}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddAtp}
                    disabled={!currentAtp.hitterId}
                  >
                    Thêm ATP
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setCurrentAtp({ hitterId: '', wasReturned: false })
                }
              >
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Thêm ATP
              </Button>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleSaveMatch}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu trận'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
