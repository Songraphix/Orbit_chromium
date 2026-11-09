# ORBIT_PROGRESS.md

## Phase 0 — done (2026-11-09)
- Orbit folder: `/Users/editor/Documents/dev/Orbit` (read only).
- Wrote `ORBIT_SPEC.md`; copied WEBUI reference files to `~/dev/chromium/orbit_assets/` (5.7MB).
- Added the three ORBIT_*.md files to `.git/info/exclude`.
- Added git remote `orbit` → https://github.com/Songraphix/Orbit_chromium.git (it is empty; nothing pushed).
- Problems: Orbit's UI is React/TSX with Electron IPC, not plain HTML; see spec "Important finding".
- Next: Phase 1 (branding). Need the company name from the user.

## Handoff from Orbit session (2026-11-09) — reconciled with ORBIT_PORT.md
- Goal: Google sign-in on third-party sites (claude.ai "Continue with Google") must work. Electron is blocked by Google ("browser or app may not be secure").
- Hard rule: never fake Chrome (UA/client hints/window.chrome). Consistent with ORBIT_PORT rule 8.
- Ordering change: SPIKE FIRST. Test stock Chromium (out/Default, v159.0.8153.0, unmodified) on claude.ai before any Phase 1+ work. Only proceed if it passes.
- Orbit side: 5 local commits not pushed (Google sign-in browser fix, Clipboard history tab). Orbit's own account sign-in uses system browser + PKCE (src/main/cloud/google-signin.ts) - not needed in Chromium.
- Porting candidates if spike passes: pure logic model.ts/policy.ts files (+tests), zod schemas; rebuild: IPC/persistence layer.
- Observed: `git status` shows 2 tracked files deleted in src (net/http/transport_security_state_static.json, third_party/hyphenation-patterns/src/en-US/ushyphex.tex). Not touched; need to ask user before restoring.
- Spike status: Chromium launched with throwaway profile /private/tmp/claude-502/orbit-spike-profile at https://claude.ai/login. Awaiting user to try "Continue with Google" and report.
- Spike RESULT: PASS. User signed in to claude.ai with Google on stock Chromium. Proceeding to Phase 1.
- Restored 2 accidentally-deleted tracked files (build failed without them).

## Phase 1 — Branding: done (2026-11-09)
- BRANDING: Orbit / Songraphix (company inferred from app id; change if wrong), bundle id com.songraphix.orbit.
- Icons from Orbit icon.png: mac/app.icns, mac/Assets.car (rebuilt with actool), AppIcon.appiconset, Icon.iconset, product_logo_{16,24,48,64,128,256}.png. product_logo_22_mono.png, product_logo.svg, AppIcon.icon (Icon Composer) NOT replaced.
- chromium_strings.grd: 640 text lines "Chromium"->"Orbit" (kept "Chromium Authors/OS"). Non-English translations will fall back to English.
- Build OK (-j 6). Output app is now out/Default/Orbit.app. Verified: bundle name Orbit, id com.songraphix.orbit, planet icon shown in macOS dialogs.
- NOT verified visually: Dock icon, About page (chrome://version) - screenshot was covered by another app.
- Note: new bundle id => macOS keychain prompt "Orbit wants to access Chromium Safe Storage" on first run; new profile dir may differ.
- Commit on my-browser. Patch exported to ~/dev/chromium/orbit_patches/. NOT pushed yet.
- Next: Phase 2 colours.

## Phase 2 — Colours: done
- ui/color/ref_color_mixer.cc: AddRefColorMixer now generates the default ref palette from Orbit seed #2f6b70 (TonalSpot) instead of the stock blue baseline; grayscale (incognito) keeps baseline; user-chosen theme colours still win. Retints frame/toolbar/tabs/omnibox/WebUI, light+dark, via the palette, no per-view hard-coding.
- Verified visually in dark mode (teal-tinted frame). Light mode not checked. Orbit's exact hexes (night #0c1f26 etc.) are approximated by the generated tones, not exact.
- Commit on my-browser.
