# ORBIT_SPEC.md — what Orbit is and how it maps onto Chromium

Source studied (read-only): `/Users/editor/Documents/dev/Orbit` (Electron + React + TypeScript + Tailwind v4, built with electron-vite; ~400 source files). Description: "A personal Arc-style browser for macOS." App id `com.songraphix.orbit`.

## Important finding

Orbit's UI is **not plain HTML/CSS/JS**. It is React/TSX, bundled by Vite, and talks to a main process through `window.orbit.invoke/on` (zod-validated IPC, SQLite persistence in main). Its "browser chrome" (sidebar, tab list, toolbar, command bar, popovers) is itself a React app drawn over Electron `WebContentsView`s. So:
- Pages like new tab/settings can be ported as WebUI only by bundling the React code (or rewriting) and replacing every `window.orbit.*` call with Chromium WebUI handlers (mojo / `chrome.send`).
- The sidebar-first chrome has no Chromium equivalent for the default frame: Chromium has a top tab strip. Chromium does have a **vertical tabs** mode and a side panel, which are the closest starting point for Phase 5.

## Branding — `BRANDING`

- Name: **Orbit** (productName), id `com.songraphix.orbit`. Company name is not in the project, so ask the user in Phase 1.
- Icons (copied to `orbit_assets/resources/`):
  - `resources/icon.png` (1024x1024 RGBA), `resources/icon.icns`, `resources/icon.svg` (planet with tilted ring on a violet-to-rose squircle; gradient `#22164F` → `#5B3BE8` → `#C04FD8` → `#FF7AA8`; planet `#FFFFFF` → `#ECE6FF` → `#B7A6FF`).
  - In-UI mark: `src/renderer/shell/OrbitMark.tsx`.
- Colours ("Quietly Alive" palette, `src/renderer/styles/tokens.css`):
  - ink `#0f1b24`, night `#0c1f26`, night-2 `#12303a`, mist `#e8eef1`, sky `#8db4d1`, sea-glass `#7cc4b5`, pearl `#f7f4ef`, sand `#dccdb5`, focus `#6cb8d9`
  - lines: `rgb(255 255 255 / .14)` (dark), `rgb(15 27 36 / .10)` (light)
  - Sidebar defaults: bg `rgb(27 21 48 / .62)` (translucent, macOS vibrancy), fg `#ece9f5`, muted `rgb(236 233 245 / .55)`, accent `#6fb3aa`, tile bg `rgb(255 255 255 / .08)`, hover `.06`, active row `.16`.
  - Default Space theme: dark, gradient `#2f6b70` → `#10262d`, intensity 0.7, grain 0.15. Each Space has its own gradient theme; text colour is picked for WCAG AA contrast (`src/shared/theme.ts`).
  - Text on accent fills: white.
- Fonts: **Comfortaa Variable** by default. Choices: SF Pro (system), SF Pro Rounded, Inter, Nunito, Manrope, New York (serif). All bundled via `@fontsource-variable` (OFL). Mono: `ui-monospace, 'SF Mono', Menlo`.
- Motion: ease-out `cubic-bezier(.22,1,.36,1)`, spring `cubic-bezier(.32,1.16,.6,1)`; durations hover 140ms, press 120ms, popover 190ms, panel 260ms, modal 280ms, layout 300ms.
- Thin, quiet rounded scrollbars (8px, no track, no arrows).
- Wallpapers (JPGs in `src/renderer/public/wallpapers/`): aurora-glass, cloud-terrace, cosmic-clouds, golden-valley, highland-tarn, misty-sunrise, sky-terrace, white-arches (+ `thumbs/`), plus layered gradient backgrounds in `internal/newtab/backgrounds.tsx`.

## Layout

All numbers from `src/shared/types/layout.ts` and `src/main/windows/layout.ts`. Look: floating rounded "islands" with a 10px inset and 16px corner radius over a Space-coloured canvas.

| Part | Position / behaviour | Class |
|---|---|---|
| Sidebar | Left island, 236px default (150–400, resizable), collapsible (⌘S), translucent vibrancy, traffic lights inside. Holds favorites grid, space header, pinned/today tabs, folders, bottom bar | NATIVE |
| Tab list | Vertical, in the sidebar (Arc style); optional tabs-on-top strip, 52px high | NATIVE |
| Toolbar row | 46–52px, over the page: Orbit menu, back/forward/reload, domain/title address display, page actions, extension icons, site-controls button | NATIVE |
| App rail | 60px island on far left with pinned apps | NATIVE |
| Page card | Rounded (16px) card holding the web view | NATIVE |
| Split view | 2 (up to 4) panes, 32px slim headers, draggable divider | NATIVE |
| Right dock | Notes / assistant / docked app, 380px (280–1000, wide 720) | NATIVE (could map to Chromium side panel) |
| Library mode | Nav 116px + panel 300px beside the page | NATIVE/WEBUI |
| Overlay layer | Command bar, popovers, create menu, profile menu, site controls, Peek, prompts, voice popup, capture/colour-pick layers, floating sidebar/rail | NATIVE (big) / WEBUI for contents |
| Little Orbit | Small floating window for links opened from other apps | NATIVE |
| Find bar, load-error card, focus pill, tooltips | Shell widgets | NATIVE |
| Bottom bar | Library button, Space switcher icons, "+" button | NATIVE |

