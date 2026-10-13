import { db } from './db';
export type EventKind =
  | 'pet.created'
  | 'pet.updated'
  | 'pet.deleted'
  | 'record.created'
  | 'record.updated'
  | 'record.deleted'
  | 'auth.signup'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failure'
  | 'auth.rate_limited'
  | 'app.error';
export async function trackEvent(kind: EventKind, actorId?: string) {
  try {
    await db.operationalEvent.create({ data: { kind, actorId } });
  } catch {
    console.error('Operational event tracking failed');
  }
}
