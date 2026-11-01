# Contributing

Thank you for improving Lampa Personal Edition. Keep changes focused, preserve the original Lampa functionality and attribution, and explain the user-visible result.

- **Translation:** follow [Improve a Translation](docs/LOCALIZATION_GUIDE.md) and use the translation PR template.
- **Builder:** start with `personal/server.mjs`, `personal/web/` and the shared `personal/engine.mjs` API. Keep the CLI on that same engine.
- **Product page:** edit `site/`; regenerate the explicit static wizard preview with `npm run site:prepare`.
- **TV compatibility:** report the actual model, firmware, Tizen version and scenario. Do not generalize a desktop browser result into hardware certification.

## Development

Use Node.js 22+ on macOS or Linux. Install dependencies with `npm ci`. Start the visual builder with `npm run builder`. The old CLI remains `npm run build:personal`.

```bash
npm run test:personal
npm run i18n:strict
npm run i18n:source-check
npm test -- --run
npm audit --audit-level=low
```

For wizard changes, also run `npx playwright install chromium`, build a generic WGT using the CLI, then `npm run test:builder`. The E2E tests exercise real cancellation, compilation failure, recovery and two successful builds. One test temporarily edits an upstream module and restores it in `finally`; use an isolated checkout and do not run those tests alongside your own active build.

The CI matrix runs the Builder browser tests on macOS and Linux, retains screenshot/test evidence for seven days and never uploads `dist/` or personal WGTs. A translation-only PR uses fast gates; see the localization guide for targeted visual verification.

## Security and privacy

Keep the server loopback-only. Preserve Host/Origin checks, session protections, fixed path boundaries, explicit plugin consent and the cross-process build lock. Do not introduce a shell endpoint, arbitrary local file downloads, cloud compilation or configuration telemetry.

Do not upload a personal WGT, authenticated URL, password, token, certificate or copyrighted video. Use credential-free examples and synthetic test data where appropriate, clearly labelled as fixture/demo. Preserve all original Lampa copyright and license notices; this fork does not relicense upstream code.

## Pull requests

Branch from current `main`. Describe the problem, final behaviour, relevant tests and any actual limits. Add before/after screenshots for visual changes. Physical TV testing is welcome but is not required for an isolated wording or Builder-only change; explicitly say when it was not performed.
