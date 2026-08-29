# Catalog R&R — Roadmap to Launch

_Drafted 2026-07-22. Assumes solo, part-time effort (a few hours a day)._

## Where things stand today

The shared infrastructure is done: auth/sign-in, brand logo color extraction, brand profile, nav chrome, background layer, session persistence, and the full flow shell (bundles → design style → customize → catalogue → PDF export) all work end-to-end.

Only the **Monetary** bundle is fully wired with real content — it has 8 sample badges per style (Minimal / Premium / Fun & Playful, 24 SVGs total) and passes through customize and catalogue cleanly.

The other 7 bundle types (Non-Monetary, LSA, Feed Banner, Certificate, Teaser, Launch Mailer, Login Banner) are marked "Coming soon" and disabled in `bundles.html`. Most already have a platform preview mockup SVG in `Layout Mockup/`, but their `Samples/` folders are empty or placeholder-only — no real badge/creative assets exist yet, and none are wired into the `SAMPLE_OVERRIDES` / `BADGE_VARIANTS` maps in `design-style.html`, `customize.html`, or `catalogue.html`.

No hosting/deployment config (`wrangler.toml`, `package.json`) is currently committed — this is still a local prototype.

## Phase 1 — Non-Monetary and LSA (weeks 1–2)

These are the closest cousins to Monetary: same circular badge shape, same customize controls (background, pattern, font, color). Design ~6–8 sample creatives per style for each, drop them into `Samples/`, add `SAMPLE_OVERRIDES` and `BADGE_VARIANTS` entries, and remove `is-disabled` from their cards in `bundles.html`. Lowest-risk, fastest wins — good to do first and re-use as the template for the rest.

## Phase 2 — Feed Banner: new format support (weeks 3–4)

Feed Banner is the first non-badge (landscape/banner) format. This phase is bigger because `customize.html`'s controls, swatch logic, and mockup rendering are all built around the round badge shape — they need a second layout mode rather than a simple asset swap. Once this format support exists, it becomes reusable for Certificate, Teaser, Launch Mailer, and Login Banner, so treat this as building shared plumbing, not just one bundle.

## Phase 3 — Remaining banner/landscape bundles (weeks 5–8)

Certificate, Teaser, Launch Mailer, and Login Banner each get one week: design samples per style, wire `SAMPLE_OVERRIDES`/`BADGE_VARIANTS`, un-disable in `bundles.html`, spot-check the mockup swap and PDF caption rendering. These should move faster than Feed Banner since they reuse its new layout-mode work.

## Phase 4 — Cross-bundle QA pass (week 9)

Full click-through of all 8 bundles across the entire flow (bundle select → style → badge/gallery → customize → catalogue → PDF export). Check brand-color auto-contrast on new formats, print stylesheet behavior on wider layouts, and a responsive/cross-browser pass (the design log has been Chrome/desktop-centric so far).

## Phase 5 — Deployment setup (week 10)

Stand up real hosting (the `.wrangler` cache suggests Cloudflare Pages/Workers was the intended target — confirm and commit `wrangler.toml`), set up a build/deploy step, and smoke-test the hosted version against the local one.

## Phase 6 — Polish and launch prep (weeks 11–12)

Copy pass, empty/error states, final visual QA against brand guidelines, and a buffer week for whatever the QA pass in Phase 4 turns up.

## Summary timeline

| Phase | Work | Duration | Target dates (from Jul 22, 2026) |
|---|---|---|---|
| 1 | Non-Monetary + LSA | 2 weeks | Jul 22 – Aug 4 |
| 2 | Feed Banner (new format) | 2 weeks | Aug 5 – Aug 18 |
| 3 | Certificate, Teaser, Launch Mailer, Login Banner | 4 weeks | Aug 19 – Sep 15 |
| 4 | Cross-bundle QA | 1 week | Sep 16 – Sep 22 |
| 5 | Deployment setup | 1 week | Sep 23 – Sep 29 |
| 6 | Polish + buffer | 2 weeks | Sep 30 – Oct 13 |

**Total: ~12 weeks (~3 months) part-time, landing around mid-October 2026.**

This assumes design assets (the sample badges/creatives) are the pacing item, since that's the one piece of work in this project that isn't code and can't be sped up by working faster — only by having the design content ready sooner. If sample creatives for a bundle are ready in advance, that bundle's week can compress significantly.
