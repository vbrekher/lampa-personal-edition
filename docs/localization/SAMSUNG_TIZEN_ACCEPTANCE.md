# Physical Samsung acceptance procedure

Physical Samsung QA and native Tizen emulator QA: **NOT_RUN**. Desktop Chromium/WebKit and mocked AVPlay lifecycle tests are software regression evidence; neither proves firmware-specific playback, installation/signing or physical remote behavior.

Use a package from the final 13-build manifest, record its SHA256, TV model, firmware, Tizen version, display resolution/scaling, input device and network configuration. Generic deliverables have no server, credentials or installed third-party plugins. They are unsigned archives; installation/signing is handled separately with Apps2Samsung or the Samsung developer tools.

1. Install alongside the original Lampa using the separate app ID `L4mpaPers0.LampaPersonal`. Verify the first-launch chooser preselects the builder language and confirms with OK.
2. For every one of the 21 languages, verify home, movie, series, search, filters, settings, parser, TorrServer, player, subtitles, plugins, modal and error screens. Repeat at Full HD and 4K where the hardware permits; record screenshots of the real app.
3. For Arabic, Urdu and Hebrew, verify root direction, sidebar on the right, physical arrows, scrolling through ten cards and returning, readable shaping/diacritics and focus visibility. Confirm posters, video, QR codes and subtitles are not visually mirrored.
4. Enter/correct/copy an ASCII URL, IPv4 address, port and path in each RTL locale. Verify exact stored bytes and visible left-to-right order. Also enter native search text; verify keyboard layout and Unicode.
5. Keep metadata/search/audio/subtitle language preferences different from the interface language. Add bookmarks, play partially, edit server/parser and plugin settings, change interface language, restart and power-cycle. Confirm all independent settings and progress remain intact.
6. With your own reachable TorrServer/parser, check authentication/error states, movie and episode lookup, startup, seeking, pause/resume, quality/audio/subtitle selection, ASS shaping, external player handoff and cancellation. Test missing server, refusal, timeout and reconnection. Record actual integrations and versions rather than assuming plugin availability.
7. Exercise home/background/foreground and standby while AVPlay plays, pauses and restores. Confirm no AVPlay call during restore, no duplicate player instances, and usable recovery after restore failure. Test a second playback after closing the first.
8. Install a third-party plugin only after its explicit consent flow, then disable/remove it and verify persistence. Treat the offline catalogue's descriptions as integration metadata; each provider's current service/playback needs separate testing.

Acceptance records must distinguish PASS, FAIL and NOT_RUN per device/language/scenario. A failure requires a fix and rerun; absent hardware/native editors must not be represented as passing.
