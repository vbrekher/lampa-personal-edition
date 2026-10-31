# Frequently asked questions

### Do I need to host Lampa myself?

**No.** Lampa's application code is packaged in your own WGT. The app still uses external services for catalogue/metadata and optional playback sources.

### Do I need a TorrServer?

No. Leave the URL empty to create a Lampa catalogue build. If you want TorrServer functionality, run TorrServer separately on a machine reachable by the TV and enter its URL at build time.

### Can I install it alongside the original Lampa?

The personal WGT declares a different Tizen app ID: `L4mpaPers0.LampaPersonal`. The installation is intended not to overwrite the original application.

### Can I install a prebuilt WGT from GitHub Releases?

There are no preconfigured user binaries. Clone the source and build your own. Generated WGT files are not distributed by the maintainer.

### Does the WGT contain my password?

The current builder **does not ask for or embed account passwords**. It does embed the optional TorrServer URL and selected settings, in readable form. Never include credentials in the URL.

### Why are plugins disabled?

Plugins can load remote JavaScript that may change app behavior, access settings or contact third-party services. This project disables them by default; `--plugins on` enables the original Lampa plugin capability but not the upstream plugin store.

### Can I use a server on Bunny?

Yes, as long as the service is reachable with a valid HTTP(S) URL and is compatible with Lampa's TorrServer connection. **Bunny is never required**.

### What about Media Station X?

This package creates a direct Tizen WGT for Lampa, not a Media Station X portal. It doesn't install or modify the Media Station X application.

### Does this automatically start a torrent server on my TV?

No. A WGT web application is not a replacement for TorrServer's engine. Host your own server separately.

### Is the TV model verified?

No actual Samsung Tizen installation/playback acceptance has yet been recorded for this fork. The CI smoke test verifies source compilation and ZIP structure, not TV playback. See [Compatibility](COMPATIBILITY.md).

### Can I build on Windows?

Windows Subsystem for Linux 2 might work with the required tools, but it is not verified as a supported build platform.

### Is Lampa Personal Edition the official Lampa?

No. It is an independent GPL-source fork with its own personal builder. Original Lampa is [yumata/lampa-source](https://github.com/yumata/lampa-source).
