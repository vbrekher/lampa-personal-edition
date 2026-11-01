# Final browser fixture matrix

Source `792666ae1c36e25da59a672633001b48ddc409d3`. [chromium](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41275375908); [webkit](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41275378832).

Each engine passed **588/588 visual cases**: 21 locales × 14 actual application scenes × 2 resolutions. This includes the mandatory 13-locale **364/364** subset and 224 legacy-locale regression cases. Across Chromium and WebKit: **1,176 real application screenshots**, plus structured visible-text/font/overflow/technical-value assertions. Each saved PNG was independently checked for the exact expected dimensions and SHA256.

Scenes: first launch, home, movie, series, search, filters, settings, parser, TorrServer, player, subtitles settings, plugins, modal, errors. Resolutions: 1920×1080 and 3840×2160. Checks require the target in the viewport, correct root language/direction, no unexpected page exceptions, no unresolved template tokens, no critical inspected-label overflow, the expected loaded local font and decoded video readiness. RTL error screens verify the literal IP address is isolated LTR.

Each engine also passed 13 functional cases: all-21-language settings/reload persistence, first-launch selection, three physical-arrow/card-scroll regressions, three exact URL-keyboard/save regressions, and five actual-video remote pause/resume/seek/quality-change regressions. Total: **601/601 per engine**.

These are screenshots of the real compiled WGT interface, with deterministic ten-card/asymmetric-poster, movie/series, error and local H.264 fixtures. They are not UI mockups, live TMDB/TorrServer/provider validation, audio-bearing stream validation or physical TV captures. External endpoints are blocked in the repeatable matrix. Fixture injection and its test files are absent from the WGT.

Earlier defects were fixed and rerun: stale home language/title, Hebrew LTR root/layout, RTL scrolling, URL direction, immediate Enter after keyboard typing, damaged binary fonts, missing Chinese glyph coverage, copied plugin descriptions, raw source diagnostics, wrong port/player/watch/application terminology, and ad SDK asset/failure handoff. Intermediate failed/superseded runs are not counted as final acceptance.
