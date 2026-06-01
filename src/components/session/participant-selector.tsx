'use client';

import { useState, useTransition, useOptimistic, useCallback } from 'react';
import { addParticipant, removeParticipant } from '@/actions/sessions';
import { addPlayer } from '@/actions/players';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, UserPlus, X, Loader2 } from 'lucide-react';
import type { Player } from '@prisma/client';

interface ParticipantSelectorProps {
  sessionId: string;
  participants: Array<{ playerId: string; player: Player }>;
  allPlayers: Player[];
}

export function ParticipantSelector({
  sessionId,
  participants,
  allPlayers,
}: ParticipantSelectorProps) {
  const [newGuestName, setNewGuestName] = useState('');
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [isAddingGuest, startGuestTransition] = useTransition();

  const [optimisticParticipants, updateOptimisticParticipants] = useOptimistic(
    participants,
    (state, action: { type: 'add' | 'remove'; playerId: string; player?: Player }) => {
      if (action.type === 'add' && action.player) {
        if (state.some(p => p.playerId === action.playerId)) return state;
        return [...state, { playerId: action.playerId, player: action.player }];
      }
      return state.filter((p) => p.playerId !== action.playerId);
    }
  );

  const fixedPlayers = allPlayers.filter((p) => p.isFixed);
  const participantIds = optimisticParticipants.map((p) => p.playerId);

  const handleToggle = useCallback((playerId: string, isParticipant: boolean, player?: Player) => {
    if (isParticipant) {
      updateOptimisticParticipants({ type: 'remove', playerId });
      removeParticipant(sessionId, playerId);
    } else if (player) {
      updateOptimisticParticipants({ type: 'add', playerId, player });
      addParticipant(sessionId, playerId);
    }
  }, [sessionId, updateOptimisticParticipants]);

  const handleAddGuest = () => {
    const trimmed = newGuestName.trim();
    if (!trimmed) return;

    const exists = allPlayers.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert('Tên này đã có rồi nha!');
      return;
    }

    startGuestTransition(async () => {
      const player = await addPlayer(trimmed, false);
      await addParticipant(sessionId, player.id);
      setNewGuestName('');
      setShowAddGuest(false);
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Ai chơi hôm nay?</span>
          <Badge variant="secondary">{optimisticParticipants.length} người</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {fixedPlayers.map((player) => {
            const isParticipant = participantIds.includes(player.id);
            return (
              <div
                key={player.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggle(player.id, isParticipant, player)}
              >
                <Checkbox
                  id={player.id}
                  checked={isParticipant}
                  onCheckedChange={() => handleToggle(player.id, isParticipant, player)}
                />
                <label
                  htmlFor={player.id}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {player.name}
                </label>
              </div>
            );
          })}
        </div>

        {optimisticParticipants.filter((p) => !p.player.isFixed).length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Khách hôm nay:</p>
            <div className="flex flex-wrap gap-2">
              {optimisticParticipants
                .filter((p) => !p.player.isFixed)
                .map((p) => (
                  <Badge key={p.playerId} variant="outline" className="py-1.5 px-3">
                    {p.player.name}
                    <button
                      onClick={() => handleToggle(p.playerId, true, p.player)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {showAddGuest ? (
          <div className="flex gap-2">
            <Input
              placeholder="Tên khách..."
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
              autoFocus
              disabled={isAddingGuest}
            />
            <Button onClick={handleAddGuest} size="icon" disabled={isAddingGuest}>
              {isAddingGuest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddGuest(false)}
              disabled={isAddingGuest}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddGuest(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm khách
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
