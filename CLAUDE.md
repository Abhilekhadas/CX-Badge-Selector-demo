# CLAUDE.md

Project notes and session log for the Catalog R&R working directory.

## Session log

### 2026-05-15

**Files in directory:** `Interactive_Design_Catalogue_Playbook.html`, `bundles.html`, `landing.html`, `laptop-mock-up.svg`, plus `Reference/`, `MVP_Plan_Mode_Prompt_v2.md`, `color_code .png`. Created this `CLAUDE.md` during the session.

**bundles.html — bundle cards refactor:**
- Reduced card length in multiple passes: `.bundle min-height` 290 → 220 → 180; `.b-hero min-height` 116 → 72 → 56 → 68 (after adding icon); `.b-body` top padding 26 → 20 → 14.
- Added `.b-hero-icon` (52×52, radius 12, font-size 28) with one emoji per bundle (⭐ 💰 🏆 ✨ ✉️ 📢 📜 🔐).
- Icons left-aligned (`justify-content: flex-start`) and nudged downward via `transform: translateY(15%)`.
- Removed the per-bundle hover background tint on `.b-hero`.
- Switched icons to **monochrome by default**: gray bg `#EDEDEF` + `filter: grayscale(1)`. On `:hover` or `.selected`, the per-bundle color returns (filter removed, palette-specific background applied) with a 0.2s transition.
- Card title (`.b-body h3`) also color-shifts to the bundle's signature dark color on hover/selected (e.g. non-monetary → `#8A3700`, lsa → `#2E5E3A`).

**bundles.html — footer:**
- Replaced original footer (VC logo + copyright) with a UnitedUI-style row: `©Copyright VantageCircle.com All rights reserved. 2026` on the left (brand name as blue `#5B6CFF` link), `Privacy & Policy` and `Terms & Condition` links on the right (28px gap, hover-tint to brand blue).
- Later removed the white card chrome around `.foot-grid` (no background/border/radius) so it sits flat against the page gradient.

**bundles.html — Continue button wiring:**
- Replaced the `alert(...)` handler with navigation: builds `?selected=<comma-keys>` and routes to `design-style.html`.

**design-style.html — created from scratch:**
- Sibling page reusing the bg-orbs, nav, page-frame, stepper, panel-card styling from `bundles.html`. Stepper shows step 1 (Bundles) done, step 2 (Style) active.
- **8 tabs** in a horizontal strip, one per bundle. Tabs show icon + name + check (✓ green when answered).
- Filtered: only renders tabs for bundles in `?selected=`. Falls back to all 8 if no param. `progTotal` updates to match.
- Tab gap iterated: 6 → 20 → 36 px.
- Scrollbar iterations: visible thin → hidden → 3px tall, soft-gray thumb, 25% transparent track margins on each side (shorter visible thumb).
- Edge mask-image fade (32 px) on left/right so cropped tabs fade out instead of clipping sharply.
- `.tabs.centered` class added: when `< 7` active bundles, `justify-content: center` and edge mask disabled.
- **Questionnaire per tab**: bundle icon + name + description, then 3 large style cards — **Minimal** (gray with stacked bars), **Premium** (navy → indigo gradient + gold star), **Fun & Colorful** (warm gradient + sparkle/party emojis). Selecting one toggles a `.selected` outline + orange checkmark.
- **Footer buttons**: single primary "Next →" CTA. Disabled until current tab has a style picked. On the last tab, label switches to "Finish". A ghost "Back" button was added later — hidden on the first tab, visible on tabs 2+.
- Counter shows `X of N styles chosen`.

**laptop-mock-up.svg experiments (all reverted):**
- Tried wrapping the right-column VC platform mockup in a `.laptop-frame` (aspect-ratio 3000/2000) with the SVG as a background and the platform absolutely positioned inside the screen area (4.5% / 17% / 66% / 71%). Note: the SVG is ~1.4 MB (PNG embedded base64).
- Tried "remove everything and only keep the laptop" — stripped right column to just the SVG, then enlarged it by flipping the layout grid columns from `1.25fr 1fr` to `1fr 1.3fr`.
- Tried a full redesign: single-column layout, laptop centered on top (with platform inside), bundle cards in a horizontal scroll-snap strip below.
- All of these were reverted to the original 2-column layout. The current bundles.html does **not** contain any laptop frame code or horizontal-scroll bundle styles.

