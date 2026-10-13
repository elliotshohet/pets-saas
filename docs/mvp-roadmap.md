# MVP enhancement plan

[README](../README.md) · Research date: October 13, 2026

## Product direction

Build an owner-first care organizer: **keep the pet's history together, know what is due, and bring a useful summary to the next visit**. Keep the current responsive web app rather than starting a native mobile app or clinic-management platform.

This recommendation is an inference from competitor feature overlap and the repository's current capabilities. Vendor pages document advertised features; this research did not test competitor apps or independently verify their performance, adoption or security claims.

## Competitor comparison

| Competitor                                                                                                                            | Advertised strengths                                                                                                | Implication for Pets                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [11pets](https://www.11pets.com/en/feature)                                                                                           | Medical records, medication/preventive-care reminders, caregiver sharing, measurements and calendar sync.           | Closest owner-oriented benchmark. Prioritize useful daily care and portable history.                 |
| [PetDesk](https://petdesk.com/veterinary-client-engagement-software)                                                                  | Pet-parent records, appointment requests, reminders and clinic communication within a practice engagement platform. | Clinic connectivity is valuable, but requires a different integration and partner model.             |
| [PetsApp](https://search.petsapp.com/)                                                                                                | Two-way messages, booking, payments and reminders with practice-system synchronization.                             | Avoid competing on clinic operations before there is a clinic partner and supported integration.     |
| [Digitail Pet Parent](https://help.digitail.io/en/articles/12601847-how-to-use-the-digitail-pet-parent-app-to-manage-your-pet-s-care) | Profile pictures, documents, visit summaries, preventive status, diary entries and clinic chat.                     | Photos, records and exportable care information can deliver a useful experience before integrations. |

The opportunity is straightforward record organization that works even when the owner's clinics use different systems. This is a positioning hypothesis to validate with owners, not a claim that competitors cannot do it.

## Current baseline and gaps

The app already has pet/record CRUD, search and filters, responsive layouts, owner-scoped member operations, account-level admin CRUD, operational tabs, and a simple forecasting demonstration. The seed contains 1,000 synthetic member accounts. Forecasts include synthetic histories and are not evidence of business traction.

At the research checkpoint, photos, documents, reminders and summaries were absent. Milestones 1 and 2 are now implemented: photos/uploads, private documents, structured care essentials, selectable printable summaries, in-app reminders/calendar exports and measurement logs. Household sharing and clinic integrations remain absent. Local email-only access deliberately opens any entered email's account; it remains a fictional-data demo behavior, not verified identity. Keep this mode for local demonstrations. Any external pilot needs a separately approved real login/recovery flow and restricted admin access.

## Milestone 1: Complete the record experience

1. **Pet photos:** upload, preview, replace and remove a profile photo. Supply licensed species-appropriate seed photos and attribution; do not imply they depict the fictional animal. Preserve owner/admin authorization, validate file contents/size, strip metadata and persist uploads independently of container rebuilds.
2. **Record documents:** attach PDFs and images to medical records with file type/size limits and private downloads. Let users view originals and add title/category/date manually. Include a source label such as owner-entered or clinic document.
3. **Care summary:** printable/downloadable history with pet essentials, recorded vaccinations, current medications and selected records. Let owners select what to include. Export only the authorized pet's data.
4. **Care essentials:** structured microchip, emergency contact, allergies and medication information. Allow unknown values rather than treating missing optional data as an error.

**Done when:** an owner can add a pet photo, attach a visit document, find it after reload/restart, and export a coherent summary on a phone. Cross-account file access fails; existing pet/record IDs survive migration.

## Milestone 2: Make the app useful between visits

1. Add user-entered vaccination/follow-up due dates and medication schedules. Do not infer clinical schedules from species or record titles.
2. Add a dashboard list of upcoming/overdue tasks, complete/snooze controls, and calendar export.
3. Add opt-in notifications once delivery infrastructure exists, including timezone handling, retry/deduplication and visible delivery failures. Start with in-app tasks and calendar export; do not promise email/push delivery before it works.
4. Add lightweight weight and observation logs with readable trends. No diagnoses or automatic treatment recommendations.

**Done when:** an owner can create, complete and snooze a task; overdue status uses the chosen timezone; retries never produce duplicate notifications. Charts accurately show entered measurements.

## Milestone 3: Share safely and reduce data entry

1. Household invitations with explicit owner/editor/viewer permissions and revocation. Do not use the local email-only account selector as proof of an invited person's identity.
2. Expiring, revocable read-only links for selected summaries; separate consent to include attachments. Log admin edits and shared-link changes with actor/target identifiers, excluding medical contents.
3. Optional document extraction into a draft: proposed fields retain links to source text and require user confirmation. Never overwrite confirmed records automatically. Evaluate accuracy before adding an AI/provider dependency.
4. Account data export and an explicit deletion/retention workflow, including uploaded files and operational-event identifiers.

**Done when:** revoked access stops on the next request; shared views expose only selected fields; extracted drafts never become confirmed records without review.

## Milestone 4: Validate the product and improve operations

1. Interview 5–10 owners about the last time they had to find/send a record or missed a care task. Observe the current workflow before deciding integrations or pricing.
2. After the external-pilot access work is approved, test with a small real-owner cohort. Separate synthetic accounts from real analytics by default.
3. Track actual activation events, first-document attachment, first export/share, reminder completion and 30-day returning owners. Keep event-based metrics distinct from current-state counts and record-creation activity.
4. Add bounded event retention, backup/restore verification, upload cleanup and monitoring coverage for background jobs and rendering/process failures. Establish auditable admin-change attribution without storing clinical text in logs.
5. Revisit forecasts only after enough non-synthetic history exists. Compare against a simple trailing-average baseline using held-out windows and publish forecast error, not merely predicted growth.

**Done when:** the team can explain whether owners complete the core workflow and return for a care task, distinguish seeded activity from real use, and restore a test backup successfully.

## Success measures

These are proposed pilot measures, not current results or externally validated targets:

- Activation: account adds a pet and one useful record/document within seven days.
- Time to first useful history: signup to first confirmed record/document.
- Utility: owners successfully retrieve a document or export/share a summary.
- Retention: activated owners return and perform a meaningful care action within 30 days.
- Reliability: successful upload/export/delivery rates; errors and duplicate notifications.

Record baseline values during the pilot before setting numerical targets. Do not use synthetic activity to calculate pilot success.

## Defer

Native apps, payments, a social/community feed, automated diagnosis, clinical risk predictions and broad practice-system integrations. Clinic booking/chat should follow a confirmed partner and a supported integration, not an interface that implies connectivity that does not exist.

**Recommended first implementation:** photos + private document attachments + a printable care summary. These complete a concrete owner workflow and reuse the existing account, pet and record foundation.
