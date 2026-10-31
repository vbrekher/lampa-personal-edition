# Build and regression checkpoint

Local runtime: Node.js 22.22.1, npm 10.9.4, macOS. The host default Node.js 20 was not used for verification.

| Check | Result | Scope |
|---|---|---|
| npm install --no-fund | PASS | Current resolved tree; existing repo does not track lockfile |
| npm audit --audit-level=low | PASS | 0 vulnerabilities; 465 dependencies reported |
| npm run test:personal | PASS | 43 tests |
| npm run i18n:report | PASS | Reporting command; translations remain incomplete |
| node tools/i18n-evidence.mjs --strict | FAIL (expected) | Release completeness is not achieved |
| English WGT compile, plugins off | PASS | Real upstream Gulp compilation |
| unzip -tq | PASS | Generic English WGT |
| Other 12 target-language builds | NOT_RUN | Eight locales are rejected while unpublished |
| Browser home/settings | Partial observation | Desktop browser only |
| Parser/TorrServer settings entry visibility | PASS | Observed in English/Hebrew with no server address |
| Actual parser/TorrServer/player operation | NOT_RUN | No configured server or playback acceptance |
| Full application regression | NOT_RUN | Unit tests do not cover the entire product |

The WGT is a local smoke artifact and is not published. Third-party JavaScript installation confirmation is preserved; no plugin was installed during browser testing. New dependencies and source tools are development-only and not packaged by the Personal builder.
