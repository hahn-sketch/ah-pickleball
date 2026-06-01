'use client';

import { useState, useTransition } from 'react';
import { addPlayer, removePlayer } from '@/actions/players';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, Loader2 } from 'lucide-react';
import type { Player } from '@prisma/client';

interface RosterManagerProps {
  initialPlayers: Player[];
}

export function RosterManager({ initialPlayers }: RosterManagerProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [newName, setNewName] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAddPlayer = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const exists = players.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert('Tên này đã có rồi nha!');
      return;
    }

    startTransition(async () => {
      const player = await addPlayer(trimmed, true);
      setPlayers((prev) => [...prev, player]);
      setNewName('');
    });
  };

  const handleRemove = (playerId: string, playerName: string) => {
    if (!confirm(`Xóa ${playerName} khỏi danh sách?`)) return;

    startTransition(async () => {
      await removePlayer(playerId);
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    });
  };

  const fixedPlayers = players.filter((p) => p.isFixed);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Danh sách thành viên
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nhập tên..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            className="flex-1"
            disabled={isPending}
          />
          <Button onClick={handleAddPlayer} size="icon" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {fixedPlayers.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Chưa có ai trong danh sách. Thêm thành viên đi!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fixedPlayers.map((player) => (
              <Badge
                key={player.id}
                variant="secondary"
                className="text-sm py-1.5 px-3 flex items-center gap-1"
              >
                {player.name}
                <button
                  onClick={() => handleRemove(player.id, player.name)}
                  className="ml-1 hover:text-destructive"
                  disabled={isPending}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <p className="text-muted-foreground text-xs">
          {fixedPlayers.length} thành viên cố định
        </p>
      </CardContent>
    </Card>
  );
}
