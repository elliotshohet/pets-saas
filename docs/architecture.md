# Architecture notes

[← README](../README.md)

## Follow a save

| Step | Source                 | Responsibility                                              |
| ---- | ---------------------- | ----------------------------------------------------------- |
| 1    | `components/forms.tsx` | Bind pet/record IDs; track pending state and field errors.  |
| 2    | `app/actions.ts`       | Receive form data and retain submitted values on failure.   |
| 3    | `lib/validation.ts`    | Validate required fields, categories, lengths, and dates.   |
| 4    | `lib/mutations.ts`     | Convert calendar dates and scope writes to the correct pet. |
| 5    | `prisma/schema.prisma` | Enforce relations and persist data in PostgreSQL.           |
| 6    | `app/actions.ts`       | Revalidate the layout and redirect to the pet.              |

## Design decisions

- **Server Actions:** one mutation path without an internal REST layer.
- **Record scoping:** both record ID and pet ID constrain edits and deletes; this is not authentication.
- **Relational storage:** CUIDs identify rows; deleting a pet cascades to its records.
- **Dates:** calendar dates avoid time-of-day ambiguity; today uses the workspace timezone.
- **Filtering:** `/records` filters in PostgreSQL; the pet directory also filters in PostgreSQL; individual histories filter in memory.
- **Concurrency:** edits are last-write-wins, with no version-conflict detection.

The main improvement for larger datasets would be database filtering and pagination. Multi-user access would require authenticated ownership checks throughout.

## Seed lifecycle

Normal seeding preserves populated workspaces. `--reset` replaces all pets and records in one transaction and generates new CUIDs. The dataset contains four pets and sixteen records.

## Development runtime

Compose runs `next dev` on port 3017, not a compiled production server. The Docker image installs dependencies; a bind mount supplies repository source at `/app`. Anonymous volumes isolate container `node_modules` and `.next` from the host. The container runs as `node` (UID 1000 in the image); the source checkout must be writable for generated Next.js files. On hosts with a different UID, adjust permissions or the runtime user before starting.

Startup runs Prisma generation, migration deployment, and safe seeding before starting Next.js. The database uses its existing named volume. Applying an existing removal migration can delete retired fields/attachments; migration deployment is not a database backup.

Fast Refresh updates the browser as source changes. `allowedDevOrigins` permits the local `127.0.0.1` hostname; published app/database ports bind only to loopback. Ordinary edits do not need an image rebuild. Dependency or Dockerfile changes require rebuilding with `--renew-anon-volumes` so old dependency volumes are replaced. Schema changes need a migration plus Prisma generation/migration deployment.

## Schema boundaries

`Pet` has required name/species, optional breed/birth date/notes, generated ID and timestamps. `MedicalRecord` has required pet ID, category, title and calendar date, optional provider/notes, and generated ID/timestamps. Categories are CHECKUP, VACCINATION, MEDICATION, PROCEDURE and OTHER. The foreign key cascades pet deletion to records; a combined pet-ID/date index supports history queries. Required strings, length limits, supported species and date rules are validated by Zod; the database enforces non-null fields, categories and relationships.

No user ownership, attachments, follow-ups, vaccination-specific fields, or appointment-preparation entities remain in the schema. The local summary work reads existing pets and records and introduces no schema changes; it is not yet in the committed app.
