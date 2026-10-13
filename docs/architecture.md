# Architecture

[README](../README.md) · [Development](development.md)

## Routes and layouts

| Route                                             | Access              | Purpose                                                                                                                                                                                    |
| ------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                               | Public              | Branded landing page and login/signup links.                                                                                                                                               |
| `/sign-in`, `/sign-up`                            | Public              | Branded email/password forms.                                                                                                                                                              |
| `/api/auth/[...all]`                              | Better Auth         | Signup, login, logout and session endpoints.                                                                                                                                               |
| `/dashboard`, `/pets`, `/records` and child pages | Authenticated owner | Unified My pets workspace at /dashboard with totals, reminders, pet search and medical history. /pets and /records redirect here with filters preserved; child CRUD URLs remain available. |
| `/admin`, `/admin/accounts/[id]`                  | Administrator       | Separate admin layout/navigation, metrics, identified account directory and account care histories with admin CRUD.                                                                        |

`app/(workspace)` and `app/(admin)` are sibling route groups. Group names do not appear in URLs. `/admin` is outside the member layout. Admin navigation stays within `/admin`: overview, `/admin/accounts` for the searchable directory, and `/admin/care` for care coverage and monthly statistics.

## Access control

Better Auth manages password hashing and PostgreSQL sessions. Signup requires name/email and a 12–128 character password; new accounts start empty. Session cookies are HttpOnly/SameSite, Secure under HTTPS, and expire after eight hours without session refresh. Cookie caching is disabled; protected requests validate the database session. Only the configured origin is trusted; auth rate limits are database-backed.

`proxy.ts` performs an early cookie-presence redirect and sets private cache headers. It is not the authorization boundary. `lib/session.ts` validates sessions; `lib/admin-access.ts` checks current database roles. Role and synthetic flags cannot be set through signup.

Member queries use `lib/owned-db.ts`; member writes use `lib/mutations.ts`. Counts, search, pickers, detail reads and actions constrain ownership. Actions derive the user from the session, ignoring submitted owner IDs. Record creation verifies ownership of its parent pet. Foreign and missing IDs produce equivalent not-found responses.

Admin loaders in `lib/admin-data.ts` check the role before cross-account reads. They expose names, email addresses, pet fields and medical history to administrators. Credentials and session tokens are never part of these views. Admin account pages provide pet/record CRUD through dedicated role-checked actions; member mutation endpoints still enforce ownership. Protected content is kept out of shared caches. Operational errors omit record contents and auth secrets.

## Data model

| Model                                             | Responsibility                                                                         |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `User`                                            | Identity, USER/ADMIN role, synthetic flag, random analytics identifier and timestamps. |
| `Account`, `Session`, `Verification`, `RateLimit` | Better Auth credentials, sessions and supporting state.                                |
| `Pet`                                             | Required indexed `ownerId`, name/species, optional breed/birth date/notes.             |
| `MedicalRecord`                                   | Parent pet, category/title/date, optional clinic/provider and notes.                   |

Medical records inherit ownership through pets. Deleting a pet cascades to records. Calendar dates use PostgreSQL DATE; validation uses America/Los_Angeles for today. Categories are CHECKUP, VACCINATION, MEDICATION, PROCEDURE and OTHER. Pet and record IDs are CUIDs. Admin links retain stable analytics UUIDs for compatibility; displayed identities are not anonymous.

See [the database guide](database.md) for all columns, indexes, relationships and inspection commands.

## Saving a record

1. `components/forms.tsx` tracks pending state and validation feedback.
2. `app/actions.ts` validates the session and passes trusted identity to the mutation layer.
3. `lib/validation.ts` validates required fields, lengths, categories and calendar dates.
4. `lib/mutations.ts` checks ownership and persists through Prisma/PostgreSQL.
5. The action revalidates affected pages and redirects. Failed forms retain allowed input values; passwords are never returned.

## Admin metrics

