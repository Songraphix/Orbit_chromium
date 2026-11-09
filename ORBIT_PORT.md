# Orbit → Chromium Port: Instructions for Claude

You are helping port **Orbit**, a browser originally built with Electron, onto a custom Chromium build. Work through the phases below **one at a time**, in order. Stop at the end of each phase, report what you did, and wait for the user to say "continue" before starting the next one.

## Setup facts

- Machine: Mac mini M2, 16GB RAM, macOS, Apple silicon (arm64).
- Chromium source: `~/dev/chromium/src` (this folder, where you are running).
- Build folder: `out/Default` (already configured and built successfully once).
- Git branch for our work: `my-browser` (already created).
- Orbit (Electron) source: a folder named `Orbit` in the user's home area. Find it in Phase 0.

## Ground rules

1. **Never modify, move or delete anything in the Orbit folder.** Read it only. It is the reference design.
2. All changes happen inside `~/dev/chromium/src`, on the `my-browser` branch.
3. Build with: `autoninja -C out/Default chrome`
   If the build runs out of memory, use: `autoninja -C out/Default chrome -j 6`
4. Launch to test with: `open out/Default/Chromium.app` (the app name changes after branding; use whatever `.app` is in `out/Default`).
5. After each phase builds and runs correctly, commit: `git add -A && git commit -m "Orbit: <phase summary>"`
6. Do **not** run `gclient sync`, `git rebase`, `gn clean`, or delete `out/Default` without asking the user first.
7. Make the smallest change that does the job. Follow how existing Chromium code does the same thing; search the codebase for similar examples before writing new code.
8. Do **not** port any Electron-specific Google sign-in workarounds (user-agent spoofing etc.). Chromium handles Google sign-in on websites natively.
9. Keep a running log in `ORBIT_PROGRESS.md` (in this folder): what was done, files changed, problems, and what's next.
10. Keep `ORBIT_PORT.md`, `ORBIT_SPEC.md` and `ORBIT_PROGRESS.md` out of git by adding them to `.git/info/exclude`.
11. If a build fails, read the first real error (not warnings), fix it, and rebuild. If stuck after a few attempts, stop and explain the error to the user in plain language.

The user is new to Chromium development. Explain what you're doing in short, plain sentences.

---

## Phase 0: Study Orbit and write the spec

1. Find the Orbit folder:
   `find ~ -maxdepth 4 -type d -name "Orbit" -not -path "*/node_modules/*" 2>/dev/null`
   Show the result and confirm the right one with the user.
2. Read the Orbit project: `package.json`, the main process file, preload scripts, and all HTML/CSS/JS for the interface.
3. Write `ORBIT_SPEC.md` in this folder, covering:
   - **Branding:** name, icons (list file paths), colours (exact hex values), fonts.
   - **Layout:** tab strip, toolbar, address bar, sidebars, any custom panels; describe position and behaviour of each.
   - **Pages:** new tab page, settings, history, any other screens.
   - **Features:** everything Orbit does, one line each.
   - **Classification:** for each item, label it:
     - `BRANDING` (name, icons, colours),
     - `WEBUI` (built with HTML/CSS/JS, can be ported as a Chromium WebUI page),
     - `NATIVE` (browser frame parts: tabs, toolbar, omnibox; needs C++ Views code),
     - `SKIP` (already provided by Chromium, or Electron-only and not needed).
4. Copy (don't move) Orbit's interface files that are labelled `WEBUI` into `~/dev/chromium/orbit_assets/` for reference.
5. Add the three ORBIT_*.md files to `.git/info/exclude`.

**Stop and show the user the spec summary.**

---

## Phase 1: Branding

1. Edit `chrome/app/theme/chromium/BRANDING` to set the product name, short name and company name to Orbit's values (ask the user for the company name if not in the spec).
2. Replace the app icons in `chrome/app/theme/chromium/` (including the `mac/` folder) with Orbit's icons. Generate the required sizes and formats (`.icns`, `.png`) from Orbit's highest-resolution icon using `sips` and `iconutil`. Match the exact file names and sizes of the existing files.
3. Search for other places that must change for the name to show correctly (e.g. `chrome/app/chromium_strings.grd`), and update only what's needed.
4. Build, launch, and confirm the app name, Dock icon and About page show Orbit.
5. Commit.

**Stop and report.**

---

## Phase 2: Colours and theme

1. Study Chromium's colour pipeline (`ui/color/` and `chrome/browser/ui/color/`).
2. Apply Orbit's colours (from the spec) to the browser frame, toolbar, tab strip and omnibox, for both light and dark mode. Prefer changing colour mixers over hard-coding colours in individual views.
3. Build, launch, compare with Orbit, and adjust.
4. Commit.

**Stop and report.**

---

## Phase 3: New tab page (WebUI)

1. Read Chromium's WebUI documentation in `docs/` (search for files with "webui" in the name) and study a simple existing WebUI page as a model.
2. Create an Orbit new tab page as a WebUI page using the HTML/CSS/JS from `~/dev/chromium/orbit_assets/`. Strip out any Electron or Node APIs (`require`, `ipcRenderer`, `window.electron`, etc.); list in `ORBIT_PROGRESS.md` anything that needs a replacement, and implement replacements through proper WebUI handlers only if needed.
3. Make it the page shown for new tabs.
4. Build, launch, open a new tab, and confirm it looks and works like Orbit's.
5. Commit.

**Stop and report.**

---

## Phase 4: Other WebUI pages

Repeat the Phase 3 approach for each remaining item labelled `WEBUI` in the spec (e.g. settings panels, sidebars), **one page per round**, with a build, test and commit after each. Skip anything Chromium already provides (history, downloads, bookmarks) unless the user wants Orbit's version.

**Stop after each page and report.**

---

## Phase 5: Native UI changes (C++ Views)

1. For each item labelled `NATIVE` in the spec, find the relevant code under `chrome/browser/ui/views/` (e.g. `tabs/`, `toolbar/`, `location_bar/`, `frame/`).
2. Explain to the user what the change involves and how big it is **before** starting it.
3. Implement one feature at a time, with a build, test and commit after each.

**Stop after each feature and report.**

---

## When everything is done

Update `ORBIT_PROGRESS.md` with a final summary: what was ported, what was skipped and why, and any known issues. Tell the user they're ready to talk about the Windows build next.
