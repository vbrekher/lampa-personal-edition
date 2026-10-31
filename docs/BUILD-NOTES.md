# Technical build notes — v0.1.0

**Source baseline:** fork of [yumata/lampa-source](https://github.com/yumata/lampa-source) 3.x, created from upstream commit `3c658ffb4047d62a605389a1039281288836d6b8` (2026-10-30). Do not silently mix binaries from public Lampa mirrors with this build.

## Build pipeline

1. Clone the source, install npm dependencies locally.
2. The personal builder copies `src/`, `public/` and `index/` into an isolated temporary directory.
3. It patches only staged versions of `gulpfile.js`, `src/services/libs.js` and `src/core/manifest.js`: fixes early Gulp callback, loads packaged libraries, and resolves application assets from local paths.
4. It runs a **non-watching** Gulp `personal_tizen` job and validates key files.
5. It replaces the upstream remote `loader.js` in the staged Tizen index with `personal-config.js` and `app.min.js`.
6. It writes its own `config.xml` (app ID `L4mpaPers0.LampaPersonal`) and icon, packages ZIP-compatible WGT, runs `unzip -tq`.
7. It removes the temporary directory. Original source files remain untouched.

## Safeguards and gaps

- URL input allows only HTTP/HTTPS without credentials, query strings or URL fragments.
- Personal build is self-contained for main app assets, but third-party metadata/provider calls **still happen**.
- Default disables remote configuration and CUB account integration, with third-party plugin use off.
- Gulp and manifest patch functions **fail closed** if the expected upstream code changes.
- The builder's terminal language (`en`, `ru`, `nl`) is independent of the original Lampa TV interface language; the TV interface currently has no `nl` translation.
- The WGT is unsigned until Apps2Samsung re-signs as appropriate.
- Unit packaging tests exercise a synthetic fixture; CI also attempts a **real source build**. Neither is equivalent to testing the app on Samsung.
- Upstream source and dependencies may change; keep the pinned baseline and document upgrades.
- No on-device proof of install, menu, catalogue, AVPlay, codecs or remote control has yet been recorded.

## Legal and content boundaries

This fork does not ship movies, third-party streaming links, piracy plugins or a torrent server. The user's TorrServer is independent. Original Lampa is maintained by Yumata; this repo preserves upstream copyright/attribution. `LICENSE` is GPL v2 while upstream `package.json` says ISC: verify against rights holders before claiming a final redistributable product license.