Totals, species/category distributions and monthly trends come from database rows. Profile adoption counts accounts with a pet; care activation counts accounts with a record. Care coverage counts pets with records. Recording accounts added records in the last 30 days. Return rate compares recording accounts across consecutive 30-day windows. A zero-size prior cohort yields no rate. Monthly trends use UTC and the current month is partial.

Activity uses record creation timestamps, not clinical visit dates or logins. Onboarding is a current cumulative snapshot, not tracked conversion events. No revenue or fabricated login metrics are shown. Counts are displayed without anonymization or small-cohort suppression.

## Forecasts

The admin overview forecasts new accounts and records added over the next 30 days. `lib/forecast.ts` uses eight complete trailing UTC weeks, excluding today. The latest four weeks receive weights 1–4; their weighted average is scaled by 30/7. Lowest/highest weekly counts over the full window provide pace scenarios, not confidence intervals. Forecasts require at least 56 days of stored history and 20 observed events. Recent versus previous four-week changes are descriptive; growth is not extrapolated. Synthetic accounts are included and clearly labeled as demonstration data. This is a deterministic statistical estimate with no AI service or clinical predictions.

## Boundaries

Edits are last-write-wins. Individual pet histories are filtered in memory; larger histories would need database filtering/pagination. There is no sharing, clinic role, audit trail, conflict detection, email verification, recovery, MFA or social login. This local fictional-data prototype is not a deployment readiness assessment for human health data.

The seed and migration lifecycle is documented in [development](development.md). AI assistance is described in [AI use](ai-use.md).

## Operational tabs

- `/admin/onboarding`: current account stages and median hours from signup to the earliest surviving record. Synthetic histories are included; this is not an event conversion funnel.
- `/admin/data-quality`: missing optional birthdays/clinics, duplicate groups (same pet, normalized title, date and category), and clinical dates before birth or after today. Suggestions never change data automatically.
- `/admin/activity`: latest 100 events, optionally filtered by type. `OperationalEvent` stores fixed event kind, optional actor ID and timestamp. UI shows kind/time only. Tracking begins with this feature, without seed backfill.
- `/admin/system-health`: live database probe/query timing and 24-hour auth/error event counts. Zero counts do not prove absence of errors. Database outages can prevent the admin session from loading.

Successful member mutations and browser auth endpoints emit events. Unexpected mutation/auth errors are tracked without contents, credentials or tokens. Tracking is best-effort, not transactionally guaranteed or tamper-proof; direct database writes, seed provisioning and all rendering/process failures are not covered. Events persist without automatic retention cleanup in this local prototype. Operational tabs are read-only and require the current admin role. Mobile admin navigation scrolls horizontally to keep all seven destinations reachable.

## Administrator account CRUD

Account details provide Add/Edit/Delete for pets and medical records. The shared forms call dedicated `app/admin-actions.ts` Server Actions. Each action validates the current session/admin role; `lib/admin-mutations.ts` rechecks the role, resolves the selected account's analytics identifier server-side, and constrains pets to that owner and records to that pet. Submitted owner IDs are ignored. Deletes require explicit confirmation and pet deletion cascades to records. Mutations and administrator-actor events commit in one transaction; events never contain medical text. Success redirects back to account details and invalidates shared layouts so owners and analytics see updates. Editing identities, passwords and roles is outside this feature.

## Care organizer

`lib/care.ts` centralizes pet access, file normalization, care edits and reminder status. File/photo/calendar handlers validate the session and owner/admin access and return private/no-store responses. `PetMedia` holds file bytes in PostgreSQL; seed photos are public illustrative assets, not private uploads. Images have decoded-pixel/byte limits. Profile photos are normalized and metadata is stripped; document PDFs/images retain original bytes and download as attachments. Record attachments verify the parent pet. Shared care forms use Server Actions with a 12 MB request ceiling and lower per-file limits.

Care tasks use user-entered calendar dates, IANA timezones and optional day recurrence; no clinical schedules are inferred. Completion locks the task row and compares the submitted schedule date before advancing recurrence, so retries are idempotent. Summaries include only the authorized pet's chosen records. Weight chart x positions reflect calendar dates. Email/push delivery, calendar subscriptions and notification jobs are not implemented.
