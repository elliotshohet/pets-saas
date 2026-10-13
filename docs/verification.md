# Verification

[← README](../README.md) · Updated October 8, 2026

This log separates completed checks from unverified paths. Results are bounded evidence, not a claim that every current working-tree edit has been tested.

## Core workflow checks

The core workflow polish was committed as `8ed4804`.

| Check                               | Evidence                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Unit tests                          | 7 passed: normalization, required fields, limits, calendar dates, future dates, timezone and age                     |
| PostgreSQL integration tests        | 2 passed: CRUD/persistence, scoped IDs, cascade deletion and invalid-input rejection                                 |
| ESLint and TypeScript               | Passed for the core changes                                                                                          |
| Production compilation              | Docker production build passed before Compose was switched to development mode                                       |
| Browser create/edit and persistence | Temporary pet and record created/edited; saved values confirmed after reload                                         |
| Validation feedback                 | Whitespace name rejected; other submitted input retained; error summary focused                                      |
| Combined filters                    | Pet/category/clinic/text filters returned the expected temporary record                                              |
| Delete cancellation                 | Keep it initially focused; Escape closed dialog and restored focus to Delete pet                                     |
| Deletion                            | Integration/mutation layer verified deletion and cascade; temporary browser QA rows removed with the database client |
| Empty search recovery               | No-matching-records state offered Clear filters                                                                      |
| Narrow form layout                  | No horizontal overflow in inspected narrow browser viewport                                                          |

These are manual browser checks and database tests, not an automated end-to-end browser suite. Browser-confirmed destructive deletion was not performed. Empty-workspace and unexpected-error paths were reviewed in code rather than induced against the populated database.

## Development container checks

Development configuration was committed as `e6cfde0`.

- Compose rebuilt and started the app without sudo using `sg docker` to activate existing Docker group membership.
- App and PostgreSQL healthchecks passed; the overview returned HTTP 200.
- Logs confirmed `next dev` with Turbopack; startup generated Prisma, found no pending migrations and skipped seeding the populated workspace.
- A temporary layout-text edit appeared in the already-open browser without navigation, manual reload or an image rebuild. Restoring the text also refreshed automatically.
- An initial hot-reload connection was blocked for `127.0.0.1`; the narrow local `allowedDevOrigins` configuration fixed it.
- Existing data remained: the observed workspace contained five pets and sixteen records. The normal seed dataset is four pets/sixteen records; counts change as users edit data.

## Historical setup evidence

Earlier checks exercised an empty database, seed reset and normal non-destructive seeding. These checks were not repeated on a fresh clone/database after the development-container switch. A production build is no longer part of Compose startup, although optional npm build/start scripts remain available.

## Current limits and submission

- Local medical-summary route, print button and styling are uncommitted work. They were not fully validated by this documentation audit and are not included in the pushed documentation changes.
- No physical printing/PDF export, physical mobile-device test, full accessibility audit, load test or new dependency-security audit was performed here.
- Dependency installation previously reported nine high-severity audit entries. This is historical output, not a current security assessment; no forced dependency upgrades were applied.
- Authentication, multi-user isolation, audit history and concurrency conflict detection are absent by design.
- No Loom link is stored in the repository. External recording, reviewer access and recruiter-submission status were not checked in this audit.

## Responsive layout audit (October 8)

- Inspected eight rendered routes: overview, pet directory, global medical history, new pet, record pet-picker, pet profile, pet edit and the local summary preview.
- Checked requested browser sizes 320x740, 390x844, 844x390, 768x1024 and 1280x900. The in-app browser reports smaller CSS viewport widths because of its display scaling; checks used the actual `innerWidth` rather than assuming the requested width. All 40 settled-page checks had no horizontal document overflow.
- Mobile Add record now sits in normal page flow rather than covering filter/record content. Added responsive heading scaling, long-text wrapping, flexible record/action rows, 44px link targets and compact viewport-bounded dialogs.
- Opened the delete dialog on mobile: Keep it had initial focus, both controls fit, and Escape canceled without changing data. Restored the default viewport after the audit.
- This is browser emulation and bounded visual inspection, not proof across all browsers, physical phones, software keyboards or accessibility settings. The responsive safeguards and this audit log are included in the responsive-layout commit.
