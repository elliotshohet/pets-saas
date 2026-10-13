# Pets Dashboard

A local app for pet profiles, medical history, private accounts, and product administration. Built with Next.js 16, React 19, TypeScript, Better Auth, Prisma 7, and PostgreSQL 18. Use fictional records.

## Pricing

Pets is **free for life**: $0, no subscription and no credit card required. All current features are included. Upload size and file-count limits still apply.

## Start with Docker

You need Docker and Docker Compose. Check that `docker info` and `docker compose version` work first.

1. Clone the repository and create your private configuration:

   ```sh
   git clone https://github.com/elliotshohet/pets-dashboard.git
   cd pets-dashboard
   cp .env.example .env
   chmod 600 .env
   ```

2. Generate an auth secret with `openssl rand -hex 32`. Paste it into `BETTER_AUTH_SECRET` in `.env`. Set `DEMO_PASSWORD` to a private password of 12–128 characters. Keep `ADMIN_EMAIL` equal to `DEMO_EMAIL` to enable admin access for the demo account. Do not commit `.env`.

3. Start the app:

   ```sh
   docker compose up -d --build --wait
   ```

4. Open [the app](http://127.0.0.1:3017) and sign in using `DEMO_EMAIL` and `DEMO_PASSWORD` from `.env`.

When `LOCAL_EMAIL_LOGIN=true` in development, enter any email without a password or name to open that account; new emails start empty workspaces. Email ownership is not verified, including for the admin email. This local demo mode is disabled in production.

Use the address configured in `BETTER_AUTH_URL` consistently: authentication trusts that origin. Startup applies migrations, provisions the demo account, and seeds data. The app runs in development mode with Fast Refresh. No host Node.js installation is needed for this path.

## LAN access

Set `BETTER_AUTH_URL` in `.env` to `http://<this-computer-LAN-IP>:3017`, then run `docker compose up -d --wait app`. Open that same URL on devices connected to your LAN. The current host address is `http://192.168.0.82:3017`; DHCP may change it. The development asset origin follows `BETTER_AUTH_URL`.

With `LOCAL_EMAIL_LOGIN=true` in development, LAN access accepts an email alone and creates an empty account if it does not exist. Emails are not verified; anyone on the LAN can open any account by entering its email, including admin accounts. Credential prefill remains disabled at a LAN auth URL. PostgreSQL remains accessible only from this computer.

## Try it

The public landing page at `/` introduces Pets and links to login/signup. Successful authentication opens `/dashboard`.

- **Overview (`/dashboard`)**: your pets, record totals, and recent care.
- **My pets (`/pets`)**: search, create, edit, and delete pet profiles.
- **Medical history (`/records`)**: search and filter records by pet, category, clinic, and dates.
- **Sign up (`/sign-up`)**: create a new empty private workspace.
- **Admin (`/admin`)**: separate administrator navigation, product metrics, account search by name/email, and account care histories with administrator CRUD. Members cannot access it.

Administrators can see account names, emails, pet profiles and medical records. These views are not anonymized. Ordinary members see only their own records; admins manage another account through dedicated admin actions; member actions still enforce ownership.

## Administrator access

Sign in at [the login page](http://127.0.0.1:3017/sign-in), then open [the admin dashboard](http://127.0.0.1:3017/admin) directly. The user sidebar has no admin link. Admin navigation contains Dashboard, Accounts, Care statistics, Onboarding, Data quality, Activity and System health. Operational activity starts when tracking is installed; seed history is not backfilled.

The admin demo credentials are `DEMO_EMAIL` and `DEMO_PASSWORD` in your private `.env`; `ADMIN_EMAIL` must match the demo email at setup. This workspace's actual login is recorded in [the local credential note](docs/local-admin.md), which is ignored by Git and is not included in fresh clones. New installations choose credentials during setup. Local development can prefill the login form; production does not.

## Care organizer

Open a pet, then choose **Care organizer** for profile photos, private record documents, microchip/allergy/emergency details, prescribed medications, reminders and weight/observation logs. **Care summary** lets you select records and print/save a PDF. Dashboard reminders and calendar export help track user-entered schedules; email/push notifications are not enabled. See [the care workflow](docs/development.md#photos-documents-and-care-organizer).

## Seed data

The demo workspace starts with Maple, Milo, Clover and Mochi: **4 pets and 16 records**. An additional **1,000 fictional member accounts, 1,369 pets and 7,367 records** populate analytics. A fresh seed therefore has 1,001 accounts, 1,373 pets and 7,383 records. Counts change as you use the app.

Synthetic addresses use `example.test`. Each synthetic account has an independently generated password hash; there is no shared login password or fabricated session activity. Repeated startup preserves credentials and populated workspaces. Changing `DEMO_PASSWORD` in `.env` does not change an existing account's password.

## Common commands

Run these from the repository folder:

| Task                             | Command                                                        |
| -------------------------------- | -------------------------------------------------------------- |
| Check service health             | `docker compose ps`                                            |
| Follow app logs                  | `docker compose logs -f app`                                   |
| Stop without losing data         | `docker compose stop`                                          |
| Start again                      | `docker compose up -d --wait`                                  |
| Rebuild after dependency changes | `docker compose up -d --build --renew-anon-volumes --wait app` |
| Run unit tests                   | `docker compose exec -T app npm test`                          |
| Run integration tests            | `docker compose exec -T app npm run test:integration`          |

The app listens on all network interfaces on port **3017** and PostgreSQL binds to localhost **55437**. Database data lives in the named `pets_data` volume. `docker compose down` preserves it; **`docker compose down -v` deletes it**.

## Documentation

- [Development and troubleshooting](docs/development.md): environment variables, native Node setup, migrations, seeds, checks.
- [Database and schema](docs/database.md): Prisma Studio, SQL inspection, connection details, tables and relationships.
- [Architecture](docs/architecture.md): routes, access control, models, metrics, and tradeoffs.
- [Verification](docs/verification.md): completed checks and remaining limitations.
- [MVP roadmap](docs/mvp-roadmap.md): competitor research and prioritized enhancement milestones.
- [AI use](docs/ai-use.md): how Codex assisted, what was verified, and runtime boundaries.

This is a local prototype. Email verification, password recovery, MFA, sharing, and clinic roles are not implemented. Real human health data requires a separate security and operational readiness plan.
