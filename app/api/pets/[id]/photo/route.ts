import { requireUser } from '@/lib/session';
import { accessPet } from '@/lib/care';
import { db } from '@/lib/db';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  try {
    await accessPet(user.id, id);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  const file = await db.petMedia.findFirst({
    where: { petId: id, kind: 'PHOTO' },
    orderBy: { createdAt: 'desc' },
  });
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mime,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
