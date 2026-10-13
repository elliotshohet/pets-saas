# Development and troubleshooting

[README](../README.md) · [Architecture](architecture.md) · [Verification](verification.md)

## Configuration

Copy `.env.example` to `.env` once; do not overwrite an existing configuration.

| Variable             | Value or purpose                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Host PostgreSQL connection; example uses `127.0.0.1:55437`. Compose overrides it with the internal database hostname. |
| `BETTER_AUTH_URL`    | `http://127.0.0.1:3017`; the trusted app origin.                                                                      |
| `BETTER_AUTH_SECRET` | Random secret, at least 32 characters; generate with `openssl rand -hex 32`.                                          |
| `DEMO_EMAIL`         | Login for the seed workspace.                                                                                         |
| `DEMO_PASSWORD`      | Private password, 12–128 characters, used when the account is first created.                                          |
| `ADMIN_EMAIL`        | Set equal to `DEMO_EMAIL` to promote that demo account during setup; if omitted it defaults to the demo email.        |

Startup rejects missing required values and invalid secret/password lengths. `ADMIN_EMAIL` does not promote unrelated accounts and changing it does not revoke previously granted roles. There is no admin user-management UI.

## Email-only local demo

Set `LOCAL_EMAIL_LOGIN=true` in `.env` and recreate the app with `docker compose up -d --wait app`. Login and signup then ask for an email only. There is no password, name prompt, inbox verification, code or magic link. Any valid email opens its existing account; a new email creates an empty USER workspace with an automatically derived display name. Entering the demo administrator email grants that account's existing admin access. This deliberately allows impersonation; use fictional records only.

This mode is enabled only in development with `LOCAL_EMAIL_LOGIN=true`, including at the configured LAN auth URL. Production builds disable its endpoint and retain ordinary password authentication. Existing passwords/data are preserved; disabling the mode restores the normal forms. New email-only accounts have no password credential. Sessions, trusted origins, expiry and database-backed rate limits still apply. `scripts/check-local-email.ts` verifies the local HTTP flow.

## Local demo login

See [the local administrator credential note](local-admin.md) for this workspace’s actual login. This private, Git-ignored file is absent in fresh clones; use your own `.env` credentials there.

Set `DEMO_LOGIN_PREFILL=true` in your private `.env` to prefill the admin demo email/password on `/sign-in`. Click Sign in to open `/dashboard`; administrators open `/admin` directly. This deliberately sends demo credentials to the browser; enable it only for this local fictional-data demo. It requires development mode, a localhost auth URL and an existing ADMIN demo account. Production builds and signup forms never prefill credentials. Existing demo passwords are not reset; the configured password must still match the original one. After changing this setting, run `docker compose up -d --wait app` to reload container configuration.

## Docker workflow

Source is mounted at `/app`; saving code triggers Fast Refresh. The container runs as the unprivileged `node` user. Dependency and `.next` volumes are separate from the persistent PostgreSQL volume.

After dependency or Dockerfile changes:

```sh
docker compose up -d --build --renew-anon-volumes --wait app
```

After adding a schema migration:

```sh
docker compose exec -T app npm run db:setup
```

Restart the app to reload the generated Prisma client. For new migrations, use Prisma's migration workflow against a development database and review the SQL before applying it.

## Native Node.js workflow

Requires Node.js 22.12+ (24 recommended), npm, and PostgreSQL. Configure `.env` as above first.

```sh
npm ci
docker compose stop app
docker compose up -d --wait db
npm run db:setup
npm run dev
```

If you supply your own PostgreSQL database, set `DATABASE_URL` and skip the Compose commands. Open `http://127.0.0.1:3017`.

Optional production check: run `npm run build`, stop the development server, then run `npm start`. Compose normally runs `next dev`; image creation does not build the production app.

## View the database

Use [the database guide](database.md) for Docker/native Prisma Studio commands, PostgreSQL inspection, desktop connection settings and the full schema reference.

## Migrations and seeds

Use `db:setup` for both fresh databases and upgrades. It generates Prisma, applies the nullable ownership/auth migrations, provisions the demo account through Better Auth, assigns legacy unowned pets to that account, then enforces required ownership and seeds data. Pet IDs and medical-record links survive ownership migration. Registrants never receive legacy records automatically.

Do not use `db:migrate` alone for the initial authentication upgrade on populated databases. Some older removal migrations delete retired fields/attachments; back up needed data before upgrading.

