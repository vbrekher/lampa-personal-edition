# Localization implementation and verification

All 21 runtime locales contain the full 1,399-key canonical set. The 13 required WGT configurations pass packaging and all 21 locales pass both-resolution browser fixture checks. Native-speaker and physical Samsung acceptance remain external and NOT_RUN; this is not a claim of device certification.

Tested implementation: `792666ae1c36e25da59a672633001b48ddc409d3`. Browser evidence: [chromium](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41275375908); [webkit](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41275378832). Read [coverage](LANGUAGE_COVERAGE.md), [translation QA](TRANSLATION_QA.md), [visual results](UI_VISUAL_REPORT.md), [RTL](RTL_ACCEPTANCE.md), [regression](BUILD_REGRESSION.md), [Russian final report](FINAL_REPORT.md), and [hardware procedure](SAMSUNG_TIZEN_ACCEPTANCE.md).

```sh
npm ci --no-fund
npm run i18n:strict
npm run i18n:source-check
npm run test:personal
npm test -- --run
node tools/i18n-evidence.mjs --strict
npm audit --audit-level=low
npm run build:personal -- --language nl --plugins off
```

Generated evidence binds browser results to the runtime/build/QA input fingerprint; changed input bytes invalidate the saved proof. The exact source-candidate ledger also binds surrounding non-dictionary source bytes. Historical screenshots/checkpoints document earlier failures and intermediate builds; final acceptance uses the runs above and the 13-package SHA256 manifest, not those old screenshots. Draft JSON files are complete authoring mirrors; all 21 actual runtime JS files are shipped.
