# Compatibility matrix

Product Experience 2.0 separates the local build host from the TV runtime. A successful archive is not hardware certification.

| Component | Target / verification scope |
|---|---|
| Visual Builder host | macOS and Linux; Node.js 22+, npm, zip/unzip |
| CLI host | Same shared engine and host requirements |
| Browser E2E | Chromium on macOS and Linux; real compilation, cancellation, failure/recovery and downloads |
| Windows / WSL | Not verified; no native Windows support claim |
| WGT platform | Tizen TV profile, `required_version="5.0"` |
| Application ID | `L4mpaPers0.LampaPersonal`; separate from upstream Lampa |
| Languages | All 21 full dictionaries in every WGT; ar/ur/he RTL retained |
| Signing | Unsigned output; appropriate signing/re-signing required at installation |
| Physical Samsung installation / firmware / remote / AVPlay | Not certified by this project |
| Live user TorrServer / parser / provider playback | Requires your own integration acceptance |

The merged localization baseline has desktop Chromium/WebKit fixture evidence. This PR preserves the application dictionaries and RTL source instead of repeating the full localization audit. New tests cover the Builder and actual package output on both build-host platforms. Exact CI runs and results are recorded in the PR and product verification report.

## Report a device result

Record TV model, firmware, Tizen version, resolution, installation/signing method and the WGT SHA-256. Check launch, all relevant settings, actual remote navigation, standby/restore and your authorized playback source, including codecs/audio/subtitles. Rebuild and verify update behaviour. Distinguish PASS, FAIL and NOT_RUN per scenario.

Use a redacted issue. Do not include a personal WGT, passwords, certificate, authenticated URL or private server address. The [physical device procedure](localization/SAMSUNG_TIZEN_ACCEPTANCE.md) remains available.
