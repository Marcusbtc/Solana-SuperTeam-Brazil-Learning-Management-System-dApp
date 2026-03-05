# Sanity Workspace

This workspace provides the canonical CMS schema for Superteam Academy content.

## Quick start

```bash
cd onchain-academy/cms/sanity
npm install
npm run dev
```

## Required Studio env vars

- `SANITY_STUDIO_PROJECT_ID` (preferred)
- `SANITY_STUDIO_DATASET` (preferred)

The Studio also accepts `SANITY_PROJECT_ID` and `SANITY_DATASET` as fallback names.
API imports additionally require `SANITY_API_TOKEN` (or `SANITY_STUDIO_API_TOKEN` / `SANITY_TOKEN`).

Create a local env file before starting Studio:

```bash
cp .env.example .env
```

## Core documents

- `track`
- `course`
- `module`
- `lesson`
- `challenge`
- `instructor`
- `testimonial`
- `partnerLogo`
- `siteStat`

## Import Sample Courses

A five-course seed export is available at `seed/sample-courses-5.json`.

```bash
npm run cms:import-sample
```

Optional append mode:

```bash
npm run cms:import-sample:append
```

This import runs through Sanity Content API mutations (`createOrReplace`).
Use a non-production dataset for destructive import/replace operations.