**Other:**
- Installed Claude Code status line via the statusline-setup agent (script: `~/.claude/statusline-command.sh`, settings in `~/.claude/settings.json`). Shows cwd, git branch, session name, model, and context% (yellow at 50%, red at 80%).

### 2026-05-19

**New folders added:** `Icons/` (per-bundle SVG icons), `Layout Mockup/` (full-page mockup SVGs/PNGs used by bundles.html and the upcoming style flow).

**bundles.html — icon tile background palette refresh:**
- `.b-hero-icon` default monochrome bg: `#EDEDEF` → `#fff9e7` (cream).
- Per-bundle hover/selected backgrounds reworked:
  - non-monetary: `#FFCDB8` → `#fff9e7`
  - monetary: `#FFE3A8` → `#fff0ea`
  - lsa: `#C5E7C8` → `#eaf7fe` (light blue)
  - teaser: `#D7CAEC` → `#fee1cc` (light peach)
  - launch-mailer: `#BFD3EC` → `#ffded9`
  - feed-banner: `#FFC299` → `#feebff`
  - certificate / login-banner: unchanged.

**bundles.html — "Add to bundle" pill on selected cards:**
- Selected-state label: "Added to bundle" → "Added".
- Selected-state pill bg: `var(--iron)` (dark gray) → `#2E8B57` (sea green) at `.bundle.selected .b-add-btn`.

**bundles.html — border thickness iterations (eventually reverted):**
- Tried `.bundle` border `1px` → `0.5px` → `0.25px`. Sub-pixel borders hit browser minimum of 1px on standard displays.
- Tried `box-shadow: inset 0 0 0 0.7px var(--cyan)` on `.bundle.selected` (with `border-color: transparent`) to bypass the sub-pixel rendering floor.
- All border-thinning changes reverted. Final: `.bundle { border: 1px solid var(--line); }` + `.bundle.selected { border-color: var(--cyan); box-shadow: 0 14px 30px rgba(255,109,5,0.15); }`.

**bundles.html — emoji icons replaced with SVG assets:**
- 8 cards' emoji glyphs replaced with `<img>` referencing `Icons/*.svg` (space in filenames URL-encoded as `%20`).
  - ⭐ → `Icons/Non-Monetary.svg`
  - 💰 → `Icons/Monetary.svg`
  - 🏆 → `Icons/LSA.svg`
  - ✨ → `Icons/Teaser.svg`
  - ✉️ → `Icons/Launch%20Mailer.svg`
  - 📢 → `Icons/Feed%20Banner.svg`
- Added `.b-hero-icon img { width: 32px; height: 32px; display: block; }` so SVGs sit centered in the 52×52 tile.
- Certificate and login-banner emoji still present (no SVG provided yet).

**bundles.html — right-side platform mockup replaced with single SVG:**
- The whole `.mockup-stage` block (live preview · Vantage Circle with topbar, sidebar, 6 scenes, hint paragraph, and per-bundle DOM updates) was replaced by `<div class="mockup-stage"><div class="layout-mockup"><img id="mockupImg" src="Layout%20Mockup/VC_page_mockup.svg"></div></div>`.
- JS calls that referenced removed elements (`brandName`, `medallionCo`, `certCo`, `mailerHead`, `sceneLabel`, `medallionTitle`, `mockupHint`) wrapped in null guards via a `setText(id, value)` helper and `if (el) ...` checks so the script no longer throws.
- Left-side `.bundles-card` got a brief `<div class="layout-mockup">` insertion above the header during one iteration; later removed when the mockup was moved to the right column instead.

