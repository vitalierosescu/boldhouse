# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # Start dev server at localhost:4000 (with HMR + ESLint)
yarn build      # Bundle to dist/main.js (UMD, not minified)
yarn lint       # ESLint with auto-fix on src/
```

No test suite. Verification is done by loading the Webflow site in-browser.

## Architecture

Single-entry Vite project: `src/main.js` → `dist/main.js`. The bundle is loaded into a live Webflow site via a custom code snippet (see README). In dev, Webflow loads from the local Vite HMR server; in production, from Vercel.

**Externals** (loaded by Webflow via CDN, not bundled): `gsap`, `barba`, `lenis`, `jquery`. GSAP plugins (`ScrollTrigger`, `SplitText`, `CustomEase`, `Draggable`, `InertiaPlugin`) are also CDN-loaded and registered globally at the top of `main.js`. In dev, a bundled npm `gsap` is used as fallback and both instances get `registerPlugin` called.

**Page transition model**: Barba.js drives all navigation. The lifecycle is:
- `once` → `initOnceFunctions()` (Lenis, button hover — runs once per session)
- `beforeEnter` → `initBeforeEnterFunctions()` (hero, theme)
- `afterEnter` → `initAfterEnterFunctions()` (everything else, dispatched by `data-barba-namespace`)

Page-specific init is gated by `data-barba-namespace` on the Barba container: `home` → `initHomePage()`, `club` → `initClubPage()`.

**Cleanup pattern**: Inits that attach window-level listeners or observers push a teardown function via `registerCleanup(fn)`. Barba's `afterLeave` hook drains this registry. ScrollTrigger instances are killed on `afterLeave` as well.

**Theme system**: `data-page-theme` on the Barba container drives nav and transition overlay theme. Sections with `data-nav-theme-to` trigger nav theme changes on scroll via ScrollTrigger.

**Utils**:
- `src/utils/breakpoints.js` — `BREAKPOINTS` constants and `MQ` strings for `gsap.matchMedia()`
- `src/utils/splitReveal.js` — reusable SplitText reveal; reads `data-split`, `data-split-reveal`, `data-stagger`, `data-duration` from the element; plays on scroll or immediately depending on whether `scrollTrigger` option is passed
- `src/utils/helpers.js` / `src/utils/index.js` — shared helpers

**Custom ease**: `'boldhouse'` (`.5,0,.05,1.01`) is set as `gsap.defaults` ease project-wide.

## Webflow data attributes (key conventions)

Animations and components are wired entirely via `data-*` attributes on Webflow elements — no JS class selectors for feature detection. Common ones: `data-hero`, `data-hero-heading`, `data-split`, `data-barba-namespace`, `data-page-theme`, `data-nav-theme-to`, `data-button-text`, `data-highlight-marker-reveal`, `data-stacking-cards-init`, `data-typo-scroll-init`, `data-parallax`, `data-overlap-slider-init`, `data-momentum-hover-init`.

## Dev notes

- Ad blockers and Brave Shield must be disabled on the Webflow preview domain during local dev.
- Does not work in Safari during local development (HMR/module limitation).
- `barba.init({ debug: true })` — set to `false` before production deploy.
- `dist/` is committed and deployed to Vercel. After `yarn build`, push to trigger auto-deploy.