## Pages

- **New tab / Homepage** (`orbit://newtab`, `internal/newtab/`): full-bleed wallpaper, large clock + greeting + date, frosted search box (focused on open), Customize panel (wallpapers or own image), shortcut tiles, dock, and a widget grid (s/m/l sizes). Widgets: today, focus, projects, notes, recent, weather, countdown, clocks, stopwatch, palette, quote, apps, spaces, ask, drive. `WEBUI`
- **Settings** (`internal/SettingsPage.tsx` + `settings/`): Account, Appearance (font, theme, density), Apps, Voice, Drive. `WEBUI` (but many Chromium settings already exist; port Appearance first, `SKIP` the rest unless wanted)
- **Archive** (`ArchivePage.tsx`): archived tabs, searchable/restorable. `WEBUI`
- **Library sections**: Media, Downloads, Easels, Spaces, Boosts, Archived Tabs. `WEBUI` (Downloads `SKIP`, Chromium has it)
- Other internal pages: assistant, boost editor, clipboard, easel, focus, notes, sounds, toolkit, work, media popout, blocked-site page (`orbit://blocked/…`). `WEBUI`
- History: Chromium's own. `SKIP`.

## Features (one line each)

Classification keys: B=BRANDING, W=WEBUI, N=NATIVE, S=SKIP.

- Sidebar shell, collapsible, resizable, vibrancy — N
- Favorites grid with badges (3-column tiles) — N
- Spaces: icon, name, per-Space gradient theme, grain, light/dark — N (+ theme data W)
- Per-Space profiles (separate cookies/logins) — N (maps to Chromium profiles; hard)
- Pinned tabs vs Today tabs; "New Tab" row — N
- Folders / grouped sections — N (Chromium tab groups are the nearest)
- Space context menu; "+" create menu — N
- Clear (archive today tabs) and Tidy (AI grouping) — N + W
- Auto-archive and sleeping tabs — N (Chromium has memory saver/discarding: S where possible)
- Archive — W
- Sidebar mini media player, pop-out — N (Chromium has global media controls: S candidate)
- Downloads shelf — N (S: Chromium downloads bubble)
- Library — W
- Command bar (⌘T): tabs, history, web search, commands — N (omnibox is closest; S candidate)
- Site controls popover (share, boost, screenshot, extensions, per-site settings, Secure badge) — N (Chromium page info exists)
- Split view — N (Chromium has split view in recent versions: check)
- Compact toolbar — N
- Peek (link preview in floating window) — N
- Little Orbit window — N
- Swipe between Spaces — N
- Arc importer — S (Orbit-specific one-off)
- Boosts (per-site CSS/JS, fonts, zap) — N + W (could be extension-like)
- Easels (freeform canvas) — W
- Notes, floating notes, Quick Note — W
- Focus mode (timer, sounds, site blocking) — W + N
- Clipboard history — W
- Toolkit (JSON viewer, local servers, image info) — W
- Work/projects/tasks, GitHub, Google Drive integrations — W (needs OAuth work)
- AI assistant (Anthropic SDK), Tidy, page reader, browser tools — W + backend (needs API-key store)
- Voice push-to-talk (local speech-to-text, ⇧⌘Space, wake word) — W + native (big)
- Screenshot/capture, colour picker — N
- Extensions (electron-chrome-extensions, Chrome Web Store) — S (Chromium supports natively)
- Cloud account/sync (Firebase, Google sign-in) — S for now (rule 8: do not port sign-in workarounds)
- Backup/archive export, SQLite persistence — S (Chromium profile storage); app data would need new storage
- Native menu bar (App, File, Edit, View, Spaces, Tabs, Archive, Extensions, Window, Help) — N
- Browser plumbing: context menus, find, zoom, print, fullscreen, popups, HTTP auth, cert errors, permissions, crash recovery — S (Chromium)
- Default-browser handling, HTML file association — S (Chromium)
- Electron-only items (IPC contract, preloads, window manager, layout engine, electron-builder) — S

## Phase-relevant summary

- BRANDING (Phase 1): name Orbit, icon set from `icon.png` (1024) / `icon.icns`, company TBD.
- Colours (Phase 2): palette above; note Orbit's colours are per-Space and translucent, so Phase 2 should apply the default dark theme (`#2f6b70`→`#10262d`, ink/night/mist tones) and a light variant derived from mist/pearl.
- WEBUI (Phases 3–4): New tab first. Source is React/TSX (~2,700 lines for newtab + dock + widgets), so Phase 3 needs a decision on bundling React vs. rewriting in vanilla/Lit. Orbit-only data (weather, Drive, tasks) needs handlers or gets dropped.
- NATIVE (Phase 5): sidebar/vertical tabs, spaces, command bar, toolbar are large; each needs a size estimate first.

## Assets copied (reference only) to `~/dev/chromium/orbit_assets/`

`src/renderer/{internal,styles,ui,profile,tooltip,public}`, `src/shared`, `resources/icon.*`, `package.json`. Orbit's own folder was not modified.