**bundles.html — `.layout-mockup` CSS (left + right shared rule):**
```
.layout-mockup { margin: 0 0 20px; display: flex; justify-content: center; overflow: hidden; border-radius: 12px; }
.layout-mockup img { width: 100%; height: auto; display: block; border-radius: 12px; will-change: transform, opacity, filter; }
```
- `.mockup-stage` kept its prior sticky positioning (`position: sticky; top: 24px; align-self: start;`) so the SVG pins as you scroll.

**bundles.html — hover-to-swap mockup behavior:**
- Added `id="mockupImg"` to the right-side `<img>`.
- Added `mockupSrcByKey` map → on `mouseenter` of a bundle card, swap the SVG to the matching mockup; on `mouseleave` from the `#bundlesGrid`, revert to `DEFAULT_MOCKUP`.
- Per-bundle mockups currently wired:
  - `monetary` → `Layout Mockup/VC_page_monetary_mockup.svg`
  - `non-monetary` → `Layout Mockup/VC_page_Nonmonetary_mockup.svg`
  - `feed-banner` → `Layout Mockup/VC_page_feedbanner_mockup.svg`
- Other bundles fall back to `VC_page_mockup.svg`.

**bundles.html — mockup swap animation iterations:**
- 1) Opacity-only crossfade (0.25s ease, swap mid-fade).
- 2) Scale (0.97) + blur (6px) + opacity combo via a `.swapping` class — *reverted*.
- 3) Cut (no animation) — *user changed mind*.
- 4) Fade-in only (snap to opacity 0, animate to 1 over 0.28s).
- 5) Smart directional transition: tracks `prevMockupIdx`, slides new image in from above or below based on hovered card's index relative to previous, combined with scale (0.97→1) + blur (4px→0) + fade. Initially used 340ms/500ms/340ms durations.
- 6) Slowed to **600ms opacity / 850ms transform / 600ms filter** with `cubic-bezier(0.22, 0.9, 0.28, 1)` easing — this is the final timing.

**bundles.html — unified hover transitions across bundle cards:**
- `.bundle` transition: `all 0.25s ease` → `transform 0.85s cubic-bezier(0.22, 0.9, 0.28, 1), box-shadow 0.6s ease, border-color 0.6s ease`.
- `.b-hero-icon` transition moved from the (incorrect) `.b-hero-icon img` selector to `.b-hero-icon` itself: `background 0.6s ease, filter 0.6s ease`. Latent bug fixed — the prior selector never animated since `background` and `filter` live on the parent tile.
- `.bundle .b-body h3` transition: `color 0.2s ease` → `color 0.6s ease`. All bundle hover effects now ramp in/out over the same ~600ms window with the same easing as the mockup swap.

**design-style.html — major rebuild around badge selection:**
- Style picker still shown first (3 cards: Minimal / Premium / Fun & Colorful). Once picked, the questionnaire panel swaps to a **30-card badge gallery** for that bundle.
- `BADGE_VARIANTS` map: 6 thematic base entries per bundle (e.g., non-monetary: Top Star, Team Player, Innovator, Mentor, Quick Learner, Customer Hero) × 5 tiers (Roman numerals `I–V`) generated by `buildVariants(bundleKey)` for **30 variants per section**.
- Each badge card is multi-selectable: cyan border + animated check (`.badge-card.selected`). `badgeSelections[bundleKey] = Set<badgeId>`.
- Tab marked complete when `badgeSelections[key].size > 0` (was previously tied to style picked).
- `nextBtn` disabled unless the current bundle has ≥1 selected badge.
- "X of N styles chosen" counter now counts bundles with ≥1 selected badge.
- A "Change style" link in the badge gallery toolbar clears both `styles[key]` and `badgeSelections[key]` and returns to the picker.
- Toolbar shows a live "N selected" count pill (`.count-pill`).
- Badge preview rendered with three style classes (`.badge-preview.minimal/.premium/.fun`):
  - Minimal: gray bg, grayscale glyph, uppercase letter-spaced label.
  - Premium: navy radial gradient, gold serif italic label.
  - Fun: warm gradient (`#FFE3A8 → #FFCDB8 → #D7CAEC`), rotated glyph, bold label.

