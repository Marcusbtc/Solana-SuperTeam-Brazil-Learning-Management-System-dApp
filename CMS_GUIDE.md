# CMS Guide

## Recommended CMS

Sanity is the canonical content source for courses and lessons.

Sanity workspace files are located at `onchain-academy/cms/sanity`.

## Content Model

- `Track`
- `Course`
- `Module`
- `Lesson`
- `Challenge`
- `Instructor`
- `Testimonial`
- `PartnerLogo`
- `SiteStat`

## Core Fields

### Course

- `slug`
- `title`
- `summary`
- `difficulty`
- `durationMinutes`
- `trackId`
- `xpTotal`
- `editorialStatus` (`draft` | `published`)
- `publishedAt`

### Lesson

- `title`
- `lessonType` (`content` | `challenge`)
- `contentFormat` (`reading` | `video`) for content lessons
- `body` (`Portable Text` editor with rich text, code blocks, images, and files)
- `markdown` (legacy fallback for compatibility)
- `starterCode`
- `language`
- `challenge` (required when `lessonType = challenge`)

## Backend Adapter Contract

The API layer (`onchain-academy/backend/src/lib/content-repository.ts`) maps Sanity documents into the frontend domain model:

- `GET /v1/courses`
- `GET /v1/courses/:slug`

Behavior:

- Dereferences `course -> modules -> lessons` references.
- Only returns courses marked as published (`editorialStatus == "published"`), while still supporting legacy documents with no workflow field.
- Converts portable text blocks into markdown so existing lesson rendering remains compatible.
- Falls back to local mock fixtures when Sanity is unreachable or empty.

## Workflow

1. Create/update course/module/lesson content in draft mode.
2. For content lessons, author rich content in the visual `body` editor (markdown-like rich blocks + code blocks + media uploads).
3. For challenge lessons, link a `Challenge` document and provide starter code/language metadata.
4. Set `editorialStatus = published` and (optionally) `publishedAt`.
5. Validate frontend route flow and lesson rendering in preview.

## Publish / Rollback Workflow

1. Author in `draft` and validate in Sanity Studio preview.
2. Set `editorialStatus = published` only when all modules and lessons are linked.
3. Verify in deployed preview:
   - `/courses`
   - `/courses/[slug]`
   - `/courses/[slug]/lessons/[id]`
4. To rollback quickly, set `editorialStatus` back to `draft` and republish document metadata.
5. Backend filter (`editorialStatus == "published"`) removes reverted content from API responses.

## Operational Validation Checklist

- Course has `slug`, `difficulty`, `durationMinutes`, `xpTotal`, and `track`.
- Course has at least one module and each module has at least one lesson.
- Challenge lessons include `challenge` reference plus starter code + language.
- Video lessons include `videoUrl`.
- Rich content is in `body` and legacy fallback in `markdown` (optional).

## Sample Course Import

A sample dataset for one complete course is included at:

- `onchain-academy/cms/sanity/seed/sample-course.ndjson`

Import it into your Sanity dataset:

```bash
npm run cms:import-sample
```

Notes:

- Default dataset is `production`. To target another dataset, update
  `onchain-academy/cms/sanity/.env` (`SANITY_STUDIO_DATASET`) before running.
- `--replace` is useful for clean smoke tests in a non-production dataset.
- After import, validate frontend route flow: `/courses` -> `/courses/[slug]` -> `/courses/[slug]/lessons/[id]`.

## Submission Mapping Notes

- Requirement matrix source of truth: `REQUIREMENTS_MATRIX.md`
- Deployment runbook: `VERCEL_DEPLOY.md`
- CMS-specific acceptance for submission:
  - Published courses appear in `/courses`
  - Draft courses remain hidden from API consumers
  - Course detail and lesson routes remain functional after content updates
