'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/actions/sessions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';

export function CreateSessionDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      const session = await createSession(date);
      setOpen(false);
      router.push(`/session/${session.id}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full">
            <Plus className="h-5 w-5 mr-2" />
            Tạo buổi mới
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo buổi chơi mới</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="date">Ngày chơi</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              'Tạo buổi'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
