# Orbit for Chromium

Orbit browser ported onto Chromium (159.0.8153.0). The Chromium tree is too large to host here, so this repo holds:

- `patches/`: our commits as `git format-patch` files. Apply in order with `git am` on a Chromium checkout at the matching revision.
- `orbit_assets/`: reference copy of Orbit's interface files for porting.
- `ORBIT_PORT.md`, `ORBIT_SPEC.md`, `ORBIT_PROGRESS.md`: plan, spec and running log.
