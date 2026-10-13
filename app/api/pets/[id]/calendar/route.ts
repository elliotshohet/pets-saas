import { requireUser } from '@/lib/session';
import { accessPet } from '@/lib/care';
import { db } from '@/lib/db';
import { calendarFile } from '@/lib/calendar';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  try {
    await accessPet(user.id, id);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  const tasks = await db.careTask.findMany({
    where: { petId: id, completedAt: null },
    orderBy: { dueDate: 'asc' },
  });
  return new Response(calendarFile(tasks), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pet-care.ics"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
