# Plugin link review — 2026-11-01

This is the user-supplied candidate inventory, not a claim that streams or Tizen playback work. Links may change without notice. **Nothing here is installed automatically.**

## Verification legend

- **SOURCE_FOUND**: GitHub repository contains the referenced JavaScript file. Does not prove live TV/plugin/provider operation.
- **JS_RESPONSE**: web retrieval reached a JavaScript content type. The web tool does not execute or validate it.
- **LANDING_PAGE**: URL returned a webpage rather than an inspected plugin script.
- **UNVERIFIED**: endpoint could not be reliably fetched (including a web-tool `DisabledError`). This does **not** mean the link is dead.
- **HTTP_404 / HTTP_502**: HTTPS retrieval produced this status at check time; HTTP-only behavior may differ.
- **EXCLUDED**: platform mismatch, built-in functionality, insecure URL, or conflict with upstream security blacklist.
- **DISCUSSION_ONLY**: not an installable plugin URL.

## Parser and torrent helpers

| Candidate | What it does | Verification / decision |
|---|---|---|
| [etor](http://cub.red/plugin/etor) | Enables Parser/TorrServer menus on store-limited Lampa clients. | JS_RESPONSE; EXCLUDED. Our Personal Edition fixes the menus natively; redundant. |
| [TorrServer preload visualizer](https://plugin.rootu.top/ts-preload.js) | Shows torrent preloading progress for built-in TorrServer playback. | UNVERIFIED; not in curated catalogue. |
| [Torrent downloader discussion](https://t.me/lampa_plugins/1/327249) | Telegram instructions / link about torrent downloading. | DISCUSSION_ONLY; obtain a reviewed direct script before inclusion. |
| [LME plugins](https://teletype.in/@lme/pluginlists) | Index of torrent manager, public parsers, categories, radio, Shikimori, Trakt and other extensions. | LANDING_PAGE; evaluate scripts separately, not the index URL. |

## Online video integrations

| Candidate | What it does | Verification / decision |
|---|---|---|
| [BWA](http://bwa.ad/rc) | Online video source. | JS_RESPONSE via HTTPS redirect; curated using `https://bwa.ad/rc` (provider operation unverified). |
| [BWA new](https://app.bwa.ad/online.js) | Alternate/new BWA online source. | UNVERIFIED; do not treat as same version. |
| [Online Stream](http://arkmv.ru/vod) | Online video integration. | UNVERIFIED; web HTTPS attempt timed out, HTTP runtime unverified. |
| [Online Mod](https://nb557.github.io/plugins/online_mod.js) | Alternative online source. | JS_RESPONSE; curated, TV compatibility still unverified. |
| [Online Mod alternate](https://t.me/lampa_plugins/1/285026) | Telegram discussion of an alternative URL. | DISCUSSION_ONLY; no direct script to audit. |
| [MODS's](http://lampa.stream/modss) | Online video/balancers and other features. | LANDING_PAGE: HTTPS URL displayed installation instructions; script payload not inspected. |
| [SHOWY](http://showwwy.com/m.js) | Online video provider. | HTTP_502 on HTTPS request; not curated. |
| [SHOWY support](https://t.me/lampa_plugins/400231) | Telegram questions and support. | DISCUSSION_ONLY. |
| [Filmix](https://lampaplugins.github.io/store/fx.js) | Filmix content integration. | SOURCE_FOUND in `lampaplugins/store`; curated, media access unverified. |
| [Skaz](http://skaz.tv/onlines.js) | Online cinema integration. | UNVERIFIED; HTTP-only candidate. |
| [Z01](http://z01.online/live) | Online video integration. | UNVERIFIED; HTTP-only candidate. |
| [Z01 reserve](http://ru.z01.online/live) | Alternate endpoint for Z01. | UNVERIFIED; HTTP-only candidate. |
| [Smotret24 .ru](http://smotret24.ru/online.js) | Online video integration. | UNVERIFIED; HTTP-only candidate. |
| [Smotret24 .com](http://smotret24.com/online.js) | Alternate Smotret24 endpoint. | UNVERIFIED; HTTP-only candidate. |
| [WTCH / BWA replacement](http://wtch.ch/m) | Online video replacement. | HTTP_404 on HTTPS request; do not curate. |
| [Lumio](http://beta.mitsu.tv/plugins/lumio.js) | Online video provider. | UNVERIFIED; HTTP-only candidate. |
| [Alpac](https://beta.l-vid.online/on.js) | Online video provider. | UNVERIFIED. |

The catalogue only provides metadata for third-party providers, not streams, videos or service guarantees. Respect content rights and applicable law.

## Adult content — separate category, not default catalogue

| Candidate | What it does | Verification / decision |
|---|---|---|
| [e.xsena.red](http://e.xsena.red) | Adult-content extension/service. | UNVERIFIED, no clear script path; not included. |
| [BWA adult](http://bwa.ad/re) | Adult-content provider. | UNVERIFIED; not included. |

Do not display these in the mainstream “Popular” category.

## Platform, UI and troubleshooting

| Candidate | What it does | Verification / decision |
|---|---|---|
| [wsoff](http://plugin.rootu.top/wsoff.js) | Workaround for older Android “Request was denied for security” messages. | EXCLUDED on Tizen; HTTP-only and potentially masks security errors. |
| [not_mobile](https://nb557.github.io/plugins/not_mobile.js) | Restores remote-focused navigation if touch control was enabled by mistake. | UNVERIFIED; promising for Tizen, pending source/live check. |
| [reset_subs](https://nb557.github.io/plugins/reset_subs.js) | Resets native WebOS player subtitle preferences. | EXCLUDED for Samsung Tizen. |
| [want.js](http://github.freebie.tom.ru/want.js) | Restores legacy Favorites/Like/Later navigation. | UNVERIFIED; HTTP-only. |
| [anti.js](http://llpp.in/anti.js) | Removes trailers and adds YouTube. | EXCLUDED: upstream Lampa plugin blacklist includes `llpp.xyz`; this exact `llpp.in` host is separately unverified/insecure. |
| [ot.js](http://llpp.in/ot.js) | Removes Trailers and Anime sections. | UNVERIFIED and HTTP-only; not included. |
| [noanime.js](http://llpp.in/ur/noanime.js) | Hides Anime section. | UNVERIFIED and HTTP-only; not included. |
| [notrailer.js](http://llpp.in/ur/notrailer.js) | Hides Trailers section. | UNVERIFIED and HTTP-only; not included. |
| [skaz.tv/t.js](http://skaz.tv/t.js) | Attempts to restore posters. | UNVERIFIED and HTTP-only. |
| [rootu TMDB](https://plugin.rootu.top/tmdb.js) | Alternative poster/TMDB workaround. | UNVERIFIED; not curated without current diagnosis. |
| [VPN Checker](https://waversound.github.io/lampa-vpn-checker/vpn-checker.js) | Warns about a suspected active VPN. | SOURCE_FOUND at `waversound/lampa-vpn-checker`; curated with a network-privacy warning. |
| [Home Assistant Webhooks](https://fv.plymo.ru/p/wh.js) | Triggers Home Assistant automations from Lampa. | UNVERIFIED; privacy-sensitive, needs code audit and exact scope review. |
| [External keyboard](https://fv.plymo.ru/p/kb.js) | Offers phone/QR-based text entry for TV. | UNVERIFIED; input/privacy-sensitive, needs code audit. |
| [Auto Skip Intro](https://vahagn-99.github.io/lampa-auto-skip/init.js) | Skips intros, recaps and credits where detected. | SOURCE_FOUND at `Vahagn-99/lampa-auto-skip`; curated; real-device QA pending. |
| [Simkl](https://entropious.github.io/lampa-simkl/simkl.js) | Synchronizes watch status/history with Simkl. | SOURCE_FOUND at `entropious/lampa-simkl`; curated; requires account consent. |
| [TV plugin discussion](https://t.me/lampaiptv) | Community discussion. | DISCUSSION_ONLY. |

## Inclusion policy

Six reviewed-link candidates are in `src/interaction/extensions/personal_catalog.js`: BWA, Online Mod, Filmix, Auto Skip, VPN Checker and Simkl. “Reviewed” here means **script response or source presence only**. The catalogue is bundled as metadata with no third-party JavaScript execution until an explicit install decision. No claim of end-to-end playback or Samsung validation is made.

Before promoting any other candidate, verify HTTPS status and JavaScript content, provenance/update history, Tizen compatibility, CORS/mixed-content behavior, and run a smoke test on a physical TV. Blocklists must not be bypassed silently.
