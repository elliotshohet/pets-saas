# Verification

[README](../README.md) · [Development](development.md) · Updated October 13, 2026

This document describes completed local checks and their limits. The app uses fictional data. It is not a production security certification.

## Automated checks

| Check                        | Coverage                                                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests                   | Normalization, required fields, input limits, valid/future calendar dates, timezone and age.                                                                           |
| PostgreSQL integration tests | CRUD persistence, cascade deletion, ownership isolation, invalid input, session expiry/revocation, forged cookies and auth rate limits.                                |
| Admin integration tests      | Role enforcement, signup escalation prevention, identified directory/detail reads, forbidden member reads, growth ordering and synthetic seed consistency/idempotency. |
| `check-actions.ts`           | Direct Next.js Server Action calls with foreign IDs and anonymous/forged-cookie requests; records remain unchanged.                                                    |
| `check-admin.ts`             | Anonymous/member denial, live administrator access, name/email directory search, account detail and role revocation.                                                   |
| `check-setup.ts`             | Disposable-database setup, repeated startup, unchanged credentials/IDs and demo-only reset.                                                                            |
| Static/build checks          | ESLint, TypeScript, Prettier and production Next.js compilation.                                                                                                       |

Run commands are in [development](development.md). Latest run after the identified-admin update: 7 unit tests and 7 integration tests passed, as did lint, typecheck and production build. The obsolete small-cohort suppression test was removed. The admin HTTP check verified member denial, name/email search, identified detail responses and immediate role revocation. Browser inspection confirmed the separate admin navigation and an identified account with pet/medical history.

## Completed workflow evidence

- Browser checks exercised signup/empty workspace, login, pet creation/edit, record creation, refresh persistence, cross-account URL denial, logout and back/refresh after logout.
- Admin browser checks exercised navigation, directory search, detail views and computed database metrics. Earlier privacy checks applied to the previous anonymized design; current administrators are allowed to see names, emails and care histories.
- Responsive inspection covered the pet workspace at narrow/mobile/tablet/desktop sizes, with no horizontal overflow in the inspected settled pages. Delete cancellation, initial focus and Escape behavior were checked.
- Staged authentication migration preserved the original four pets, sixteen records and existing links in a populated database. Fresh setup and repeated startup were tested against a disposable database.
- Docker app/database healthchecks passed. Fast Refresh worked with mounted source; dependency rebuilds preserved the database volume.

Manual browser checks are not an automated end-to-end browser suite. Previous checks do not imply every later change was retested in every viewport.

## Dependency security

The October 13 update pins transitive `mysql2` to 3.24.6 and `deepmerge-ts` to 8.0.2 through npm overrides, synchronized with the lockfile. Lint, typecheck, all 15 tests, formatting and production build passed after that update. The rebuilt app was healthy and `/sign-in` returned HTTP 200.

At that checkpoint, `npm audit --omit=dev` reported **zero vulnerabilities**. Full audit retained **five high-severity entries** from one [unpatched braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) through Next.js ESLint → fast-glob → micromatch. Findings are not suppressed. Use trusted lint configuration and recheck upstream patches. `npm audit fix --force` proposes incompatible major downgrades; do not apply it blindly.

## Remaining limits

No full accessibility audit, physical-device suite, load test, independent penetration test or production deployment review has been completed. Operational events are not a comprehensive or tamper-proof audit trail, and edits have no conflict detection. Account recovery and email verification are unavailable. Admin access deliberately exposes identified records; member isolation remains enforced. A printable care summary is now available; physical printing/export rendering has not been independently audited, and no Loom recording link is stored in the repository.

## Public landing page

The branded landing page at `/` is public and uses only fictional illustrative content. Login/signup links open the auth forms; successful login opens `/dashboard`. The private overview moved there, while pet/record/admin URLs remain unchanged. Anonymous `/dashboard` requests redirect to sign-in. Lint, typecheck, production build and direct Server Action isolation checks passed. Browser inspection verified signup/login navigation and the new login redirect. The mobile layout was checked at 390px width; decorative overflow was corrected.

## Responsive admin and shared spacing (October 13)

Corrected inherited negative action margins in admin panels; added consistent panel gaps, wrapping button text, responsive filters/pagination and containment for wide tables/charts. Mobile navigation has three touch-friendly columns and retains sign-out access. Long account labels wrap, desktop sidebars scroll on short screens, and very narrow metric grids stack. Landing content no longer inherits workspace main padding.

Browser checks waited for loaded page headings: 44 checks across 11 routes at 320, 390, 768 and 1280px, plus 9 pet detail/edit/record-form checks at 320, 768 and 1280px. No document horizontal overflow was observed. Mobile admin account filters and table layout were inspected visually. Wide tables/charts scroll within their own containers. This is browser emulation, not a physical-device or exhaustive accessibility audit.

## Operational admin tabs

Onboarding, Data quality, Activity and System health were verified in the browser. Admin HTTP checks cover anonymous/member denial and successful loading for all admin routes. Eight integration tests pass, including event creation on successful writes, no successful delete event on a foreign-ID rejection, onboarding totals, quality queries and live database checks. The production build, lint, typecheck and formatting checks passed. A 390px system-health view had no page overflow. Tracking is best-effort from installation onward; historical seed activity is not backfilled.

## Single-account administrator CRUD

Dedicated admin account forms and actions support pet/record creation, editing and confirmed deletion. Nine integration tests pass, including member denial, selected-account ownership, foreign record rejection, ignored submitted owner IDs, role revocation, cascade deletion and actor events. Browser checks created a disposable pet/record and edited the record, returning to the account detail page each time. The fixture was deleted through the tested admin mutation helper; original demo data remained. The account view had no horizontal overflow at 390px. Lint, typecheck, formatting and production build passed.

## MVP milestones 1 and 2

Care migrations preserved existing pet/record IDs. Seed backfill assigned illustrative local photos to demo/synthetic pets; uploaded images are not replaced. Twelve unit tests and ten integration tests pass. New coverage includes calendar escaping/folding/timezone states, image validation/metadata stripping, file quota/cascade relations, member isolation, medication/task/log persistence and concurrent/stale recurring completion. HTTP checks verify private photo/document/calendar routes (owner 200, foreign 404, anonymous redirect) and selected-record summaries.

Browser verification uploaded a photo and document, created/completed a reminder and saved a weight observation, then refreshed to confirm persistence. Summary selection and the Print / Save PDF control were inspected. A disposable browser fixture was removed afterward, restoring the demo workspace. Care/summary layouts also passed six loaded-page checks at 320, 768 and 1280px, alongside the 390px inspection, without page overflow. Actual OS printing/PDF pagination and external calendar-client behavior were not audited. Notifications are in-app only.
