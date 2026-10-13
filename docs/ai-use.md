# AI use in this project

[README](../README.md) · [Verification](verification.md)

OpenAI Codex assisted with this project's development through conversation and repository tools. The user set requirements, reviewed the running app, and directed changes. This note describes the work evidenced in the project conversation; it does not attribute every historical line of code to AI.

## Where AI assisted

- Local Docker/Compose setup, runtime troubleshooting and README instructions.
- Authentication planning and implementation: Better Auth, staged ownership migration, private workspaces and access-control tests.
- Public landing page: Novellia-inspired page structure, original Pets copy and a code-built fictional profile illustration.
- Interface changes: shared branding for auth pages, forms/navigation and the admin dashboard.
- Synthetic community generation: 1,000 fictional accounts, varied pet profiles and medical histories, chronological dates and idempotent seeding.
- Product analytics: metric definitions, account directory, admin access checks and read-only account views.
- Dependency review: npm audit investigation, targeted transitive overrides, compatibility checks and documentation of the unpatched lint dependency.
- Verification and documentation: unit/integration tests, direct HTTP/action checks, browser inspection, formatting/type/build checks and these guides.

Admin visibility changed during iteration: an earlier version used pseudonymous aliases and withheld small cohorts. The current version follows the user's later request to show identities and records to authorized administrators. Historical privacy-only assertions have been updated accordingly.

## How results were checked

Generated changes were checked against repository code and installed Next.js documentation. Checks included PostgreSQL-backed isolation and CRUD tests, session lifecycle/rate-limit tests, admin role checks, seed consistency/idempotency, HTTP responses, manual browser workflows, lint, TypeScript, formatting and production compilation. [Verification](verification.md) records evidence and limitations; passing checks are not proof of complete security or accessibility.

## Runtime and data boundaries

No AI model, API key, chatbot or AI service is used by the running application. Synthetic seed records are fictional fixtures, not actual customer or patient records. Authentication secrets are generated into ignored local configuration and are not published demo credentials. AI-authored changes still require human review before production use, especially for sensitive real-world data.
