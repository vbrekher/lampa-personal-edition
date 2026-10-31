# Localization audit and repair checkpoint

This is an **incomplete implementation**, not the requested multilingual release. Eight new locales remain unpublished drafts. No physical Tizen or native-speaker acceptance is claimed.

Baseline: `ac3c18df` on `main`. Audit date: 2026-11-01 (Europe/Kyiv).

Read [coverage](LANGUAGE_COVERAGE.md), [translation QA](TRANSLATION_QA.md), [visual evidence](UI_VISUAL_REPORT.md), [RTL acceptance](RTL_ACCEPTANCE.md), [build regression](BUILD_REGRESSION.md), and [remaining work](FINAL_REPORT.md).

Reproduce with Node.js >=22 and npm >=10:

```sh
npm install --no-fund
npm run test:personal
npm run i18n:report
node tools/i18n-evidence.mjs
node tools/i18n-evidence.mjs --strict # expected exit 1: incomplete translations
npm audit --audit-level=low
npm run build:personal -- --language en --plugins off
unzip -tq dist/Lampa-Personal-Edition.wgt
```

CI uploads generated `reports/localization/` as `localization-evidence`. It contains 21 individual JSON reports, a summary, source locations, dynamic calls and hardcoded-text review queues. Generated reports are not embedded in WGT. A green builder job is not multilingual release approval. The strict translation gate remains failing; no checks were weakened to manufacture completion.
