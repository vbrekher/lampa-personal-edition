# Final software build and regression results

Tested source `792666ae1c36e25da59a672633001b48ddc409d3`; Node.js 22.22.1/npm 10.9.4 locally, Node.js 22 in CI. Lockfile is tracked and CI uses npm ci.

| Check | Result | Scope |
|---|---|---|
| i18n:strict | PASS | 21 × 1,399 complete own dictionary values |
| i18n:source-check | PASS | 1,344 current candidates / 88 dynamic calls; zero unclassified; all 1,601 baseline candidate resolutions retained |
| test:personal | 65/65 | CLI, packaging, configuration preservation, fonts, direction, dictionary/source validation, SDK-failure handoff |
| npm test -- --run | 103/103 | 11 existing unit suites, including Tizen lifecycle, tracks, episodes, timeline/bookmarks and preload timeouts/cancellation |
| npm audit | PASS | 0 vulnerabilities |
| Chromium | 601/601 | 588 visual + 13 functional fixture cases |
| WebKit | 601/601 | Same cases and resolutions |
| Independent WGT builds | 13/13 | nl/de/tr/en/zh/hi/es/ar/fr/bn/pt/id/ur |
| WGT ZIP/entry assets/config/font bytes | PASS | All 13 archives; no remote app loader and no injected QA code |
| Physical Samsung / native Tizen emulator | NOT_RUN | External hardware/platform acceptance |
| Live user server / third-party provider playback | NOT_RUN | Requires actual user integration endpoints |
| Native editorial review | NOT_RUN | Separate linguistic acceptance |

All packages contain every one of the 21 locales. Only initial language differs; no server address, credentials or installed third-party plugins are embedded. Packages are unsigned; SHA256 and settings are in the delivered manifest. Source and runtime/build fingerprints bind the package proof to the inspected input bytes. Final attempts supersede older builds interrupted by context review or local disk exhaustion.

Fixture tests execute production settings, catalog/card, filter, modal, keyboard and player components; AVPlay is mocked separately in lifecycle tests. Preserved storage includes a bookmark added through the real UI, playback-state records, parser/server, plugins and independent metadata language while switching/reloading through all 21 locales. This does not claim physical reboot persistence or real external audio/subtitle/provider acceptance.
