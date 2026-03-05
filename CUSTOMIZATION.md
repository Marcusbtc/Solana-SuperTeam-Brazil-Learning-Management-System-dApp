# Customization Guide

## Theme Tokens

Primary UI tokens are in `onchain-academy/app/src/app/globals.css` and must be changed via CSS variables:

- `--surface-canvas`, `--surface-panel`, `--surface-elevated`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--brand-emerald`, `--brand-cyan`
- `--semantic-success`, `--semantic-warning`, `--semantic-error`

## Adding a Language

1. Add locale object in `onchain-academy/app/src/i18n/locales/`.
2. Register locale in `LocaleProvider`.
3. Add selector option in header language menu.
4. Keep route-level keys synchronized (`courses`, `lesson`, `leaderboard`, `settingsPage`).

## Gamification Extensions

- Add new badge definitions in backend seed and `/admin` policies.
- Extend `LearningProgressService` response models.
- Keep challenge and streak writes behind service interfaces.
- Public profile achievements are currently provided by `achievement-service` stub.
- Replace stub with on-chain receipt reads when achievement indexer is available.

## Backend Provider Swaps

- Keep API contracts stable (`/v1` routes).
- Replace implementation behind `credentials` and `leaderboard` services without changing frontend components.
- Optional credential collection filtering:
  - Backend: `CREDENTIAL_COLLECTIONS`
  - Frontend fallback: `NEXT_PUBLIC_CREDENTIAL_COLLECTIONS`

## Lesson UX Extension Points

- Editor pane size persistence key: `lesson-layout:<actor>`
- Per-lesson autosave keys:
  - `lesson:<actor>:<slug>:<lessonId>:draft`
  - `lesson:<actor>:<slug>:<lessonId>:state`

## Contract-Safe Extension Rules

- Do not break `LearningProgressService` method signatures when extending gamification logic.
- Keep backend stub response envelope stable (`status`, `pendingBackendSigner`, `requestId`) for signer-flow endpoints.
- If adding new leaderboard providers, preserve `/v1/leaderboard` response shape consumed by the frontend.
- For submission tracking and acceptance evidence, update `REQUIREMENTS_MATRIX.md`.
