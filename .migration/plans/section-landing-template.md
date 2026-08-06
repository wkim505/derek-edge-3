I'll explore the repository structure to understand what's available before building a plan.Interesting — there's already partial work under `templates/section-landing` and `tools/packages/section-landing-template`. Let me understand the existing state before planning.Let me examine the existing template files and understand the project type (this is an xwalk/Universal Editor project).A lot of scaffolding already exists. Let me check the package's initial/policies files, the vault metadata, and the referenced blocks/models to assess completeness.The Bash call was blocked in plan mode. Let me check the vault metadata directory and referenced blocks/models with read-only tools.Both referenced blocks exist. The FileVault package is missing `META-INF/vault/filter.xml` and `properties.xml` (vault dir is empty), and `dist/` is empty (no built package). Let me verify the section model, section styles, and whether `light-grey` / `hero-quicklinks` model exist.Key discrepancies found. Let me verify the section styles CSS, component registration, and any existing spec.Let me check the section styles CSS and the migration template catalog to understand the intended template and reconcile discrepancies.Let me read the migration plan doc and check the section filter/model discrepancy more closely, plus whether there's a build script for the package.I have a clear picture now. There's substantial pre-existing scaffolding for a `section-landing` template, but I found several gaps and inconsistencies I need your input on before finalizing the plan.

Key findings:
- A template scaffold exists in **two** places (`templates/section-landing/` and a FileVault package under `tools/packages/`), but the FileVault package is **incomplete** (empty `META-INF/vault/`, empty `dist/`) so it can't be built/installed.
- The template's allowed-components policy lists `hero-quicklinks`, `cards-news`, `columns-promo`, but the site's actual section filter (`component-filters.json`) does **not** include them — they're out of sync.
- The "Related" section uses `style="light-grey"`, which is **not** a valid option (the section model only defines `highlight`, and the CSS only defines `.highlight`/`.light`) — so that grey background won't render.

Let me confirm a few decisions before writing the plan.I have enough to finalize the plan. Let me quickly confirm the drafts setup and the section style format so the plan is precise.# Section Landing Page Template — Implementation Plan

## Goal

Complete a **Section Landing** page template for this Edge Delivery / Universal Editor (xwalk) site so authors can create hub/landing pages from a consistent scaffold: a hero banner with overlay title, a short intro, a grid of image+text cards, and a related-links row. Finish the existing partial scaffolding, fix the inconsistencies found, and verify it renders locally.

**Scope confirmed:** Complete the template + verify locally with a draft page. No deployment or PR this round.

## Current State (from investigation)

Substantial scaffolding already exists but is **incomplete and internally inconsistent**:

- **Two copies of the template scaffold:**
  - `templates/section-landing/` — clean JCR (`.content.xml`, `initial/`, `policies/`)
  - `tools/packages/section-landing-template/` — a FileVault package copy of the same, but **`META-INF/vault/` is empty** (no `filter.xml`/`properties.xml`) and **`tools/packages/dist/` is empty**, so it cannot be built or installed as-is.
- **Template scaffolds 4 sections:** Hero (`hero-quicklinks`) → Intro (title + text) → Topic cards (`cards-news`) → Related (`cards-news`, styled `light-grey`). Both referenced blocks (`hero-quicklinks`, `cards-news`/`card`) exist and are registered in `component-definition.json`.
- **Inconsistency 1 — block filters out of sync:** The template `policies/.content.xml` allows `hero-quicklinks, cards-news, columns-promo` inside a section, but the live `component-filters.json` `section` filter does **not** include them. Authors can't actually add those blocks to a section today.
- **Inconsistency 2 — invalid section style:** The Related section uses `style="[light-grey]"`, but the section model (`models/_section.json`) only defines a `highlight` option, and `styles/styles.css` only styles `.section.light` / `.section.highlight`. The intended grey background won't render.

## Decisions (confirmed)

- **Section style:** Add a **new `light-grey`** style option (model + CSS) rather than reusing `highlight`.
- **Block filter:** **Add** `hero-quicklinks`, `cards-news`, and `columns-promo` to the section filter so authors can add them on any page, keeping the template policy and the global filter in sync.
- **Delivery:** Complete + verify locally only.

## Approach

1. Fix the source model/filter/CSS inconsistencies first (these are what the site actually renders from).
2. Regenerate the aggregated JSON via `npm run build:json`.
3. Reconcile the template scaffold to the corrected models (keep `templates/section-landing/` as the canonical source; complete the FileVault package so it's installable when deployment is wanted later).
4. Verify with a local draft page rendered against the dev server.

## Checklist

### 1. Fix section model + styles (site rendering source of truth)
- [ ] In `models/_section.json`, add a `light-grey` option to the `style` multiselect (alongside existing `highlight`)
- [ ] In `models/_section.json`, add `hero-quicklinks`, `cards-news`, `columns-promo` to the `section` filter's `components` array
- [ ] In `styles/styles.css`, add a `main .section.light-grey { … }` rule (grey background, matching padding pattern used by `.highlight`/`.light`)
- [ ] Run `npm run build:json` to regenerate `component-models.json`, `component-definition.json`, `component-filters.json`
- [ ] Verify the regenerated `component-filters.json` `section` filter now includes the three added blocks

### 2. Reconcile the template scaffold (`templates/section-landing/`)
- [ ] Confirm `policies/.content.xml` allowed-components list matches the updated section filter (trim/align any stray entries)
- [ ] Confirm `initial/.content.xml` Related section `style="[light-grey]"` now maps to the newly-defined style
- [ ] Sanity-check every `model=` / `resourceType=` / `modelFields=` in `initial/.content.xml` against the actual block models (`hero-quicklinks`, `cards-news`/`card`, `title`, `text`, `section`)

### 3. Complete the FileVault package (make it installable for later deploy)
- [ ] Create `tools/packages/section-landing-template/META-INF/vault/filter.xml` scoped to `/conf/derek-edge-3/settings/wcm/templates/section-landing` (owns only the template child, preserves sibling templates)
- [ ] Create `tools/packages/section-landing-template/META-INF/vault/properties.xml` (package group/name/version metadata)
- [ ] Ensure the package `jcr_root/**` template XML is byte-for-byte consistent with the corrected `templates/section-landing/` source
- [ ] Note: `dist/` (built `.zip`) is a build output — left empty until a build/deploy is requested

### 4. Verify locally
- [ ] Start dev server: `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` (background)
- [ ] Create a draft page `drafts/section-landing.plain.html` mirroring the 4-section structure (hero-quicklinks, intro, cards-news grid, light-grey related cards)
- [ ] Load the draft in the preview and inspect DOM/structure (snapshot) — confirm all 4 sections + both blocks decorate
- [ ] Verify the Related section actually gets the grey background (check the computed `background-color` on `.section.light-grey`)
- [ ] Run `npm run lint` (JS + CSS + xwalk model rules) and fix any issues

### 5. Wrap up
- [ ] Summarize what changed (model, filter, CSS, template scaffold, package metadata) and confirm the template is complete and renders correctly
- [ ] Note the remaining deploy/PR steps as a future option (not done this round)

## Out of Scope (this round)
- Pushing a branch, deploying to AEM author, registering the template in Allowed Templates, or opening a PR
- Building the actual `.zip` into `dist/`
- Cleaning up `migration-work/` scratch artifacts (tracked separately)

---
*This plan is ready. Execution (editing models, CSS, template XML, running builds/lint, and starting the dev server) requires switching to Execute mode.*
