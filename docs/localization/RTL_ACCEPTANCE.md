# RTL browser acceptance

| Locale | Root/layout/font | Physical arrows and 10-card scrolling | Exact URL keyboard/save | Video pause/seek/quality | Physical Samsung |
|---|---|---|---|---|---|
| ar | PASS | PASS | PASS | PASS | NOT_RUN |
| ur | PASS | PASS | PASS | PASS | NOT_RUN |
| he | PASS | PASS | PASS | PASS | NOT_RUN |

Both Chromium and WebKit passed on source `792666ae1c36e25da59a672633001b48ddc409d3` ([chromium](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41275375908); [webkit](https://github.com/vbrekher/lampa-personal-edition/actions/runs/41275378832)). Each locale additionally has 28 visual scenes per engine and participates in real settings/reload persistence. Local Noto Arabic/Hebrew faces are verified loaded; glyph/shaping tables and byte-exact packaging are tested.

Layouts mirror sidebars, settings/selection panels, spacing and directional navigation arrows. Remote left/right keys follow actual screen geometry; there is no global key swap. Technical addresses/codes/times are LTR-isolated, URL editors stay LTR, native text inputs use automatic content direction. Media timeline/control order remains chronologically LTR; the video-control test navigates by actual button rectangles. Video, posters, QR images and caption content are not globally mirrored.

Native grammar/style certification, physical Samsung fonts/remote/AVPlay and hardware-specific rendering: NOT_RUN. See [hardware acceptance](SAMSUNG_TIZEN_ACCEPTANCE.md).
