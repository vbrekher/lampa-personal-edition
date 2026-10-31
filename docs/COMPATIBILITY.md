# Compatibility and acceptance checklist

## Confirmed

- Upstream fork baseline: Lampa 3.x source at `3c658ffb4047d62a605389a1039281288836d6b8`.
- Personal-builder source tests: eleven tests, including configuration and synthetic ZIP packaging.
- GitHub Actions real compile smoke: Gulp compiled the copied upstream source, generated a WGT, and `unzip -tq` verified the archive.
- Personal app ID separate from original Lampa: `L4mpaPers0.LampaPersonal`.
- WGT excludes upstream remote `loader.js`.

## Not yet confirmed

| Surface | Status |
| --- | --- |
| Samsung Tizen 5.x physical device | Not tested |
| Samsung Tizen 6.x/7.x/8.x physical device | Not tested |
| Samsung UE43DU7100UXUA, Tizen 9 | Not tested for this Lampa fork |
| Apps2Samsung signing and real installation | Not tested |
| Remote-control focus and back navigation | Not tested |
| Live catalogue/metadata response | Not tested |
| HLS/AVPlay and codec playback | Not tested |
| Optional external TorrServer connection | Not tested |

The original Lampa source includes Tizen support and the WGT declares `required_version="5.0"`. This is a **target**, not proof of full compatibility.

## TV acceptance procedure

1. Enable Developer Mode on the TV and install the unsigned WGT via Apps2Samsung's re-signing workflow.
2. Verify launch icon, first screen, settings, navigation and app exit/back behavior.
3. Check catalogue loading and open a film/series page.
4. Check that the app does **not** fetch its core `app.min.js` from the public upstream Lampa loader.
5. Test actual media playback in an authorized source, tracking codec/container and TV model.
6. If using TorrServer, test both server reachability and playback behavior.
7. Rebuild with a different language and verify settings persist across restarts.
8. Verify original Lampa installation remains unaffected.

Send compatibility reports through a redacted GitHub issue. Never upload a personal WGT or authenticated media URL.
