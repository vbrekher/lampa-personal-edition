# Visual WGT Builder

Start with `npm run builder` after `npm ci`. Keep the terminal open while building. The browser uses the loopback address printed by the server. English, Russian and Dutch are complete **Builder** interface choices; they are independent of the TV's language.

## 1. Welcome

The server checks Node.js 22+, npm, primary build dependencies, ZIP tools, source directories and supported host platform. Failed checks include recovery instructions. Use **Check again** after fixing your environment. The static website preview does not run these checks or compile packages.

## 2. TV language

Search by native name, English name or language code. Tab reaches the choices; arrow keys move within the grid, and Enter/Space selects a language. Arabic, Urdu and Hebrew show a real preview of translated labels and right-to-left direction. The preview is a small component, not a running TV app.

All 21 full dictionaries remain inside every WGT. You can change language again in Lampa Settings.

## 3. TorrServer

Choose no server or enter HTTP(S), for example `http://192.168.1.100:8090`. Credentials, query strings, fragments and whitespace are rejected by the shared CLI normalizer. The Builder never contacts that address. HTTP is unencrypted; use it only on a trusted home network.

TorrServer itself runs separately. Missing server configuration does not prevent building. Enter any provider credentials in the TV app, where that integration supports them; the wizard does not collect secrets.

## 4. Parser

Choose Jackett, Prowlarr or TorrServer. These are the existing parser mode identifiers, not supplied hosted services. You must configure your own compatible server/indexers and have a playable source. All related settings remain available on the TV.

## Plugins

The catalogue contains metadata about integrations such as BWA Online, Online Mod, Filmix, Auto Skip Intro, VPN Checker and Simkl Watch Tracking. Listing an extension does not install it or verify its current service.

Third-party JavaScript is disabled by default. To enable it, select **Allow third-party plugins** and acknowledge its access to app data and external services. The API independently requires that acknowledgement. The existing per-installation confirmation on the TV is preserved. No plugin is fetched or executed during the build.

## 6. Advanced

Review the actual TV language, server, parser and plugin policy. Edit links return to the relevant step. The app ID `L4mpaPers0.LampaPersonal` is read-only.

On a new installation, the interface language seeds the initial TMDB metadata language. Existing TV metadata preferences are preserved. Set metadata/search/audio/subtitle language independently in the TV app. There is no nonfunctional metadata toggle in the wizard.

## 7. Review

Check every preference and copy the equivalent CLI command if useful. It includes your server address, but never a password or token. Do not post personal commands publicly.

## 8. Building

Stages come from the shared engine: preparing source, compiling the application, checking dictionaries/fonts, applying configuration, creating WGT, verifying the archive and completion. No invented percentage is shown.

Cancel terminates the actual compiler/process group, waits for cleanup and releases the checkout's build lock. Failed/cancelled builds leave the last successful output intact. Retry returns to review. Technical diagnostics are available separately; the normal UI presents an actionable explanation.

Keep the terminal running. Ctrl+C triggers graceful cancellation and shutdown. An uncatchable termination, such as power loss, may leave a stale lock; see [Troubleshooting](TROUBLESHOOTING.md).

## 9. Ready

Download the current job's WGT, open the output folder, copy its SHA-256 or build another configuration. Reloading the page reconnects to a running or completed job while the local server is alive. Preferences are kept in the tab, not a cloud account or saved profile. A fresh browser session can use a completed artifact but starts a new form with safe defaults.

`dist/Lampa-Personal-Edition.wgt` is the local output. A private per-job copy prevents another CLI build from changing the file behind your download. That temporary download copy is removed at shutdown; the `dist/` output remains. Packages are unsigned. [Install separately](INSTALLATION.md).

## CLI compatibility

```bash
npm run build:personal -- --language en --parser jackett --plugins off
npm run build:personal -- --builder-language nl --language nl --plugins off
```

The wizard and CLI call `buildPersonal()` from `personal/engine.mjs` and use `normalizeSettings()` from `personal/lib.mjs`. There is no second compiler. Both modes use the same per-checkout lock and atomic final write.

## Terminal question reference

The optional interactive CLI retains these English prompts:

```text
Lampa interface language [nl/de/tr/en/zh/hi/es/ar/fr/bn/pt/id/ur/ru/uk/be/bg/cs/he/pl/ro] (Enter=en):
TorrServer URL (optional; Enter to skip):
Parser backend [jackett/prowlarr/torrserver] (Enter=jackett):
Enable third-party plugins? [y/N]:
```
