# Product Experience 2.0 verification

Version 0.2.0 is a release candidate, prepared in a separate PR over merged PR #5. No release, merge, physical Samsung certification or public Pages deployment is implied.

## Executed checks

[Product run 41300370484](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41300370484), source `24c7e622cb1532d1e860aec334309c396224db4b`, passed on macOS and Linux with Node.js 22. Each platform passed 70 personal tests, an actual CLI WGT build and all four browser scenario groups. [Existing verification](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41300370409) also passed.

Local clean installation and existing checks passed: 70 personal tests; 103 application tests in 11 suites; strict validation of 21 dictionaries; source check with zero unclassified candidates; npm audit with zero vulnerabilities; 77 product documentation/asset links.

The browser groups exercise first launch and all 21 language choices, search and RTL, EN/RU/NL Builder translations, empty/valid HTTP/HTTPS/invalid server addresses, three parser modes, default-off plugins and consent, review edits, a real cancellation, an intentionally invalid source compilation followed by recovery, two successful visual builds, download SHA-256/ZIP validation, all 21 dictionary bytes, reload attachment and mobile/static-preview boundaries. The deliberately changed test module is restored in `finally`.

Personal tests additionally cover strict loopback Host/Origin/session validation, bounded input, fixed file access, cross-process locks, process cancellation and sanitized diagnostics. A failed/cancelled build preserves the previous successful WGT. Downloads use a private per-job snapshot created under the build lock.

## Reproduce

Use macOS or Linux with Node.js 22+, npm, zip and unzip:

```sh
npm ci
npm run test:personal
npm run i18n:strict
npm run i18n:source-check
npm test -- --run
npm audit --audit-level=low
npm run site:prepare
npm run site:check
npx playwright install --with-deps chromium
npm run build:personal -- --language nl --plugins off
npm run test:builder
```

The browser failure test temporarily changes one source file: run it in an isolated checkout with no concurrent editor or build. CI does so. Reports and screenshots are retained for seven days; WGT files and personal configuration are excluded. The final PR check must also pass after packaging these documentation and screenshot updates.

## Visual evidence and boundaries

[Capture provenance](../site/assets/SCREENSHOTS.md) distinguishes the real desktop Lampa interface, actual local Builder compilation and explicitly labelled static/mobile preview. No QA poster fixture is used for advertising. Selected compressed screenshots are in the site; full captures remain Actions artifacts.

| Screen | Actual capture |
|---|---|
| Welcome | [Open](../site/assets/builder-welcome.png) |
| 21 languages | [Open](../site/assets/builder-language.png) |
| TorrServer | [Open](../site/assets/builder-torrserver.png) |
| Plugins | [Open](../site/assets/builder-plugins.png) |
| Compilation | [Open](../site/assets/builder-building.png) |
| Verified WGT | [Open](../site/assets/builder-ready.png) |
| Arabic / Urdu / Hebrew previews | [Arabic](../site/assets/builder-rtl-ar.png), [Urdu](../site/assets/builder-rtl-ur.png), [Hebrew](../site/assets/builder-rtl-he.png) |
| Real Lampa desktop interface | [Open](../site/assets/lampa-interface.jpg) |

Application language dictionaries, local fonts and TV RTL implementation are preserved from main; no repeated mass translation audit was performed. Windows, physical Samsung installation, firmware, remote control and live provider playback are NOT_RUN. Pages contains only static assets and an honest demo; maintainers enable Pages after merge. The local visual wizard and CLI share the same compiler API. Third-party plugins require explicit consent and are never installed during compilation.
