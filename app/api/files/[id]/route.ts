import { requireUser } from '@/lib/session';
import { accessPet } from '@/lib/care';
import { db } from '@/lib/db';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const metadata = await db.petMedia.findUnique({
    where: { id },
    select: { petId: true, mime: true },
  });
  if (!metadata) return new Response('Not found', { status: 404 });
  try {
    await accessPet(user.id, metadata.petId);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  const file = await db.petMedia.findUniqueOrThrow({ where: { id } });
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mime,
      'Content-Disposition': `attachment; filename="pet-document.${file.mime === 'application/pdf' ? 'pdf' : file.mime === 'image/png' ? 'png' : file.mime === 'image/webp' ? 'webp' : 'jpg'}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