Normal seeding skips an existing populated demo workspace. To replace only the demo's pets and records:

```sh
docker compose exec -T app npm run db:seed -- --reset
```

This is destructive for the demo workspace and generates new IDs. Other users and the synthetic community remain intact. To add missing synthetic accounts without resetting existing data:

```sh
docker compose exec -T app npm run db:seed:population
```

## Quality checks

```sh
docker compose exec -T app npm test
docker compose exec -T app npm run test:integration
docker compose exec -T app npm run lint
docker compose exec -T app npm run typecheck
docker compose exec -T app npm run format:check
docker compose exec -T app npm run build
docker compose exec -T app npm audit --omit=dev
```

Integration tests use the configured database, create temporary fixtures, and clean them up. Use a local development database. HTTP checks require the development server to be running:

```sh
docker compose exec -T app npm exec tsx -- scripts/check-admin.ts
docker compose exec -T app npm exec tsx -- scripts/check-actions.ts
```

`check-setup.ts` requires a disposable database named `pets_auth_setup_check` and refuses other database names. Do not point setup/reset checks at a database you need to preserve.

## Troubleshooting

| Problem                                    | Next step                                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Docker daemon permission denied            | Verify Docker is running and your session has Docker-group access; reopen the session after a group change. |
| App fails before starting                  | Read `docker compose logs app`; fill required `.env` values and check their lengths.                        |
| Sign-in origin rejected                    | Use the exact hostname/port in `BETTER_AUTH_URL`; default is `127.0.0.1:3017`.                              |
| Password changed in `.env` but login fails | Existing passwords are preserved. Use the password originally provisioned; recovery is not implemented.     |
| Admin page shows not found                 | Sign in with the configured demo admin. Members receive a not-found response.                               |
| Repeated auth requests are rejected        | Database-backed rate limiting is active; wait for the rate-limit window before retrying.                    |
| Dependencies seem stale                    | Rebuild with `--renew-anon-volumes`; do not delete the database volume.                                     |
| Generated files cannot be written          | The Docker `node` user is UID 1000; make the checkout writable by the runtime user.                         |
| Port already in use                        | Stop the competing server; native and Docker app servers cannot both occupy 3017.                           |

The dependency audit currently retains an unpatched lint-tooling advisory; see [verification](verification.md). Do not apply forced major downgrades suggested by npm audit.

## Photos, documents and care organizer

Run `npm run db:setup` (or rebuild/start Compose normally) to apply the care migrations and generate Prisma. Existing pet/record IDs remain intact. Seed setup fills missing demo/synthetic pet photos with bundled species illustrations, without changing existing uploads or histories. [Seed photo sources](../public/seed-pets/CREDITS.md) are bundled locally.

Open a pet and choose **Care organizer**:

1. Upload/preview/replace/remove a photo (JPEG/PNG/WebP, 5 MB). Server processing strips metadata, limits decoded pixels and resizes it.
2. Save microchip, allergies and emergency contact; enter structured prescribed medication name/dose/frequency.
3. Attach an original PDF/image to an existing medical record (10 MB, maximum 20 files per pet including the photo). Downloads require the owner's session or admin access. Document PDFs and validated images retain their original bytes and download as attachments; profile photos alone are normalized to JPEG and have metadata stripped.
4. Add explicit reminder dates, timezone and optional repeat interval. Complete or snooze a reminder. Repeating completion advances the next date; stale repeated requests do not advance it twice.
5. Download an all-day `.ics` calendar snapshot. Re-imports/changes depend on the calendar client; this is not a subscribed calendar feed. Stable task UIDs are preserved.
6. Add weight (kg) and observation logs. The chart uses actual calendar dates and shows the latest 60 entries. No clinical thresholds or diagnoses are inferred.
7. Open **Care summary**, choose records, and use **Print / Save PDF**. Original document names are listed and available for private download; original file contents are not embedded into the printable summary.

Upcoming/overdue reminders appear on the member dashboard. Notifications are in-app only; no email or push delivery is promised. Administrators can open an account pet's care organizer through its admin detail page. The uploaded files use PostgreSQL BYTEA rather than an external storage service, which keeps this prototype self-contained but increases database backup size.

HTTP verification: `docker compose exec -T app npm exec tsx -- scripts/check-care-http.ts`. Integration coverage includes upload validation, owner isolation, cascade cleanup, metadata stripping, calendar encoding, timezone status and idempotent recurring completion.
