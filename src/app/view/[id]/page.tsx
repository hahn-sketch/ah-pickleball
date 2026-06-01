import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getSession } from '@/actions/sessions';
import { ViewerClient } from '@/components/session/viewer-client';

export const dynamic = 'force-dynamic';
export const revalidate = 5;

interface ViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { id: sessionId } = await params;
  const session = await getSession(sessionId);

  if (!session) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      }
    >
      <ViewerClient session={session} />
    </Suspense>
  );
}