**design-style.html — heading made dynamic:**
- `<h1>Pick a <span class="accent">design style</span></h1>` → `<h1>Pick <span class="accent" id="headingAccent">design style</span></h1>` (dropped the "a" since bundle names are plural).
- New `renderHeading()` updates the accent text to `activeBundles[activeKey].name` on every render, so the heading reads "Pick *Non-Monetary Awards*" / "Pick *Monetary Awards*" / etc. based on the active tab.

**design-style.html — tab styling iterations:**
- Started from the existing pill-with-icon style (gap 36 px, scrollbar + mask-image edge fade).
- 1) Plain text nav (Image #18 reference): removed pill bg, removed icons, simple iron-colored text, cyan + 600 on active.
- 2) Icon-over-label card nav (Image #20 reference): white card container `border-radius: 22px`, vertical stack per tab (26px icon top, label bottom), grayscale icon → full color on active with `translateY(-1px) scale(1.06)`. Green ✓ moved to a corner badge.
- 3) Wide icon-over-label with `--cyan-soft` active pill, font 12px, completed tabs show the green ✓ with a 2px white outline — *reverted*.
- 4) **Final**: inline pill card nav (Image #22 reference):
  - `.tabs` is a `width: fit-content` white pill (`border-radius: 100px`), centered via a new `.tabs-wrap` flex container.
  - Inactive tabs: plain text, 15px / 500 / iron color.
  - Active tab: `--cyan-soft` pill bg, cyan text 600 weight, **bundle icon appears on the left**, and a circular **count badge** (`.tab-count.has-selections`) on the right shows # selected.
  - Completed non-active tabs: small green ✓ dot indicator only (`.tab.complete:not(.active) .tab-check`).
- `renderTabs()` now emits `<span class="tab-icon">`, label, `<span class="tab-count ...">N</span>`, and `<span class="tab-check">✓</span>`. Wrapped tabs in `<div class="tabs-wrap">...</div>` in markup.

**Asset notes (Layout Mockup/):**
- `VC_page_mockup.svg` — default state mockup (1440×1100). At one point this file went missing from the folder while only `VC_page_mockup.png` and the monetary SVG existed; both per-bundle SVGs and the default were reinstated later. PNG companions exist for each (`*-1.png`, `*-2.png`).
- All SVG paths in JS/HTML use `Layout%20Mockup/` (URL-encoded space) and `Icons/` for the bundle tile icons.

### 2026-07-08

**landing.html — sign-in form polish:**
- "Passkey" label → "Password" (placeholder, sr-only label, show/hide aria-label, error text — internal IDs like `passkeyInput` / `REQUIRED_PASSKEY` kept as-is).
- **Open catalogue** button: added `disabled` by default; `syncStartBtn()` enables it only when BOTH company name and password fields have non-empty content. Disabled state renders in grey (`#E4E4E7` bg / `#9CA3AF` text) rather than a dimmed orange.
- **Password eye toggle:** default icon flipped to the crossed-out (hidden) variant; new `.pk-toggle.is-hidden` class hides the whole toggle button until both fields have content — same condition as `syncStartBtn`.
- **Retry button** on wrong password: dashed pill under the error message, click clears error state + refocuses password. Auto-hides on next input.
- **Heading tweaks:** `h1 .accent` `font-style: italic` → `normal`; added `filter: saturate(1.2)` on the animated-gradient accent so "your brand" reads 20% more saturated. Font weight kept at 500.
- **Preview mockup lift:** iterated `translate(-50%, -20%)` → `-10%` → `-8%` → `-6%`. `introLaptop` keyframe's `to` state mirrors the resting transform each step.
- Removed the purple `preview-stage::before` glow entirely (kept the orange `::after`).

**signin.html — profile-creation form built out:**
- Widened `.auth-form` max-width 680 → 880 → 1040 px.
- Removed "Tell us your company name…" subtitle from `.form-head`; heading is just "Create your profile".
- Added three new fields to the form: **Website** (single URL), **Additional links** (dynamic list with `+ Add link` and per-row remove), **Brand documents** (multi-file drop zone, PDF/DOC/PPT/PNG/JPG, up to 8 MB each). All persisted through the existing `autoSave()` into `brand.website` / `brand.urls[]` / `brand.docs[]` (name/size/type/dataUrl).
- `.form-actions` centered as a group with `justify-content: center`; dropped `flex: 1` off the primary button; label "Sign in" → "Create".
- `.auth-stage` heading↔form gap tightened 28 → 26.6 → 22.6 px; `.form-head` shifted down 15% via `transform: translateY(15%)`.
- **Color extraction rewrite:** two-pass logic. Pass 1 keeps vibrant colors (sat ≥ 0.45); Pass 2 falls back to include neutrals so the result is ALWAYS 2–3 swatches. `MAX_COLORS = 3`. For Apollo-Tyres-style logos this returns `[purple, black]` reliably.
- **Auto-contrast text logic** (see "Color system" below): added `lightenHex`, `autoFgFor(bg)`, `generateBrandFgShades()`. Initial `state.fg` uses saved/last fg only when it actually contrasts against the current bg — stale near-black values baked in from earlier sessions are dropped in favor of `autoFgFor`.

**brand.html — repurposed as a profile view:**
- Heading changed from "Tell us about *your brand*, Vantage" (form) → "*Vantage* brand profile" (mirrors profile.html style). Accent shows the company name.
- Removed **Skip** / **Clear** buttons and the floating **Edit** pill; `.foot` contains only the primary "Save and continue →" now.
- Aligned the monetary darken constant to `0.35` (was `0.2`) so brand.monetaryAwardBg matches signin.html.
- Back-to-landing (`navBackLanding`) no longer nukes sessionStorage on ordinary click — reset is gated behind shift-click + `confirm()`.

**bundles.html — persistence + gated bundles:**
- **Selection state** now hydrates from `persisted.selectedBundles` on load (URL `?selected=` wins if both present), persists on every toggle via `writePersistedSelection`, and prunes any restored keys that point at disabled bundles. Continue click still emits `?selected=` for backward compat.
- **Monetary before Non-Monetary** in DOM order.
- **Disabled bundles**: `Non-Monetary`, `LSA`, `Feed Banner`, `Certificate`, `Teaser`, `Launch Mailer`, `Login Banner` all marked `.is-disabled` (50% opacity, grayscale, `pointer-events: none`, "Coming soon" pill top-right). Click/hover-swap handlers skip disabled cards.
- **Continue pill** z-index 50 → 1000 → 9999; background opacity 0.84 → 0.96 → fully opaque `#FFFFFF`; added `backdrop-filter: blur(6px)` so no text can bleed through.
- `.nav-links` gap 32 → 24 px (matched all other pages).

**design-style.html — cleanup:**
- Selected-bundles resolution order made explicit: URL `?selected=` → persisted `selectedBundles` → union of `styles`/`badgeSelections` keys → fallback to all bundles.
- `persistState()` **critical bug fix**: was writing `{ styles, badgeSelections, badgeNames, badgeCustomizations }` directly, silently wiping `brand`, `company`, `selectedBundles` and every other top-level field on every badge click. Now reads fresh + spreads (`{...fresh, styles, badgeSelections, ...}`).
- `VARIANTS_PER_BUNDLE` 30 → 8; badge grid filtered to variants that have a matching `SAMPLE_OVERRIDES` entry for the current style so empty purple cards no longer render.
- Shape chips (Circle / Hexagon): text labels removed, aria-labels added, only SVG icons visible.
- Monetary darken constant aligned to `0.35` in `applyBrandColors`.
- Auto-contrast text color: replaces hardcoded `#1F2125` / `#FFFFFF` fallback with `darkenHex(primary, 0.80)` / `lightenHex(primary, 0.85)` — keeps text within shades of the picked brand color.

**customize.html — big pass on state semantics + color rules:**
- **`customized: true` flag** is now the intentional-save marker: set only on explicit **Save and continue** click, or by `autoSave()` when the current state differs from `initialState` (snapshot taken at page hydration). autoSave no longer auto-adds to `badgeSelections` — opening the customize page can no longer create phantom "CUSTOM" cards in the catalogue.
- **`brand.monetaryAwardBg` / `brand.awardBg`** are no longer overwritten on per-badge save. They're set once at logo extraction and treated as the persistent brand default; per-badge tweaks live only in `badgeCustomizations[id].bg` now.
- **BG swatches** derive from `brandColors[0]`: monetary uses `[0.15, 0.30, 0.45, 0.60, 0.72, 0.85]` darken steps (light tint → very dark, all shades of primary). Fallback `DEFAULT_BG_SWATCHES` only when no brand color exists.
- **FG swatches (`FG_SWATCHES`)** now generated by `generateBrandFgShades()`: 3 light shades (`lightenHex(primary, 0.92 / 0.85 / 0.75)`) + 3 dark shades (`darkenHex(primary, 0.65 / 0.80 / 0.90)`).
- **Auto-contrast (`autoFgFor(bg)`):** `isDarkColor(bg) ? lightenHex(primary, 0.85) : darkenHex(primary, 0.80)`. Safety fallback to `#FFFFFF` / `#1F2125` if the derived shade still fails the light-vs-dark contrast check (primary is mid-tone).
- **`fgManuallySet`** tracks explicit user picks. Bg swatch / picker / hex handlers recompute `state.fg` only when `!fgManuallySet`. Reset button clears the flag. A stale saved fg is dropped if it doesn't contrast against the current bg.
- **`initialState` snapshot** captured after `state` init so autoSave can detect real diffs (any of text / bg / fg / fontFamily / fontSize / pattern) vs the initial `applyState()` call during page setup.
- `.mockup-badge` hardcoded `background: #29294C` → `transparent` so `state.bg` is the only thing painting it. `.badge-tile` fallback kept as neutral `#F0F1F3`.
- BG pattern section transform-lifted `translateY(-6%)` → `-16%` for tighter vertical rhythm.

**catalogue.html — full customization + PDF export:**
- **Filter relaxed:** shows every badge in `badgeSelections[bundleKey]`. Overrides applied when a `badgeCustomizations` entry exists; falls back to style default + brand tint otherwise. `bundlesWithPicks` mirrors the same rule. `isCustom` / `totalCustom` still gate on the strict `customized === true` flag.
- **Full customization rendered:** each `.badge-preview` inlines `background-color` + `background-image` (pattern from `getPatternCss(id)` — pattern registry ported from customize.html), `background-repeat: repeat`. `.badge-name` inlines `color`, `font-family`, `font-size` (scaled 50% for the smaller card).
- **Details caption** under each customized badge: Text / Font+size / Text color (swatch + hex) / Background (swatch + hex) / Pattern — captured in the PDF too.
- **Download as PDF button:** cyan pill at `bottom-right: 84px`, calls `window.print()`. New `@media print` stylesheet hides nav / footer / floating buttons / background layers, forces white body, `break-inside: avoid` on `.cat-bundle` and `.cat-badge`.
- **Back FAB** at bottom-left navigates to `design-style.html` with the current query string forwarded.
- **Brand-derived preview colors** now use `lightenHex` / `darkenHex` (matching customize.html's 0.80 / 0.85 amounts). Monetary section gets `data-bundle="monetary"` attribute + its own darker override.
- **`SAMPLE_OVERRIDES` synced** to the same 8-per-style map as design-style.html + customize.html. Earlier the catalogue's map still referenced Premium SVG files that no longer exist on disk (`Monetary_Premium_01/05/06/10/12–14/16–20.svg`), causing empty purple cards. Now Premium (02/03/04/07/08/09/11/15), Minimal (01/02/03/04/05/07/08/09), and Fun & Playful (01–08) — every path resolves to a real file.
- Added `applyBrandColors()` IIFE that injects `<style id="brand-theme">` — the catalogue no longer shows the hardcoded style presets.

**profile.html + shared nav profile chip (7 pages):**
- Nav profile chip (`#navProfile`) now fills the circular avatar with `brand.colors[0]` (extracted primary) and shows the text "Profile" — no more company-initial letter or embedded logo image.

**Background layer + global chrome:**
- `Background.svg` added as a fixed full-viewport layer under all content on every internal page (`.page-bg` with `<img>` inside). Animation: `pageBgDrift` 24s ease-in-out infinite alternate — subtle translate + scale, respects `prefers-reduced-motion`.
- Iterated opacity: 0.5 → 0.4 → 0.2 → 0.24.
- Bottom fade via `mask-image: linear-gradient(to bottom, #000 55%, transparent 92%)` so the dotted pattern dissolves at the bottom edge.
- **Stacking fix**: `.page-bg` `z-index: 0` → `-1`; body `background-color: #FFFFFF` → `transparent`; html gets `background-color: #FFFFFF`. Now the SVG pattern paints between the html white base and body content — no more bleed into panels/cards.
- `.bg-orbs` layer hidden via `display: none` on all 6 pages that had it. The old radial-gradient tints on body backgrounds also removed — all bodies are plain white.

**Global design-system fixes:**
- Every page now has a shared **`lightenHex(hex, amount)`** helper alongside `darkenHex` (mixes toward white by `amount`, mirrors darkenHex's signature). Files that got it: brand.html, customize.html, design-style.html, catalogue.html.
- Amounts consolidated: `FG_LIGHTEN_AMOUNT = 0.85`, `FG_DARKEN_AMOUNT = 0.80`, both defined in customize.html and inlined identically in catalogue / design-style previews.
- Body font: Lato added and applied globally via Google Fonts, then reverted the same session. Body stack back to the original `-apple-system, BlinkMacSystemFont, ...` chain.
- All heading `.accent` spans: briefly styled as a light-blue "pill" with a blue dot (reference: "Where teams and agents · Think · together"), then reverted. Original per-page accent styles restored (page-head cyan text, form-head cyan text, landing animated gradient).
- Nav gap standardized 24 px on all pages (was 32 on bundles + landing, now 24).
- Nav-links `align-items: center` added everywhere so the Profile pill and "How it works" text align vertically consistently.

**Persistence + reset gating (design-doc-level fix across the app):**
- **Every** `sessionStorage.setItem(PERSIST_KEY, ...)` write now uses read-fresh-then-spread — no more `{ x, y, z }` overwrites. Confirmed across bundles / brand / customize / design-style / catalogue / landing / signin / style / profile.
- **`console.warn`** on every catch block that touches sessionStorage — silent `catch {}` blocks that swallowed QuotaExceededError etc. are gone.
- **Reset gating:** signin.html + brand.html back-to-landing handlers now require `e.shiftKey` + `confirm('Start over? …')` before calling `sessionStorage.removeItem(PERSIST_KEY)`. Ordinary clicks navigate without nuking the session.

**"Coming soon" bundles + sample-file mapping:**
- Bundles that only Monetary is active for now; the rest are visibly disabled with a coming-soon pill.
- Monetary `SAMPLE_OVERRIDES` covers exactly the 8 files that exist in each style folder — updated in design-style.html, customize.html, catalogue.html. Fun & Playful style added with 8 mappings (Monetary_fun_01–08).

**customize.html — Monetary_fun_04 label position iterations:**
- Screenshot-driven micro-tweaks on the per-sample `.label-overlay` overrides for the blue-and-green rosette. Both surfaces (`.badge-tile` and `.mockup-badge`) shifted in lockstep.
- Sequence (badge-tile / mockup-badge): 67% / 59% → −7% → 60% / 52% → +5% → 65% / 57% → +10% → **75% / 67%** (final).
- Only customize.html has per-sample label positioning for this sample; design-style.html / catalogue.html only reference the SVG path, no override touched there.
