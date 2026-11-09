# Orbit for Chromium

Orbit browser ported onto Chromium (159.0.8153.0). The Chromium tree is too large to host here, so this repo holds:

- `patches/`: our commits as `git format-patch` files. Apply in order with `git am` on a Chromium checkout at the matching revision.
- `orbit_assets/`: reference copy of Orbit's interface files used for the port.
- `ORBIT_PORT.md`, `ORBIT_SPEC.md`, `ORBIT_PROGRESS.md`: plan, spec and the full running log (what works, what was verified, what is not built).

## What is in the build

Branding (Orbit), teal palette, vertical-tab sidebar on by default, Orbit new tab page (clock, widgets, command palette, voice button), and Orbit pages at `chrome://orbit-newtab/pages.html#<name>`:
projects, notes, tasks, easels, focus, toolkit, library, settings, assistant (your Anthropic key), spaces (tab groups), tidy (AI tab grouping), boosts (per-site CSS/JS), archive (closed tabs), clipboard.
Native pieces: tab-group handler, split-view action, browser-side fetch handler (allowlisted hosts), Boosts tab helper.

See `ORBIT_PROGRESS.md` for the honest list of what is not built yet.
